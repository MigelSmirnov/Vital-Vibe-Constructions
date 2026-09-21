#!/usr/bin/env node
import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");
const out = path.join(root, "artifacts/visual/latest");
const repository = createKnowledgeRepository(await loadContentTables({ root }));
const articleIds = ["article-painting-preparation", "article-floor-leveling"];
const contract = JSON.parse(await readFile(path.join(root, "architecture/project-routes.yaml"), "utf8"));
const routes = contract.routes.filter(route => articleIds.includes(route.entity_id) || route.family_id === "articles-index");
const media = [...new Set(articleIds.flatMap(id => repository.findArticleById(id).mediaIds))].map(id => repository.findMediaById(id));
const bySrc = new Map(media.map(item => [`/${item.src}`, item]));
const types = { ".html": "text/html", ".css": "text/css", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
let server;
let origin = process.env.VVC_VERIFY_ORIGIN;
if (!origin) {
  server = http.createServer(async (req, res) => {
    try {
      let file = path.join(dist, new URL(req.url, "http://vvc.local").pathname);
      if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Content-Length": body.length });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
}
const { chromium } = await import(pathToFileURL(path.join(root, ".visual-tools/node_modules/playwright/index.mjs")).href);
const browser = await chromium.launch({ headless: true, executablePath: process.env.VVC_BROWSER_EXECUTABLE || undefined });
const results = [];
try {
  for (const [width, dpr] of [[390, 1], [768, 1], [1440, 1], [1440, 2]]) {
    for (const route of routes) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: dpr });
      const page = await context.newPage();
      const requested = new Set();
      const errors = [];
      page.on("request", request => requested.add(new URL(request.url()).pathname));
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(new URL(route.path, origin).href, { waitUntil: "networkidle" });
      const images = page.locator('img[src^="/assets/painting-preparation/"], img[src^="/assets/floor-leveling/"]');
      const expected = route.family_id === "articles-index" ? 2 : repository.findArticleById(route.entity_id).mediaIds.length;
      assert.equal(await images.count(), expected);
      const photos = [];
      for (const img of await images.all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(image => image.decode());
        const state = await img.evaluate(image => ({
          src: image.getAttribute("src"), selected: image.currentSrc,
          width: image.clientWidth, height: image.clientHeight,
          declaredWidth: Number(image.getAttribute("width")), declaredHeight: Number(image.getAttribute("height")),
          objectFit: getComputedStyle(image).objectFit,
        }));
        const item = bySrc.get(state.src);
        assert.ok(item);
        const selected = new URL(state.selected).pathname;
        assert.ok(selected.startsWith("/assets/responsive/articles/") && selected.endsWith(".webp"), selected);
        assert.equal(requested.has(state.src), false, "Browser should not download the original fallback too");
        assert.equal(state.declaredWidth, item.width);
        assert.equal(state.declaredHeight, item.height);
        if (route.family_id !== "articles-index") {
          assert.ok(Math.abs(state.height - state.width * item.height / item.width) <= 1.5, "Article photo aspect ratio changed");
        }
        const sourceWidth = Number(selected.match(/-(\d+)\.webp$/)[1]);
        assert.ok(sourceWidth <= item.width, "Do not upscale originals");
        assert.ok(sourceWidth >= Math.min(state.width * dpr, item.width) - 1, "Selected image is too small for rendered size/DPR");
        const originalBytes = (await stat(path.join(root, item.src))).size;
        const selectedBytes = (await stat(path.join(dist, selected))).size;
        assert.ok(selectedBytes < originalBytes, "Responsive photo must reduce image payload");
        photos.push({ ...state, selected: selected, sourceWidth, originalBytes, selectedBytes });
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      assert.deepEqual(errors, []);
      results.push({ path: route.path, language: route.language, width, dpr, photos });
      await context.close();
    }
  }
} finally {
  await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await mkdir(out, { recursive: true });
  await writeFile(path.join(out, "article-images.json"), JSON.stringify({ origin, results }, null, 2));
}
console.log(`article-images: ${results.length} page/viewport/DPR checks passed`);
