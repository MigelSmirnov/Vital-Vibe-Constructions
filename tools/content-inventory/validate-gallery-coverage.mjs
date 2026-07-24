#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const contractPath = path.join(root, "architecture/gallery-media-coverage.yaml");

async function main() {
  const contract = JSON.parse(await readFile(contractPath, "utf8"));
  const sources = requireArray(contract.sources, "sources");
  const expectedTotal = contract.policy?.expected_content_media_count;

  if (contract.policy?.coverage_mode !== "complete-legacy-coverage") {
    throw new Error("Gallery coverage mode must remain complete-legacy-coverage.");
  }

  if (contract.policy?.curated_exclusions_allowed !== false) {
    throw new Error("Curated gallery exclusions must remain disabled.");
  }

  const allItems = [];

  for (const source of sources) {
    const items = requireArray(source.items, `${source.source_file}.items`);
    const html = await readFile(path.join(root, source.source_file), "utf8");

    if (items.length !== source.expected_count) {
      throw new Error(`${source.source_file} contract count is ${items.length}; expected ${source.expected_count}.`);
    }

    const sourceImages = extractContentImages(html);
    const contractedSources = new Set(items.map((item) => item.src));

    if (sourceImages.size !== source.expected_count) {
      throw new Error(`${source.source_file} contains ${sourceImages.size} unique content images; expected ${source.expected_count}.`);
    }

    for (const [src, alt] of sourceImages) {
      if (!contractedSources.has(src)) {
        throw new Error(`${source.source_file} image is missing from gallery contract: ${src}`);
      }

      const contractItem = items.find((item) => item.src === src);
      requireNonEmptyString(contractItem.alt, `${src}.alt`);
      requireNonEmptyString(contractItem.owner, `${src}.owner`);
      requireNonEmptyString(contractItem.state, `${src}.state`);

      if (contractItem.alt !== alt) {
        throw new Error(`${src} alt text does not match the legacy source. Expected "${alt}".`);
      }

      await access(path.join(root, src));
      allItems.push(contractItem);
    }
  }

  if (!Number.isInteger(expectedTotal) || allItems.length !== expectedTotal) {
    throw new Error(`Gallery contract contains ${allItems.length} images; expected ${expectedTotal}.`);
  }

  assertUnique(allItems, "src");

  const studioImages = allItems.filter((item) => item.owner === "project-studio-renovation-barcelona");
  if (studioImages.length !== 8) {
    throw new Error(`Studio project must own 8 legacy images; found ${studioImages.length}.`);
  }

  console.log(`Validated complete gallery contract: ${allItems.length} of ${expectedTotal} images`);
}

function extractContentImages(html) {
  const results = new Map();
  const imagePattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*\balt=["']([^"']*)["'][^>]*>/gi;

  for (const match of html.matchAll(imagePattern)) {
    const src = match[1];
    const alt = match[2];

    if (src === "VVC_primary_logo.svg" || src.startsWith("data:")) continue;
    results.set(src, alt);
  }

  return results;
}

function requireArray(value, name) {
  if (!Array.isArray(value)) throw new Error(`Expected ${name} to be an array.`);
  return value;
}

function requireNonEmptyString(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Expected ${name} to be a non-empty string.`);
  }
}

function assertUnique(records, fieldName) {
  const values = records.map((record) => record[fieldName]);
  if (new Set(values).size !== values.length) {
    throw new Error(`Gallery contract contains duplicate ${fieldName} values.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
