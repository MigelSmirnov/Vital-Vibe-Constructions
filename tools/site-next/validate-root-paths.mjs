#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const siteRoot = path.join(root, "site-next");

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listHtmlFiles(absolutePath));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(absolutePath);
  }

  return files;
}

function isInvalidLocalUrl(value) {
  if (!value || value.startsWith("/") || value.startsWith("#")) return false;
  if (value.startsWith("mailto:") || value.startsWith("tel:") || value.startsWith("data:")) return false;
  if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith("//")) return false;
  return true;
}

async function main() {
  const htmlFiles = await listHtmlFiles(siteRoot);
  const failures = [];

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, "utf8");
    for (const match of html.matchAll(/\b(href|src)=(['"])([^'"]+)\2/g)) {
      const value = match[3];
      if (isInvalidLocalUrl(value)) {
        failures.push(`${path.relative(root, filePath)}: ${match[1]}="${value}"`);
      }
    }
  }

  if (failures.length) {
    throw new Error(`Generated HTML contains non-root local URLs:\n${failures.join("\n")}`);
  }

  console.log(`Validated root-relative URLs in ${htmlFiles.length} generated HTML files`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
