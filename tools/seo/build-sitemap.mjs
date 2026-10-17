#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const outputPath = path.join(root, "sitemap.xml");
const routeContractPath = path.join(root, "architecture/project-routes.yaml");

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function renderSitemap(entries) {
  const urls = entries
    .map(({ url, lastmod }) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

// Only Article records carry an edit date; other routes get no <lastmod> rather than an invented one.
function lastModified(route, knowledge) {
  if (route.family_id === "article-detail") return knowledge.findArticleById(route.entity_id)?.localized(route.language).modified_at ?? null;
  if (route.family_id === "articles-index") {
    const dates = knowledge.listArticles().filter((article) => article.languages.includes(route.language)).map((article) => article.localized(route.language).modified_at);
    return dates.sort().at(-1) ?? null;
  }
  return null;
}

async function main() {
  const routeContract = JSON.parse(await readFile(routeContractPath, "utf8"));
  const knowledge = createKnowledgeRepository(await loadContentTables({ root }));
  const entries = routeContract.routes
    .filter((route) => route.sitemap_eligible === true)
    .map((route) => ({ url: route.canonical_url, lastmod: lastModified(route, knowledge) }));

  await writeFile(outputPath, renderSitemap(entries), "utf8");
  console.log("Built sitemap.xml");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
