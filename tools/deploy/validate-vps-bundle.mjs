#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const outputRoot = path.join(root, ".deploy-dist");
const productionOrigin = "https://vitalvibeconstruction.com";

const requiredFiles = [
  "index.html",
  "styles.css",
  "VVC_primary_logo.svg",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "DEPLOYMENT_COMMIT",
  "aviso-legal.dc.html",
  "support.js",
];

async function exists(relativePath) {
  try {
    await access(path.join(outputRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

function publicPathCandidates(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalized = decoded.replace(/^\/+/, "");

  if (!normalized || decoded.endsWith("/")) {
    return [path.join(normalized, "index.html")];
  }

  return [normalized, path.join(normalized, "index.html")];
}

async function assertPublicPath(pathname, context) {
  const candidates = publicPathCandidates(pathname);
  for (const candidate of candidates) {
    if (await exists(candidate)) return;
  }

  throw new Error(`Missing local target for ${pathname} referenced by ${context}.`);
}

async function collectHtmlFiles(directory = outputRoot, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectHtmlFiles(absolute, relative));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(relative);
    }
  }
  return files;
}

function extractLocalReferences(html, htmlPath) {
  const references = [];
  const attributePattern = /\b(?:href|src)=(['"])([^'"]+)\1/g;
  let match;

  const pageUrl = new URL(htmlPath.replace(/\\/g, "/"), `${productionOrigin}/`);

  while ((match = attributePattern.exec(html)) !== null) {
    const value = match[2].trim();
    if (!value || value.startsWith("#")) continue;
    if (/^(?:mailto:|tel:|javascript:|data:)/i.test(value)) continue;

    let resolved;
    try {
      resolved = new URL(value, pageUrl);
    } catch {
      throw new Error(`Invalid URL ${value} in ${htmlPath}.`);
    }

    if (resolved.origin !== productionOrigin) continue;
    references.push(resolved.pathname);
  }

  return references;
}

async function main() {
  // Repository handoff and task notes must never become public site files.
  for (const internalPath of ["task", "HANDOFF.md", "AGENTS.md", "README.md"]) {
    if (await exists(internalPath)) {
      throw new Error(`Repository-only documentation leaked into deployment bundle: ${internalPath}`);
    }
  }

  for (const file of requiredFiles) {
    if (!(await exists(file))) {
      throw new Error(`Required deployment file is missing: ${file}`);
    }
  }

  const homepage = await readFile(path.join(outputRoot, "index.html"), "utf8");
  if (homepage.includes("<x-dc") || homepage.includes("./support.js")) {
    throw new Error("Deployment homepage appears to be the legacy runtime entrypoint.");
  }
  if (!homepage.includes("Empresa de reformas en Barcelona")) {
    throw new Error("Deployment homepage does not match the generated site-next projection.");
  }

  const sitemap = await readFile(path.join(outputRoot, "sitemap.xml"), "utf8");
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (!sitemapUrls.length) {
    throw new Error("Deployment sitemap contains no URLs.");
  }

  for (const value of sitemapUrls) {
    const url = new URL(value);
    if (url.origin !== productionOrigin) {
      throw new Error(`Sitemap URL uses unexpected origin: ${value}`);
    }
    await assertPublicPath(url.pathname, "sitemap.xml");
  }

  const robots = await readFile(path.join(outputRoot, "robots.txt"), "utf8");
  if (!robots.includes(`${productionOrigin}/sitemap.xml`)) {
    throw new Error("robots.txt does not reference the production sitemap URL.");
  }

  const htmlFiles = await collectHtmlFiles();
  for (const htmlPath of htmlFiles) {
    const html = await readFile(path.join(outputRoot, htmlPath), "utf8");
    if (html.includes("site-next/")) {
      throw new Error(`Public deployment HTML leaks site-next path: ${htmlPath}`);
    }

    for (const pathname of extractLocalReferences(html, htmlPath)) {
      await assertPublicPath(pathname, htmlPath);
    }
  }

  console.log(`Validated VPS bundle: ${sitemapUrls.length} sitemap routes, ${htmlFiles.length} HTML files.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
