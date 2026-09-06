#!/usr/bin/env node

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import process from "node:process";

const execFileAsync = promisify(execFile);
const imagePaths = process.argv.slice(2);

if (!imagePaths.length) {
  console.error("Usage: node tools/content-inventory/media-dimensions.mjs <image> [image...]");
  process.exit(1);
}

const dimensionPattern = /,\s*(\d+)x(\d+),\s*components\b/;

for (const imagePath of imagePaths) {
  const { stdout } = await execFileAsync("file", [imagePath]);
  const match = dimensionPattern.exec(stdout);

  if (!match) {
    throw new Error(`Could not read dimensions for ${imagePath}`);
  }

  console.log(
    JSON.stringify({
      src: imagePath,
      width: Number(match[1]),
      height: Number(match[2]),
    }),
  );
}
