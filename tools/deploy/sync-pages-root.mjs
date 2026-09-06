#!/usr/bin/env node

import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const mappings = [
  ["site-next/index.html", "index.html"],
  ["site-next/styles.css", "styles.css"],
  ["site-next/home-redesign.css", "home-redesign.css"],
  ["site-next/en/index.html", "en/index.html"],
  ["site-next/ru/index.html", "ru/index.html"],
  ["site-next/gallery/index.html", "gallery/index.html"],
  ["site-next/projects/index.html", "projects/index.html"],
  ["site-next/projects/estudio-reformado-barcelona/index.html", "projects/estudio-reformado-barcelona/index.html"],
  ["site-next/projects/piso-reformado-barcelona/index.html", "projects/piso-reformado-barcelona/index.html"],
  ["site-next/projects/reforma-integral-estandar-barcelona/index.html", "projects/reforma-integral-estandar-barcelona/index.html"],
  ["site-next/projects/trabajos-contrata-premium/index.html", "projects/trabajos-contrata-premium/index.html"],
  ["site-next/servicios/reformas-integrales-barcelona/index.html", "servicios/reformas-integrales-barcelona/index.html"],
];

for (const [sourceRelative, targetRelative] of mappings) {
  const source = path.join(root, sourceRelative);
  const target = path.join(root, targetRelative);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
}

console.log(`GitHub Pages root mirror synced from site-next: ${mappings.length} files`);
