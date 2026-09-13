#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");
const galleryFile = path.join(dist, "gallery", "index.html");
const sizes = "(max-width: 520px) 44vw, (max-width: 900px) 46vw, 380px";

const images = [
  ["estandar", "obra"],
  ["estandar", "cocina"],
  ["estandar", "suelo-base"],
  ["estandar", "pasillo"],
  ["estandar", "parquet"],
  ["estandar", "pintura"],
  ["premium", "pladur-instalacion"],
  ["premium", "pladur-obra"],
  ["premium", "prep-techo-1"],
  ["premium", "prep-techo-2"],
  ["premium", "prep-techo-3"],
  ["premium", "prep-techo-4"],
  ["premium", "techo-1"],
  ["premium", "techo-2"],
  ["premium", "techo-3"],
  ["premium", "techo-4"],
];

function wrapOnce(html, directory, name) {
  const src = `/${directory}/${name}.jpeg`;
  const marker = `src="${src}"`;
  const position = html.indexOf(marker);
  if (position === -1 || html.indexOf(marker, position + marker.length) !== -1) {
    throw new Error(`Expected exactly one gallery image for ${src}.`);
  }
  const start = html.lastIndexOf("<img", position);
  const end = html.indexOf(">", position);
  if (start === -1 || end === -1) throw new Error(`Could not resolve gallery img element for ${src}.`);
  const image = html.slice(start, end + 1);
  const source = `<source type="image/webp" srcset="/assets/responsive/${directory}/${name}-480.webp 480w, /assets/responsive/${directory}/${name}-768.webp 768w, /assets/responsive/${directory}/${name}-1200.webp 1200w" sizes="${sizes}">`;
  return `${html.slice(0, start)}<picture style="display:contents">${source}${image}</picture>${html.slice(end + 1)}`;
}

let html = await readFile(galleryFile, "utf8");
for (const [directory, name] of images) html = wrapOnce(html, directory, name);
await writeFile(galleryFile, html, "utf8");
console.log(`gallery-responsive: patched ${images.length} gallery images using existing project derivatives`);
