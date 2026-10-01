#!/usr/bin/env node

import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");
const out = path.join(root, "artifacts", "visual", "latest");
const viewports = [[390, 844], [768, 1024], [1440, 1000]];
const homes = ["/", "/en/", "/ru/"];

const homepageImages = [
  {
    label: "featured bathroom",
    selector: 'img[src="/assets/home/bathroom-retouched.png"]',
    selectedPrefix: "/assets/responsive/home/bathroom-retouched-",
  },
  {
    label: "standard kitchen",
    selector: 'img[src="/estandar/cocina.jpeg"]',
    selectedPrefix: "/assets/responsive/estandar/cocina-",
  },
  {
    label: "Smart Home lead panel",
    selector: 'img[src="/smart/gira.jpeg"]',
    selectedPrefix: "/assets/responsive/smart/gira-",
  },
  {
    label: "Smart Home marble panel",
    selector: 'img[src="/premium/panel-marmol.jpeg"]',
    selectedPrefix: "/assets/responsive/premium/panel-marmol-",
  },
  {
    label: "Smart Home partner panel",
    selector: 'img[src="/premium/gira.jpeg"]',
    selectedPrefix: "/assets/responsive/premium/gira-",
  },
  {
    label: "Smart Home integration panel",
    selector: 'img[src="/premium/apple-home.jpeg"]',
    selectedPrefix: "/assets/responsive/premium/apple-home-",
  },
  {
    label: "Smart Home lighting scenes",
    selector: 'img[src="/smart/escenas.jpeg"]',
    selectedPrefix: "/assets/responsive/smart/escenas-",
  },
];

const standardProjectImages = [
  ["cocina", "standard project lead kitchen"],
  ["obra", "standard project construction"],
  ["suelo-base", "standard project floor base"],
  ["parquet", "standard project parquet"],
  ["pintura", "standard project painting"],
  ["pasillo", "standard project hallway"],
].map(([name, label]) => ({
  label,
  selector: `img[src="/estandar/${name}.jpeg"]`,
  selectedPrefix: `/assets/responsive/estandar/${name}-`,
}));

const cases = [
  ...homes.map((routePath) => ({ routePath, images: homepageImages })),
  { routePath: "/projects/", images: [standardProjectImages[0]] },
  { routePath: "/projects/reforma-integral-estandar-barcelona/", images: standardProjectImages },
];

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

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
    await route.fulfill({
      status: 200,
      body,
      contentType: types[path.extname(file).toLowerCase()] || "application/octet-stream",
    });
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
  for (const testCase of cases) {
    for (const [width, height] of viewports) {
      const routePath = testCase.routePath;
      console.log(`responsive-images: ${routePath} @ ${width}x${height}`);
      const context = await browser.newContext({ viewport: { width, height }, locale: "es-ES", timezoneId: "Europe/Madrid" });
      const page = await context.newPage();
      const requested = new Set();
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (url.hostname === "vvc.local") requested.add(url.pathname);
      });
      await page.route("http://vvc.local/**", localRoute);
      await page.goto(new URL(routePath, "http://vvc.local").href, { waitUntil: "networkidle" });

      for (const item of testCase.images) {
        const image = page.locator(item.selector);
        const count = await image.count();
        if (count !== 1) {
          blocking.push(`${routePath} @${width}: expected one ${item.label} fallback image, found ${count}`);
          results.push({ route: routePath, width, height, label: item.label, fallbackFound: count, selected: null, requested: false, bytes: null });
          continue;
        }

        await image.evaluate((element) => { element.loading = "eager"; });
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element) => element.decode?.().catch(() => undefined));

        const currentSrc = await image.evaluate((element) => element.currentSrc || element.src);
        const selected = new URL(currentSrc, "http://vvc.local").pathname;
        const selectedOk = selected.startsWith(item.selectedPrefix) && selected.endsWith(".webp");
        const wasRequested = requested.has(selected);
        let bytes = null;
        try {
          bytes = (await stat(path.join(dist, selected))).size;
        } catch {
          // The missing file is reported below as a blocking finding.
        }

        if (!selectedOk) blocking.push(`${routePath} @${width}: ${item.label} selected ${selected} instead of a responsive WebP`);
        if (!wasRequested) blocking.push(`${routePath} @${width}: browser did not request selected ${item.label} resource ${selected}`);
        if (bytes === null) blocking.push(`${routePath} @${width}: selected ${item.label} resource is missing from the release bundle: ${selected}`);

        results.push({
          route: routePath,
          width,
          height,
          label: item.label,
          fallbackFound: count,
          selected,
          requested: wasRequested,
          bytes,
        });
      }

      await context.close();
    }
  }
} finally {
  await browser.close();
}

const rows = results.map((result) => `| ${result.route} | ${result.width}x${result.height} | ${result.label} | ${result.selected ?? "-"} | ${result.requested ? "yes" : "no"} | ${result.bytes ?? "-"} |`).join("\n");
const report = `# Responsive image browser report\n\n${blocking.length ? `**FAIL** - ${blocking.length} blocking finding(s).` : "**PASS** - Chromium selected and requested responsive WebP sources for the optimized homepage and standard-project images."}\n\n| Route | Viewport | Image | Selected resource | Requested | Bytes |\n| --- | ---: | --- | --- | --- | ---: |\n${rows}\n\n${blocking.length ? `## Blocking findings\n\n${blocking.map((item) => `- ${item}`).join("\n")}\n` : ""}`;

await writeFile(path.join(out, "responsive-images.json"), `${JSON.stringify({ results, blocking }, null, 2)}\n`, "utf8");
await writeFile(path.join(out, "responsive-images.md"), report, "utf8");
console.log(`responsive-images: report -> ${path.relative(root, path.join(out, "responsive-images.md"))}`);
if (blocking.length) process.exitCode = 1;
