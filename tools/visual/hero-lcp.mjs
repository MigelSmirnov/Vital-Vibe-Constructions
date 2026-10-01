#!/usr/bin/env node

import http from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");
const out = path.join(root, "artifacts", "visual", "latest");
const shots = path.join(out, "screenshots");
const viewports = [[390, 844], [768, 1024], [1440, 1000]];
const routePath = "/";
const profile = {
  name: "network-only-fast-3g-like",
  latencyMs: 150,
  downloadBps: Math.round((1.6 * 1024 * 1024) / 8),
  uploadBps: Math.round((750 * 1024) / 8),
  deviceScaleFactor: 1,
  cpuThrottling: 1,
  cache: "disabled",
};
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

await mkdir(shots, { recursive: true });

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    let file = path.join(dist, pathname);
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    } catch {
      if (!path.extname(file)) file = path.join(file, "index.html");
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
      "content-length": body.length,
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain", "cache-control": "no-store" });
    res.end("Not found");
  }
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const origin = `http://127.0.0.1:${server.address().port}`;

const playwrightPath = path.join(root, ".visual-tools", "node_modules", "playwright", "index.mjs");
const { chromium } = await import(pathToFileURL(playwrightPath).href).catch(() => {
  throw new Error("Playwright is missing. Run: bash tools/visual/run.sh");
});

const browser = await chromium.launch({ headless: true });
const results = [];
const advisories = [];

