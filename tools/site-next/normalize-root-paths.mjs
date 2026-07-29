#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const siteRoot = path.join(root, "site-next");
const placeholderOrigin = "https://root-path-normalizer.invalid";

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

function publicDirectoryFor(filePath) {
  const relativePath = path.relative(siteRoot, filePath).split(path.sep).join("/");
  const directory = path.posix.dirname(`/${relativePath}`);
  return directory === "/." ? "/" : `${directory}/`;
}

function shouldNormalize(value) {
  return value
    && !value.startsWith("/")
    && !value.startsWith("#")
    && !value.startsWith("mailto:")
    && !value.startsWith("tel:")
    && !value.startsWith("data:")
    && !value.startsWith("javascript:")
    && !/^[a-z][a-z\d+.-]*:/i.test(value)
    && !value.startsWith("//");
}

function normalizeValue(value, publicDirectory) {
  if (!shouldNormalize(value)) return value;
  const resolved = new URL(value, `${placeholderOrigin}${publicDirectory}`);
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

function normalizeHtml(html, publicDirectory) {
  return html.replace(/\b(href|src)=(['"])([^'"]+)\2/g, (match, attribute, quote, value) => {
    return `${attribute}=${quote}${normalizeValue(value, publicDirectory)}${quote}`;
  });
}

async function main() {
  const htmlFiles = await listHtmlFiles(siteRoot);

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, "utf8");
    const normalized = normalizeHtml(html, publicDirectoryFor(filePath));
    await writeFile(filePath, normalized, "utf8");
  }

  console.log(`Normalized root-relative URLs in ${htmlFiles.length} generated HTML files`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
