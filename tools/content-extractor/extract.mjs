#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_INPUT = "index.html";
const DEFAULT_OUTPUT_DIR = "artifacts/content-audit";

const [inputArg = DEFAULT_INPUT, outputArg = DEFAULT_OUTPUT_DIR] = process.argv.slice(2);
const inputPath = path.resolve(process.cwd(), inputArg);
const outputDir = path.resolve(process.cwd(), outputArg);

function decodeEntities(value) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function normalizeWhitespace(value) {
  return decodeEntities(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getAttribute(attributes, name) {
  const expression = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = expression.exec(attributes);
  return match ? decodeEntities(match[1] ?? match[2] ?? match[3] ?? "") : null;
}

function hasAttribute(attributes, name) {
  return new RegExp(`(?:^|\\s)${name}(?:\\s|=|$)`, "i").test(attributes);
}

function collectTagPairs(html, tagName) {
  const expression = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  return [...html.matchAll(expression)].map((match, index) => ({
    index,
    attributes: match[1] ?? "",
    html: match[2] ?? "",
    text: normalizeWhitespace(match[2] ?? ""),
  }));
}

function collectVoidTags(html, tagName) {
  const expression = new RegExp(`<${tagName}\\b([^>]*)>`, "gi");
  return [...html.matchAll(expression)].map((match, index) => ({
    index,
    attributes: match[1] ?? "",
    raw: match[0],
  }));
}

function collectHeadings(html) {
  const expression = /<(h[1-6])\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  return [...html.matchAll(expression)].map((match, index) => ({
    index,
    level: Number(match[1].slice(1)),
    id: getAttribute(match[2] ?? "", "id"),
    text: normalizeWhitespace(match[3] ?? ""),
  }));
}

function collectLinks(html) {
  return collectTagPairs(html, "a").map(({ index, attributes, text }) => ({
    index,
    href: getAttribute(attributes, "href"),
    text,
    title: getAttribute(attributes, "title"),
    target: getAttribute(attributes, "target"),
    rel: getAttribute(attributes, "rel"),
    ariaLabel: getAttribute(attributes, "aria-label"),
  }));
}

function collectImages(html) {
  return collectVoidTags(html, "img").map(({ index, attributes }) => ({
    index,
    src: getAttribute(attributes, "src"),
    srcset: getAttribute(attributes, "srcset"),
    alt: getAttribute(attributes, "alt"),
    title: getAttribute(attributes, "title"),
    width: getAttribute(attributes, "width"),
    height: getAttribute(attributes, "height"),
    loading: getAttribute(attributes, "loading"),
    decoding: getAttribute(attributes, "decoding"),
  }));
}

function collectMeta(html) {
  const title = collectTagPairs(html, "title")[0]?.text ?? null;
  const metas = collectVoidTags(html, "meta").map(({ attributes }) => ({
    name: getAttribute(attributes, "name"),
    property: getAttribute(attributes, "property"),
    content: getAttribute(attributes, "content"),
  }));
  const links = collectVoidTags(html, "link").map(({ attributes }) => ({
    rel: getAttribute(attributes, "rel"),
    href: getAttribute(attributes, "href"),
    hreflang: getAttribute(attributes, "hreflang"),
  }));

  return {
    title,
    description: metas.find((item) => item.name?.toLowerCase() === "description")?.content ?? null,
    canonical: links.find((item) => item.rel?.toLowerCase() === "canonical")?.href ?? null,
    openGraph: Object.fromEntries(
      metas
        .filter((item) => item.property?.toLowerCase().startsWith("og:"))
        .map((item) => [item.property, item.content]),
    ),
    twitter: Object.fromEntries(
      metas
        .filter((item) => item.name?.toLowerCase().startsWith("twitter:"))
        .map((item) => [item.name, item.content]),
    ),
    alternates: links.filter((item) => item.rel?.toLowerCase() === "alternate"),
  };
}

function collectSections(html) {
  const expression = /<(section|article|main|header|footer|nav|aside)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  return [...html.matchAll(expression)].map((match, index) => {
    const innerHtml = match[3] ?? "";
    const headings = collectHeadings(innerHtml);
    return {
      index,
      tag: match[1].toLowerCase(),
      id: getAttribute(match[2] ?? "", "id"),
      ariaLabel: getAttribute(match[2] ?? "", "aria-label"),
      heading: headings[0]?.text ?? null,
      headingLevel: headings[0]?.level ?? null,
      textPreview: normalizeWhitespace(innerHtml).slice(0, 280),
      linkCount: collectLinks(innerHtml).length,
      imageCount: collectImages(innerHtml).length,
    };
  });
}

function collectScripts(html) {
  return collectTagPairs(html, "script").map(({ index, attributes, html: body }) => ({
    index,
    src: getAttribute(attributes, "src"),
    type: getAttribute(attributes, "type"),
    async: hasAttribute(attributes, "async"),
    defer: hasAttribute(attributes, "defer"),
    dataDcScript: hasAttribute(attributes, "data-dc-script"),
    inlineLength: body.trim().length,
  }));
}

function collectStructuredData(html) {
  return collectTagPairs(html, "script")
    .filter(({ attributes }) => getAttribute(attributes, "type")?.toLowerCase() === "application/ld+json")
    .map(({ html: body }, index) => {
      try {
        return { index, valid: true, value: JSON.parse(body) };
      } catch (error) {
        return { index, valid: false, error: error.message, rawPreview: body.trim().slice(0, 240) };
      }
    });
}

function collectInlineStyles(html) {
  const styleBlocks = collectTagPairs(html, "style");
  const styleAttributes = [...html.matchAll(/\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)];
  return {
    blockCount: styleBlocks.length,
    blockCharacterCount: styleBlocks.reduce((total, item) => total + item.html.length, 0),
    attributeCount: styleAttributes.length,
  };
}

function collectCustomElements(html) {
  const names = [...html.matchAll(/<([a-z][a-z0-9]*-[a-z0-9-]+)\b/gi)].map((match) => match[1].toLowerCase());
  return [...new Set(names)].sort();
}

function buildAudit(snapshot) {
  const findings = [];
  const add = (severity, code, message, details = null) => findings.push({ severity, code, message, details });

  if (!snapshot.meta.title) add("error", "missing-title", "Document has no <title> element.");
  if (!snapshot.meta.description) add("warning", "missing-description", "Document has no meta description.");
  if (!snapshot.meta.canonical) add("warning", "missing-canonical", "Document has no canonical link.");

  const h1Count = snapshot.headings.filter((item) => item.level === 1).length;
  if (h1Count === 0) add("error", "missing-h1", "Document has no H1 heading.");
  if (h1Count > 1) add("warning", "multiple-h1", `Document has ${h1Count} H1 headings.`);

  for (let index = 1; index < snapshot.headings.length; index += 1) {
    const previous = snapshot.headings[index - 1];
    const current = snapshot.headings[index];
    if (current.level - previous.level > 1) {
      add("warning", "heading-level-skip", `Heading hierarchy jumps from H${previous.level} to H${current.level}.`, {
        previous: previous.text,
        current: current.text,
      });
    }
  }

  const missingAlt = snapshot.images.filter((image) => image.alt === null);
  if (missingAlt.length) add("warning", "images-missing-alt", `${missingAlt.length} images have no alt attribute.`, missingAlt);

  const missingDimensions = snapshot.images.filter((image) => !image.width || !image.height);
  if (missingDimensions.length) {
    add("info", "images-missing-dimensions", `${missingDimensions.length} images have incomplete width/height attributes.`);
  }

  const emptyLinks = snapshot.links.filter((link) => !link.text && !link.ariaLabel);
  if (emptyLinks.length) add("warning", "links-without-name", `${emptyLinks.length} links have no visible text or aria-label.`, emptyLinks);

  const nonCrawlableLinks = snapshot.links.filter((link) => !link.href || /^javascript:/i.test(link.href));
  if (nonCrawlableLinks.length) {
    add("warning", "non-crawlable-links", `${nonCrawlableLinks.length} links are missing href or use javascript: URLs.`, nonCrawlableLinks);
  }

  if (!snapshot.rawMetrics.hasMain) add("warning", "missing-main", "Document has no semantic <main> landmark.");
  if (!snapshot.rawMetrics.hasNav) add("info", "missing-nav", "Document has no semantic <nav> landmark.");

  if (snapshot.inlineStyles.attributeCount > 25) {
    add("warning", "heavy-inline-styles", `Document contains ${snapshot.inlineStyles.attributeCount} inline style attributes.`);
  }

  if (snapshot.customElements.includes("x-dc")) {
    add("warning", "runtime-dependent-root", "Document uses <x-dc>; verify that primary content remains present in raw HTML and does not depend on runtime-only rendering.");
  }

  if (!snapshot.structuredData.length) add("info", "missing-structured-data", "Document has no JSON-LD structured data.");
  if (snapshot.structuredData.some((item) => !item.valid)) add("error", "invalid-structured-data", "At least one JSON-LD block is invalid JSON.");

  const inlineScriptSize = snapshot.scripts.reduce((total, script) => total + script.inlineLength, 0);
  if (inlineScriptSize > 10_000) add("warning", "large-inline-script", `Document contains ${inlineScriptSize} characters of inline JavaScript.`);

  return findings;
}

function renderMarkdown(snapshot, findings) {
  const bySeverity = {
    error: findings.filter((item) => item.severity === "error"),
    warning: findings.filter((item) => item.severity === "warning"),
    info: findings.filter((item) => item.severity === "info"),
  };

  const lines = [
    "# Legacy Content and Crawlability Audit",
    "",
    `Generated from \`${snapshot.source}\` at ${snapshot.generatedAt}.`,
    "",
    "## Summary",
    "",
    `- Headings: ${snapshot.headings.length}`,
    `- Semantic landmarks/sections: ${snapshot.landmarks.length}`,
    `- Links: ${snapshot.links.length}`,
    `- Images: ${snapshot.images.length}`,
    `- Scripts: ${snapshot.scripts.length}`,
    `- Inline style attributes: ${snapshot.inlineStyles.attributeCount}`,
    `- JSON-LD blocks: ${snapshot.structuredData.length}`,
    `- Errors: ${bySeverity.error.length}`,
    `- Warnings: ${bySeverity.warning.length}`,
    `- Informational findings: ${bySeverity.info.length}`,
    "",
    "## Metadata",
    "",
    `- Title: ${snapshot.meta.title ?? "Missing"}`,
    `- Description: ${snapshot.meta.description ?? "Missing"}`,
    `- Canonical: ${snapshot.meta.canonical ?? "Missing"}`,
    "",
    "## Findings",
    "",
  ];

  if (!findings.length) lines.push("No findings.", "");

  for (const finding of findings) {
    lines.push(`### ${finding.severity.toUpperCase()}: ${finding.code}`, "", finding.message, "");
  }

  lines.push("## Heading inventory", "");
  for (const heading of snapshot.headings) {
    lines.push(`${"  ".repeat(Math.max(0, heading.level - 1))}- H${heading.level}: ${heading.text || "(empty)"}`);
  }

  lines.push("", "## Section inventory", "");
  for (const section of snapshot.landmarks) {
    lines.push(`- ${section.tag}${section.id ? `#${section.id}` : ""}: ${section.heading ?? section.textPreview ?? "(empty)"}`);
  }

  lines.push("", "## Image inventory", "");
  for (const image of snapshot.images) {
    lines.push(`- ${image.src ?? "(missing src)"} — alt: ${image.alt === null ? "MISSING" : image.alt || "decorative/empty"}`);
  }

  lines.push("", "## External links", "");
  for (const link of snapshot.links.filter((item) => /^https?:\/\//i.test(item.href ?? ""))) {
    lines.push(`- ${link.text || link.ariaLabel || "(unnamed)"}: ${link.href}`);
  }

  return `${lines.join("\n")}\n`;
}

async function preserveGeneratedAtWhenContentIsUnchanged(outputPath, output) {
  let previousOutput;

  try {
    previousOutput = JSON.parse(await readFile(outputPath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT" || error instanceof SyntaxError) return output;
    throw error;
  }

  const normalize = (value) => JSON.stringify({ ...value, generatedAt: null });

  if (normalize(previousOutput) !== normalize(output) || typeof previousOutput.generatedAt !== "string") {
    return output;
  }

  return { ...output, generatedAt: previousOutput.generatedAt };
}

async function main() {
  const html = await readFile(inputPath, "utf8");

  const snapshot = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: path.relative(process.cwd(), inputPath) || path.basename(inputPath),
    meta: collectMeta(html),
    headings: collectHeadings(html),
    landmarks: collectSections(html),
    links: collectLinks(html),
    images: collectImages(html),
    scripts: collectScripts(html),
    structuredData: collectStructuredData(html),
    inlineStyles: collectInlineStyles(html),
    customElements: collectCustomElements(html),
    rawMetrics: {
      characterCount: html.length,
      lineCount: html.split(/\r?\n/).length,
      xDcPresent: /<x-dc\b/i.test(html),
      dataDcScriptPresent: /data-dc-script/i.test(html),
      hasMain: /<main\b/i.test(html),
      hasNav: /<nav\b/i.test(html),
    },
  };

  const findings = buildAudit(snapshot);
  const output = { ...snapshot, findings };

  await mkdir(outputDir, { recursive: true });
  const stableOutput = await preserveGeneratedAtWhenContentIsUnchanged(
    path.join(outputDir, "legacy-content.json"),
    output,
  );
  await writeFile(path.join(outputDir, "legacy-content.json"), `${JSON.stringify(stableOutput, null, 2)}\n`, "utf8");
  await writeFile(
    path.join(outputDir, "legacy-content-report.md"),
    renderMarkdown(stableOutput, stableOutput.findings),
    "utf8",
  );

  const errors = findings.filter((item) => item.severity === "error").length;
  const warnings = findings.filter((item) => item.severity === "warning").length;

  console.log(`Content audit complete: ${path.relative(process.cwd(), outputDir)}`);
  console.log(`Found ${errors} errors and ${warnings} warnings.`);

  if (process.env.CONTENT_AUDIT_FAIL_ON_ERROR === "1" && errors > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Content audit failed.");
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
