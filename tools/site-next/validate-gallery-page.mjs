#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function assertIncludes(html, fragment, description) {
  if (!html.includes(fragment)) throw new Error(`${description} is missing from generated gallery HTML.`);
}

async function main() {
  const [html, contract, knowledge] = await Promise.all([
    readFile(path.join(root, "site-next/gallery/index.html"), "utf8"),
    readFile(path.join(root, "architecture/project-routes.yaml"), "utf8").then(JSON.parse),
    loadContentTables({ root }).then((tables) => createKnowledgeRepository(tables)),
  ]);
  const route = contract.routes.find((item) => item.family_id === "gallery-index");

  if (!route || route.status !== "generated" || route.sitemap_eligible !== true) {
    throw new Error("Gallery route must be generated and sitemap eligible before validation.");
  }
  if (route.generated_html_path !== "site-next/gallery/index.html") {
    throw new Error("Gallery route output path is invalid.");
  }
  if ([...html.matchAll(/<h1\b[^>]*>/g)].length !== 1) {
    throw new Error("Gallery page must contain exactly one H1.");
  }

  assertIncludes(html, `<link rel="canonical" href="${route.canonical_url}">`, "Canonical URL");
  assertIncludes(html, '<main id="main-content">', "Main landmark");

  const media = knowledge.listMedia();
  if (media.length !== 39) throw new Error(`Expected 39 Media records; found ${media.length}.`);

  for (const item of media) {
    assertIncludes(html, item.src, `Media source ${item.id}`);
    assertIncludes(html, `alt="${escapeHtml(item.alt)}"`, `Media alt ${item.id}`);
    assertIncludes(html, `width="${item.width}" height="${item.height}"`, `Media dimensions ${item.id}`);
  }

  console.log(`Validated gallery page with ${media.length} media records`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
