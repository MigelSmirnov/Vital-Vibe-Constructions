#!/usr/bin/env node

import { cp, copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceRoot = path.join(root, "site-next");
const outputRoot = path.join(root, ".deploy-dist");

const rootFiles = [
  "sitemap.xml",
  "llms.txt",
  "robots.txt",
  "VVC_primary_logo.svg",
  "aviso-legal.dc.html",
  "support.js",
];

const assetDirectories = [
  "proyecto-1",
  "proyecto-2",
  "estandar",
  "premium",
  "smart",
];

async function copyRequired(source, destination) {
  await copyFile(path.join(root, source), path.join(outputRoot, destination ?? source));
}

async function main() {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  for (const entry of await readdir(sourceRoot)) {
    await cp(path.join(sourceRoot, entry), path.join(outputRoot, entry), {
      recursive: true,
      force: true,
    });
  }

  for (const file of rootFiles) {
    await copyRequired(file);
  }

  for (const directory of assetDirectories) {
    await cp(path.join(root, directory), path.join(outputRoot, directory), {
      recursive: true,
      force: true,
    });
  }

  const commit = process.env.GITHUB_SHA || execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();

  await writeFile(path.join(outputRoot, "DEPLOYMENT_COMMIT"), `${commit}\n`, "utf8");

  console.log(`Built VPS deployment bundle at ${path.relative(root, outputRoot)}`);
  console.log(`Deployment commit: ${commit}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
