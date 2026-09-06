#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const sitemapPath = path.join(root, "sitemap.xml");
const routeContractPath = path.join(root, "architecture/project-routes.yaml");

function decodeXml(value) {
  return value
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("&amp;", "&");
}

function extractLocations(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => decodeXml(match[1]));
}

async function main() {
  const [xml, routeContract, knowledge] = await Promise.all([
    readFile(sitemapPath, "utf8"),
    readFile(routeContractPath, "utf8").then(JSON.parse),
    loadContentTables({ root }).then((tables) => createKnowledgeRepository(tables)),
  ]);
  const canonicalOrigin = new URL(knowledge.getSite().canonicalOrigin).origin;
  const homepageUrl = new URL("/", canonicalOrigin).href;
  const locations = extractLocations(xml);
  const eligibleRouteUrls = routeContract.routes
    .filter((route) => route.sitemap_eligible === true)
    .map((route) => route.canonical_url);
  const expectedUrls = new Set([homepageUrl, ...eligibleRouteUrls]);

  if (!xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
    throw new Error("sitemap.xml is missing the sitemap protocol urlset namespace.");
  }

  if (locations.length === 0) {
    throw new Error("sitemap.xml does not contain any URL locations.");
  }

  for (const expectedUrl of expectedUrls) {
    if (!locations.includes(expectedUrl)) {
      throw new Error(`sitemap.xml is missing an eligible canonical URL: ${expectedUrl}`);
    }
  }

  if (new Set(locations).size !== locations.length) {
    throw new Error("sitemap.xml contains duplicate URL locations.");
  }

  const forbiddenUrls = new Set([
    new URL("/robots.txt", canonicalOrigin).href,
    new URL("/llms.txt", canonicalOrigin).href,
    ...knowledge.listExternalApps().map((app) => app.url),
    ...routeContract.routes.filter((route) => route.sitemap_eligible !== true).map((route) => route.canonical_url),
  ]);

  for (const location of locations) {
    let url;

    try {
      url = new URL(location);
    } catch {
      throw new Error(`sitemap.xml contains an invalid absolute URL: ${location}`);
    }

    if (url.origin !== canonicalOrigin) {
      throw new Error(`sitemap.xml URL uses a non-canonical origin: ${location}`);
    }

    if (forbiddenUrls.has(location)) {
      throw new Error(`sitemap.xml contains a utility or external application URL: ${location}`);
    }

    if (!expectedUrls.has(location)) {
      throw new Error(`sitemap.xml contains an unregistered canonical URL: ${location}`);
    }
  }

  console.log("Validated sitemap.xml");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
