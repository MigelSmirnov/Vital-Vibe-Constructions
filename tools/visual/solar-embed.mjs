#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const origin = process.env.VVC_VERIFY_ORIGIN || "http://vvc.local";
const out = path.join(root, "artifacts/visual/latest");
const contract = JSON.parse(await readFile(path.join(root, "architecture/project-routes.yaml"), "utf8"));
const routes = contract.routes.filter(route => route.entity_id === "article-solar-collector-connections");
assert.equal(routes.length, 3);
const { chromium } = await import(pathToFileURL(path.join(root, ".visual-tools/node_modules/playwright/index.mjs")).href);
const browser = await chromium.launch({ headless: true, executablePath: process.env.VVC_BROWSER_EXECUTABLE || undefined });
const results = [];
const types = { ".html": "text/html", ".css": "text/css", ".svg": "image/svg+xml", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
try {
  for (const width of [390, 768, 1024, 1440, 1920, 2560]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    if (!process.env.VVC_VERIFY_ORIGIN) {
      await page.route("http://vvc.local/**", async route => {
        let file = path.join(root, ".deploy-dist", new URL(route.request().url()).pathname);
        try {
          if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
          await route.fulfill({ body: await readFile(file), contentType: types[path.extname(file)] || "application/octet-stream" });
        } catch {
          await route.fulfill({ status: 404, body: "Not found" });
        }
      });
    }
    for (const route of routes) {
      const errors = [];
      const onError = error => errors.push(error.message);
      page.on("pageerror", onError);
      await page.goto(new URL(route.path, origin).href, { waitUntil: "networkidle" });
      const iframe = page.locator(".solar-diagram-embed iframe");
      await iframe.scrollIntoViewIfNeeded();
      const layout = await page.evaluate(() => {
        const frame = document.querySelector(".solar-diagram-embed iframe");
        const rect = frame.getBoundingClientRect();
        return {
          frameWidth: rect.width,
          columnWidth: document.querySelector(".article-body").clientWidth,
          captionWidth: frame.parentElement.querySelector("figcaption").clientWidth,
          left: rect.left,
          right: rect.right,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      assert.ok(layout.frameWidth >= layout.columnWidth - 1, `${route.language} ${width}: iframe collapsed ${JSON.stringify(layout)}`);
      assert.ok(layout.captionWidth >= layout.columnWidth - 1, `${route.language} ${width}: caption collapsed`);
      assert.ok(layout.left >= 0 && layout.right <= width + 1, "Iframe must fit viewport");
      assert.equal(layout.overflow, false);
      const frame = page.frameLocator(".solar-diagram-embed iframe");
      await frame.locator("#playBtn").waitFor();
      assert.equal(new URL(await iframe.getAttribute("src"), origin).searchParams.get("lang"), route.language);
      await frame.locator('[data-scheme="diagonal"]').click();
      assert.equal(await frame.locator('[data-scheme="diagonal"]').getAttribute("aria-pressed"), "true");
      await frame.locator('[data-scheme="single"]').click();
      assert.equal(await frame.locator('[data-scheme="single"]').getAttribute("aria-pressed"), "true");
      const before = await frame.locator("#playBtn").innerText();
      await frame.locator("#playBtn").click();
      assert.notEqual(await frame.locator("#playBtn").innerText(), before);
      await frame.locator("#playBtn").click();
      assert.deepEqual(errors, []);
      results.push({ language: route.language, width, ...layout });
      page.off("pageerror", onError);
    }
    await page.close();
  }
} finally {
  await browser.close();
  await mkdir(out, { recursive: true });
  await writeFile(path.join(out, "solar-embed.json"), JSON.stringify({ origin, results }, null, 2));
}
console.log(`solar-embed: ${results.length} language/viewport checks passed, including 1920 and 2560px`);
