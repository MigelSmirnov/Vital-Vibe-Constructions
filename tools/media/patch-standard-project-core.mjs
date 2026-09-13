#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");

function sourceSet(name, sizes) {
  return `<source type="image/webp" srcset="/assets/responsive/estandar/${name}-480.webp 480w, /assets/responsive/estandar/${name}-768.webp 768w, /assets/responsive/estandar/${name}-1200.webp 1200w" sizes="${sizes}">`;
}

function wrapOnce(html, src, source, label, documentPath) {
  const marker = `src="${src}"`;
  const position = html.indexOf(marker);
  if (position === -1 || html.indexOf(marker, position + marker.length) !== -1) {
    throw new Error(`Expected exactly one ${label} image in ${documentPath}.`);
  }
  const start = html.lastIndexOf("<img", position);
  const end = html.indexOf(">", position);
  if (start === -1 || end === -1) throw new Error(`Could not resolve ${label} img element in ${documentPath}.`);
  const image = html.slice(start, end + 1);
  return `${html.slice(0, start)}<picture style="display:contents">${source}${image}</picture>${html.slice(end + 1)}`;
}

async function patch(relativePath, images) {
  const file = path.join(dist, relativePath);
  let html = await readFile(file, "utf8");
  for (const image of images) {
    html = wrapOnce(html, image.src, image.source, image.label, relativePath);
  }
  await writeFile(file, html, "utf8");
}

const lead = {
  src: "/estandar/cocina.jpeg",
  label: "standard project lead kitchen",
  source: sourceSet("cocina", "(max-width: 1200px) calc(100vw - 36px), 1180px"),
};
const gallery = ["obra", "suelo-base", "parquet", "pintura", "pasillo"].map((name) => ({
  src: `/estandar/${name}.jpeg`,
  label: `standard project ${name}`,
  source: sourceSet(name, "(max-width: 760px) 92vw, (max-width: 1220px) 48vw, 581px"),
}));

await patch("projects/reforma-integral-estandar-barcelona/index.html", [lead, ...gallery]);
await patch("projects/index.html", [{
  ...lead,
  label: "standard project index kitchen",
  source: sourceSet("cocina", "(max-width: 760px) 92vw, 32vw"),
}]);

console.log("Integrated responsive WebP sources for the standard project detail and project index.");