try {
  for (const [width, height] of viewports) {
    console.log(`hero-lcp: ${routePath} @ ${width}x${height}`);
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: profile.deviceScaleFactor,
      locale: "es-ES",
      timezoneId: "Europe/Madrid",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      window.__vvcLcpEntries = [];
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const element = entry.element;
            window.__vvcLcpEntries.push({
              startTime: entry.startTime,
              renderTime: entry.renderTime,
              loadTime: entry.loadTime,
              size: entry.size,
              id: entry.id || null,
              url: entry.url || null,
              element: element ? {
                tag: element.tagName,
                id: element.id || null,
                className: typeof element.className === "string" ? element.className : null,
                text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 180) || null,
              } : null,
            });
          }
        });
        observer.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        // The report records an advisory if this Chromium build exposes no LCP entries.
      }
    });

    const client = await context.newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Network.setCacheDisabled", { cacheDisabled: true });
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: profile.latencyMs,
      downloadThroughput: profile.downloadBps,
      uploadThroughput: profile.uploadBps,
      connectionType: "cellular3g",
    });

    const failures = [];
    page.on("requestfailed", (request) => failures.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || "failed"}`));
    page.on("response", (response) => {
      if (response.url().startsWith(origin) && response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
    });

    const navigation = await page.goto(new URL(routePath, origin).href, { waitUntil: "networkidle", timeout: 45000 });
    if (!navigation?.ok()) failures.push(`navigation ${navigation?.status() || "failed"}`);
    await page.waitForTimeout(1200);

    const measurement = await page.evaluate(() => {
      const image = document.querySelector(".hero-image");
      const latestLcp = window.__vvcLcpEntries?.at(-1) || null;
      const rect = image?.getBoundingClientRect();
      const computed = image ? getComputedStyle(image) : null;
      const currentSrc = image?.currentSrc || image?.src || null;
      const resource = currentSrc
        ? performance.getEntriesByType("resource").find((entry) => entry.name === currentSrc)
        : null;
      const nav = performance.getEntriesByType("navigation")[0];
      const picture = image?.closest("picture");
      const pictureSources = picture
        ? [...picture.querySelectorAll("source")].map((source) => ({
            type: source.getAttribute("type"),
            srcset: source.getAttribute("srcset"),
            sizes: source.getAttribute("sizes"),
          }))
        : [];
      const sourceSrcsets = pictureSources.map((source) => source.srcset).filter(Boolean);
      const responsiveCandidates = Boolean(image?.getAttribute("srcset") || sourceSrcsets.length);
      const effectiveSizes = image?.getAttribute("sizes") || pictureSources.find((source) => source.sizes)?.sizes || null;
      const preload = currentSrc
        ? [...document.querySelectorAll('link[rel="preload"][as="image"]')].some((link) => {
            const href = link.href;
            return href === currentSrc
              || (link.imageSrcset && link.imageSrcset === image?.srcset)
              || (link.imageSrcset && sourceSrcsets.includes(link.imageSrcset));
          })
        : false;
      return {
        title: document.title,
        hero: image ? {
          src: image.getAttribute("src"),
          currentSrc,
          imgSrcset: image.getAttribute("srcset"),
          imgSizes: image.getAttribute("sizes"),
          pictureSources,
          responsiveCandidates,
          effectiveSizes,
          loading: image.getAttribute("loading") || "eager-default",
          fetchPriority: image.fetchPriority || image.getAttribute("fetchpriority") || "auto",
          decoding: image.decoding || image.getAttribute("decoding") || "auto",
          widthAttr: image.getAttribute("width"),
          heightAttr: image.getAttribute("height"),
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          complete: image.complete,
          rendered: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height, bottom: rect.bottom } : null,
          objectFit: computed?.objectFit || null,
          objectPosition: computed?.objectPosition || null,
          inInitialViewport: rect ? rect.top < innerHeight && rect.bottom > 0 : false,
          pictureSourceCount: pictureSources.length,
          preload,
        } : null,
        lcp: latestLcp,
        resource: resource ? {
          startTime: resource.startTime,
          duration: resource.duration,
          responseStart: resource.responseStart,
          responseEnd: resource.responseEnd,
          transferSize: resource.transferSize,
          encodedBodySize: resource.encodedBodySize,
          decodedBodySize: resource.decodedBodySize,
        } : null,
        navigation: nav ? {
          responseStart: nav.responseStart,
          domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
          loadEventEnd: nav.loadEventEnd,
        } : null,
      };
    });

    let heroFileBytes = null;
    let heroPathname = null;
    let selectedResponsive = false;
    if (measurement.hero?.currentSrc) {
      heroPathname = new URL(measurement.hero.currentSrc, origin).pathname;
      selectedResponsive = heroPathname.startsWith("/assets/responsive/home/kitchen-living-") && heroPathname.endsWith(".webp");
      try {
        heroFileBytes = (await stat(path.join(dist, decodeURIComponent(heroPathname)))).size;
      } catch {
        advisories.push(`${width}x${height}: could not stat hero currentSrc ${heroPathname}`);
      }
    }
    if (!measurement.hero) advisories.push(`${width}x${height}: .hero-image not found`);
    if (measurement.hero && (!measurement.hero.complete || measurement.hero.naturalWidth === 0)) advisories.push(`${width}x${height}: hero image did not decode`);
    if (!measurement.lcp) advisories.push(`${width}x${height}: Chromium exposed no LCP entry; delivery metrics remain valid`);
    if (measurement.hero?.responsiveCandidates && !selectedResponsive) advisories.push(`${width}x${height}: responsive hero markup exists but currentSrc remained ${heroPathname}`);
    if (failures.length) advisories.push(`${width}x${height}: ${failures.length} request/navigation failure(s)`);

    const screenshot = `hero-lcp--${width}x${height}.png`;
    await page.screenshot({ path: path.join(shots, screenshot), fullPage: false });
    results.push({
      width,
      height,
      screenshot: `screenshots/${screenshot}`,
      failures,
      heroPathname,
      heroFileBytes,
      selectedResponsive,
      ...measurement,
    });
    await context.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

const heroIsLcp = (result) => {
  const element = result.lcp?.element;
  if (!element || !result.hero) return false;
  if (element.tag !== "IMG") return false;
  if (typeof element.className !== "string") return false;
  return element.className.split(/\s+/).includes("hero-image");
};

const rows = results.map((result) => {
  const lcpElement = result.lcp?.element
    ? `${result.lcp.element.tag}${result.lcp.element.className ? `.${result.lcp.element.className.replace(/\s+/g, ".")}` : ""}`
    : "-";
  const lcpMs = result.lcp?.startTime != null ? Math.round(result.lcp.startTime) : "-";
  const rendered = result.hero?.rendered ? `${Math.round(result.hero.rendered.width)}x${Math.round(result.hero.rendered.height)}` : "-";
  const natural = result.hero ? `${result.hero.naturalWidth}x${result.hero.naturalHeight}` : "-";
  return `| ${result.width}x${result.height} | ${lcpElement} | ${lcpMs} | ${result.heroPathname || "-"} | ${result.heroFileBytes ?? "-"} | ${rendered} | ${natural} | ${result.hero?.responsiveCandidates ? "yes" : "no"} | ${result.selectedResponsive ? "yes" : "no"} | ${result.hero?.preload ? "yes" : "no"} | ${result.hero?.fetchPriority || "-"} |`;
}).join("\n");

const lcpCount = results.filter(heroIsLcp).length;
const sameSourceEverywhere = new Set(results.map((result) => result.heroPathname).filter(Boolean)).size === 1;
const noResponsiveMarkupEverywhere = results.every((result) => !result.hero?.responsiveCandidates);
const selectedResponsiveEverywhere = results.every((result) => result.selectedResponsive);
const recommendations = [];
if (lcpCount > 0 && sameSourceEverywhere && noResponsiveMarkupEverywhere) {
  recommendations.push("The hero participates in LCP and the same single source is delivered at every reference width with no responsive candidates. The next experiment should be width-based responsive hero candidates while retaining the existing JPEG fallback and crop behavior.");
}
if (selectedResponsiveEverywhere) {
  recommendations.push("Chromium selected the responsive WebP hero at every reference width. Compare these timings and bytes with the prior single-JPEG baseline before changing preload or fetch strategy.");
}
if (results.some((result) => result.hero?.fetchPriority === "high")) {
  recommendations.push("fetchpriority=high is already present. Do not add preload by default; compare resource start timing after responsive delivery before deciding whether preload adds value or only duplicates discovery hints.");
}
recommendations.push("Treat the reported LCP milliseconds as a controlled network-only synthetic comparison, not field Core Web Vitals. No CPU throttling is applied and the origin is a local release bundle server.");

const report = `# Homepage hero / LCP measurement\n\nProfile: **${profile.name}** — cold cache, DPR 1, ${profile.latencyMs} ms latency, ${(profile.downloadBps * 8 / 1024 / 1024).toFixed(1)} Mbps down, ${(profile.uploadBps * 8 / 1024).toFixed(0)} kbps up, no CPU throttling.\n\n| Viewport | Observed LCP element | Synthetic LCP ms | Hero resource | File bytes | Rendered px | Natural px | Responsive candidates | Selected responsive | preload | fetchpriority |\n| --- | --- | ---: | --- | ---: | --- | --- | --- | --- | --- | --- |\n${rows}\n\nHero image was the observed LCP element in **${lcpCount}/${results.length}** reference viewports.\n\n## Decision notes\n\n${recommendations.map((item) => `- ${item}`).join("\n")}\n\n${advisories.length ? `## Advisories\n\n${advisories.map((item) => `- ${item}`).join("\n")}\n` : ""}`;

await writeFile(path.join(out, "hero-lcp.json"), `${JSON.stringify({ profile, results, advisories, recommendations }, null, 2)}\n`, "utf8");
await writeFile(path.join(out, "hero-lcp.md"), report, "utf8");
console.log(`hero-lcp: report -> ${path.relative(root, path.join(out, "hero-lcp.md"))}`);
