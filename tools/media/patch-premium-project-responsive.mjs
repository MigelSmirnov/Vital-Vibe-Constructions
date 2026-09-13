#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");
const relativePath = "projects/trabajos-contrata-premium/index.html";

function sourceSet(name) {
  return `<source type="image/webp" srcset="/assets/responsive/premium/${name}-480.webp 480w, /assets/responsive/premium/${name}-768.webp 768w, /assets/responsive/premium/${name}-1200.webp 1200w" sizes="(max-width: 760px) 92vw, (max-width: 1220px) 48vw, 581px">`;
}

function wrapOnce(html, src, source, label) {
  const marker = `src="${src}"`;
  const position = html.indexOf(marker);
  if (position === -1 || html.indexOf(marker, position + marker.length) !== -1) {
    throw new Error(`Expected exactly one ${label} image in ${relativePath}.`);
  }
  const start = html.lastIndexOf("<img", position);
  const end = html.indexOf(">", position);
  if (start === -1 || end === -1) throw new Error(`Could not resolve ${label} img element in ${relativePath}.`);
  const image = html.slice(start, end + 1);
  return `${html.slice(0, start)}<picture style="display:contents">${source}${image}</picture>${html.slice(end + 1)}`;
}

const names = [
  "pladur-instalacion",
  "pladur-obra",
  "prep-techo-1",
  "prep-techo-2",
  "prep-techo-3",
  "prep-techo-4",
  "techo-1",
  "techo-2",
  "techo-3",
  "techo-4",
];

const file = path.join(dist, relativePath);
let html = await readFile(file, "utf8");
for (const name of names) {
  html = wrapOnce(
    html,
    `/premium/${name}.jpeg`,
    sourceSet(name),
    `premium project ${name}`,
  );
}
await writeFile(file, html, "utf8");

console.log(`Integrated responsive WebP sources for ${names.length} premium project gallery images.`);
