#!/usr/bin/env node

import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");
const out = path.join(root, "artifacts", "visual", "latest");
const routes = ["/gallery/", "/projects/estudio-reformado-barcelona/"];
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

async function localRoute(route) {
  const requestUrl = new URL(route.request().url());
  let file = path.join(dist, decodeURIComponent(requestUrl.pathname));
  try { if ((await stat(file)).isDirectory()) file = path.join(file, "index.html"); }
  catch { if (!path.extname(file)) file = path.join(file, "index.html"); }
  try {
    const body = await readFile(file);
    await route.fulfill({ status: 200, body, contentType: types[path.extname(file).toLowerCase()] || "application/octet-stream" });
  } catch {
    await route.fulfill({ status: 404, body: "Not found", contentType: "text/plain" });
  }
}

const playwrightPath = path.join(root, ".visual-tools", "node_modules", "playwright", "index.mjs");
const { chromium } = await import(pathToFileURL(playwrightPath).href);
const browser = await chromium.launch({ headless: true });
const results = [];
const blocking = [];
try {
  for (const routePath of routes) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "es-ES", timezoneId: "Europe/Madrid", reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.route("http://vvc.local/**", localRoute);
    await page.goto(new URL(routePath, "http://vvc.local").href, { waitUntil: "networkidle" });
    const state = await page.evaluate(() => ({
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    }));
    if (!state.reducedMotion) blocking.push(`${routePath}: reduced-motion preference did not reach the page`);
    if (state.scrollBehavior !== "auto") blocking.push(`${routePath}: expected scroll-behavior auto, got ${state.scrollBehavior}`);
    results.push({ route: routePath, ...state });
    await context.close();
  }
} finally {
  await browser.close();
}

const rows = results.map((result) => `| ${result.route} | ${result.reducedMotion ? "yes" : "no"} | ${result.scrollBehavior} |`).join("\n");
const report = `# Reduced-motion scroll check\n\n${blocking.length ? `**FAIL** - ${blocking.length} blocking finding(s).` : "**PASS** - shared secondary pages compute scroll-behavior: auto when reduced motion is requested."}\n\n| Route | Reduced motion active | Scroll behavior |\n| --- | --- | --- |\n${rows}\n\n${blocking.length ? `## Blocking findings\n\n${blocking.map((item) => `- ${item}`).join("\n")}\n` : ""}`;
await writeFile(path.join(out, "reduced-motion.json"), `${JSON.stringify({ results, blocking }, null, 2)}\n`, "utf8");
await writeFile(path.join(out, "reduced-motion.md"), report, "utf8");
console.log(`reduced-motion: report -> ${path.relative(root, path.join(out, "reduced-motion.md"))}`);
if (blocking.length) process.exitCode = 1;
