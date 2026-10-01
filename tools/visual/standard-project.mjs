#!/usr/bin/env node

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");
const out = path.join(root, "artifacts", "visual", "latest");
const shots = path.join(out, "screenshots");
const routePath = "/projects/reforma-integral-estandar-barcelona/";
const viewports = [[390, 844], [768, 1024], [1440, 1000]];
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

async function localRoute(route) {
  const requestUrl = new URL(route.request().url());
  let file = path.join(dist, decodeURIComponent(requestUrl.pathname));
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
  } catch {
    if (!path.extname(file)) file = path.join(file, "index.html");
  }
  try {
    const body = await readFile(file);
    await route.fulfill({ status: 200, body, contentType: types[path.extname(file).toLowerCase()] || "application/octet-stream" });
  } catch {
    await route.fulfill({ status: 404, body: "Not found", contentType: "text/plain" });
  }
}

await mkdir(shots, { recursive: true });
const playwrightPath = path.join(root, ".visual-tools", "node_modules", "playwright", "index.mjs");
const { chromium } = await import(pathToFileURL(playwrightPath).href);
const browser = await chromium.launch({ headless: true });
const results = [];
const blocking = [];

try {
  for (const [width, height] of viewports) {
    console.log(`standard-project: ${routePath} @ ${width}x${height}`);
    const context = await browser.newContext({ viewport: { width, height }, locale: "es-ES", timezoneId: "Europe/Madrid", reducedMotion: "reduce" });
    const page = await context.newPage();
    const failedRequests = [];
    page.on("requestfailed", (request) => failedRequests.push(request.url()));
    await page.route("http://vvc.local/**", localRoute);
    await page.goto(new URL(routePath, "http://vvc.local").href, { waitUntil: "networkidle" });

    await page.locator("img").evaluateAll((images) => images.forEach((image) => { image.loading = "eager"; }));
    await page.evaluate(async () => {
      const step = Math.max(300, Math.floor(window.innerHeight * 0.75));
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      window.scrollTo(0, 0);
      await Promise.all([...document.images].map((image) => image.decode?.().catch(() => undefined)));
    });

    const audit = await page.evaluate(() => {
      const brokenImages = [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src);
      return {
        brokenImages,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        imageCount: document.images.length,
      };
    });
    const overflow = audit.scrollWidth > audit.clientWidth + 1;
    if (failedRequests.length) blocking.push(`${width}x${height}: ${failedRequests.length} failed request(s)`);
    if (audit.brokenImages.length) blocking.push(`${width}x${height}: ${audit.brokenImages.length} broken image(s)`);
    if (overflow) blocking.push(`${width}x${height}: horizontal overflow ${audit.scrollWidth}px > ${audit.clientWidth}px`);

    const screenshot = `project-standard--${width}x${height}.png`;
    await page.screenshot({ path: path.join(shots, screenshot), fullPage: true });
    results.push({ width, height, screenshot, failedRequests, brokenImages: audit.brokenImages, overflow, imageCount: audit.imageCount });
    await context.close();
  }
} finally {
  await browser.close();
}

const rows = results.map((result) => `| ${result.width}x${result.height} | ${result.imageCount} | ${result.failedRequests.length} | ${result.brokenImages.length} | ${result.overflow ? "yes" : "no"} | ${result.screenshot} |`).join("\n");
const report = `# Standard project visual check\n\n${blocking.length ? `**FAIL** - ${blocking.length} blocking finding(s).` : "**PASS** - standard project rendered without failed requests, broken images or horizontal overflow."}\n\n| Viewport | Images | Failed requests | Broken images | Overflow | Screenshot |\n| --- | ---: | ---: | ---: | --- | --- |\n${rows}\n\n${blocking.length ? `## Blocking findings\n\n${blocking.map((item) => `- ${item}`).join("\n")}\n` : ""}`;
await writeFile(path.join(out, "standard-project.md"), report, "utf8");
console.log(`standard-project: report -> ${path.relative(root, path.join(out, "standard-project.md"))}`);
if (blocking.length) process.exitCode = 1;
