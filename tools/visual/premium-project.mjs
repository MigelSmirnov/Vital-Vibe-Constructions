#!/usr/bin/env node

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");
const out = path.join(root, "artifacts", "visual", "latest");
const shots = path.join(out, "screenshots");
const routePath = "/projects/trabajos-contrata-premium/";
const viewports = [[390, 844], [768, 1024], [1440, 1000]];
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
    console.log(`premium-project: ${routePath} @ ${width}x${height}`);
    const context = await browser.newContext({ viewport: { width, height }, locale: "es-ES", timezoneId: "Europe/Madrid", reducedMotion: "reduce" });
    const page = await context.newPage();
    const requested = new Set();
    const failedRequests = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.hostname === "vvc.local") requested.add(url.pathname);
    });
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

    const selected = [];
    for (const name of names) {
      const selector = `img[src="/premium/${name}.jpeg"]`;
      const image = page.locator(selector);
      const count = await image.count();
      if (count !== 1) {
        blocking.push(`${width}x${height}: expected one ${name} fallback image, found ${count}`);
        continue;
      }
      const currentSrc = await image.evaluate((element) => element.currentSrc || element.src);
      const pathname = new URL(currentSrc, "http://vvc.local").pathname;
      const prefix = `/assets/responsive/premium/${name}-`;
      const responsive = pathname.startsWith(prefix) && pathname.endsWith(".webp");
      const wasRequested = requested.has(pathname);
      let bytes = null;
      try {
        bytes = (await stat(path.join(dist, pathname))).size;
      } catch {
        // Missing selected file is recorded below.
      }
      if (!responsive) blocking.push(`${width}x${height}: ${name} selected ${pathname} instead of responsive WebP`);
      if (!wasRequested) blocking.push(`${width}x${height}: browser did not request ${pathname}`);
      if (bytes === null) blocking.push(`${width}x${height}: selected file missing from release bundle: ${pathname}`);
      selected.push({ name, pathname, bytes, requested: wasRequested });
    }

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

    const screenshot = `project-premium--${width}x${height}.png`;
    await page.screenshot({ path: path.join(shots, screenshot), fullPage: true });
    results.push({ width, height, screenshot, failedRequests, brokenImages: audit.brokenImages, overflow, imageCount: audit.imageCount, selected, selectedBytes: selected.reduce((sum, item) => sum + (item.bytes ?? 0), 0) });
    await context.close();
  }
} finally {
  await browser.close();
}

const rows = results.map((result) => `| ${result.width}x${result.height} | ${result.imageCount} | ${result.selected.length} | ${result.selectedBytes} | ${result.failedRequests.length} | ${result.brokenImages.length} | ${result.overflow ? "yes" : "no"} | ${result.screenshot} |`).join("\n");
const report = `# Premium project visual and responsive-image check\n\n${blocking.length ? `**FAIL** - ${blocking.length} blocking finding(s).` : "**PASS** - premium project rendered cleanly and Chromium selected/requested responsive WebP sources for the ten high-transfer gallery images."}\n\n| Viewport | Images | Responsive checked | Selected bytes | Failed requests | Broken images | Overflow | Screenshot |\n| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |\n${rows}\n\n${blocking.length ? `## Blocking findings\n\n${blocking.map((item) => `- ${item}`).join("\n")}\n` : ""}`;
await writeFile(path.join(out, "premium-project.json"), `${JSON.stringify({ results, blocking }, null, 2)}\n`, "utf8");
await writeFile(path.join(out, "premium-project.md"), report, "utf8");
console.log(`premium-project: report -> ${path.relative(root, path.join(out, "premium-project.md"))}`);
if (blocking.length) process.exitCode = 1;
