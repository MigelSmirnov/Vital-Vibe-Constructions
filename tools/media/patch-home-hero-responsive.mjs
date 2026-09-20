#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");
const homeDocuments = ["index.html", "en/index.html", "ru/index.html"];
const fallback = "/assets/home/kitchen-living.jpg";
const source = `<source type="image/webp" srcset="/assets/responsive/home/kitchen-living-480.webp 480w, /assets/responsive/home/kitchen-living-768.webp 768w, /assets/responsive/home/kitchen-living-1152.webp 1152w" sizes="(max-width: 720px) 100vw, (max-width: 1400px) 53vw, 750px">`;
const pattern = /<img class="hero-image" src="\/assets\/home\/kitchen-living\.jpg"([^>]*)>/g;

for (const relativePath of homeDocuments) {
  const file = path.join(dist, relativePath);
  const html = await readFile(file, "utf8");
  let count = 0;
  const updated = html.replace(pattern, (match) => {
    count += 1;
    return `<picture style="display:contents">${source}${match}</picture>`;
  });
  if (count !== 1) throw new Error(`Expected one hero image (${fallback}) in ${relativePath}, found ${count}.`);
  await writeFile(file, updated, "utf8");
}

console.log("Patched responsive homepage hero for ES/EN/RU release copies.");
