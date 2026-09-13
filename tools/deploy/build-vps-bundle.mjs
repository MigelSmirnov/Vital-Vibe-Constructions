#!/usr/bin/env node

import { cp, copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceRoot = path.join(root, "site-next");
const outputRoot = path.join(root, ".deploy-dist");
const responsiveWorkRoot = path.join(root, "artifacts", "responsive-vps");

const rootFiles = [
  "sitemap.xml",
  "llms.txt",
  "robots.txt",
  "VVC_primary_logo.svg",
  "aviso-legal.dc.html",
  "support.js",
];

const assetDirectories = [
  "assets",
  "proyecto-1",
  "proyecto-2",
  "estandar",
  "premium",
  "smart",
];

const homeDocuments = ["index.html", "en/index.html", "ru/index.html"];

async function copyRequired(source, destination) {
  await copyFile(path.join(root, source), path.join(outputRoot, destination ?? source));
}

function replaceOnce(html, pattern, replacement, label) {
  let count = 0;
  const updated = html.replace(pattern, (...args) => {
    count += 1;
    return typeof replacement === "function" ? replacement(...args) : replacement;
  });
  if (count !== 1) throw new Error(`Expected one ${label} image in homepage projection, found ${count}.`);
  return updated;
}

async function integrateHomepageResponsiveImages() {
  execFileSync("bash", [path.join(root, "tools/media/build-home-responsive.sh"), responsiveWorkRoot], {
    cwd: root,
    stdio: "inherit",
  });

  await cp(
    path.join(responsiveWorkRoot, "assets", "responsive"),
    path.join(outputRoot, "assets", "responsive"),
    { recursive: true, force: true },
  );

  const bathroomSource = `<source type="image/webp" srcset="/assets/responsive/home/bathroom-retouched-480.webp 480w, /assets/responsive/home/bathroom-retouched-768.webp 768w, /assets/responsive/home/bathroom-retouched-1086.webp 1086w" sizes="(max-width: 720px) 92vw, (max-width: 1400px) 48vw, 650px">`;
  const kitchenSource = `<source type="image/webp" srcset="/assets/responsive/estandar/cocina-480.webp 480w, /assets/responsive/estandar/cocina-768.webp 768w, /assets/responsive/estandar/cocina-1200.webp 1200w" sizes="(max-width: 720px) 92vw, (max-width: 1000px) 35vw, 300px">`;

  for (const relativePath of homeDocuments) {
    const file = path.join(outputRoot, relativePath);
    let html = await readFile(file, "utf8");

    html = replaceOnce(
      html,
      /<img([^>]*?)src="\/assets\/home\/bathroom-retouched\.png"([^>]*?)>/,
      (_match, before, after) => `<picture>${bathroomSource}<img${before}src="/assets/home/bathroom-retouched.png"${after}></picture>`,
      "featured bathroom",
    );

    html = replaceOnce(
      html,
      /<img([^>]*?)src="\/estandar\/cocina\.jpeg"([^>]*?)>/,
      (_match, before, after) => `<picture>${kitchenSource}<img${before}src="/estandar/cocina.jpeg"${after}></picture>`,
      "standard kitchen",
    );

    await writeFile(file, html, "utf8");
  }
}

async function main() {
  await rm(outputRoot, { recursive: true, force: true });
  await rm(responsiveWorkRoot, { recursive: true, force: true });
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

  await integrateHomepageResponsiveImages();

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
