#!/usr/bin/env node

import http from "node:http";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");
const out = path.join(root, "artifacts", "visual", "latest");
const shots = path.join(out, "screenshots");
const viewports = [[390, 844], [768, 1024], [1440, 1000]];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await writeFile(path.join(out, "status.txt"), "Visual QA started; see workflow logs if no report was produced.\n", "utf8");

function scalar(value) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed === "null") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) return trimmed.slice(1, -1);
  return trimmed;
}

function parseConstantsYaml(text) {
  const defaultMatch = text.match(/^\s{2}default_language:\s*(.+?)\s*$/m);
  const languageBlock = text.match(/^\s{2}supported_languages:\s*\n((?:^\s{4}-\s*.+\n?)+)/m);
  if (!defaultMatch || !languageBlock) throw new Error("Could not resolve site languages from architecture/constants.yaml");
  const supportedLanguages = [...languageBlock[1].matchAll(/^\s{4}-\s*(.+?)\s*$/gm)].map((match) => scalar(match[1]));
  return { site: { default_language: scalar(defaultMatch[1]), supported_languages: supportedLanguages } };
}

function parseRouteContractYaml(text) {
  const routes = [];
  let inRoutes = false;
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    if (!inRoutes) {
      if (/^routes:\s*$/.test(line)) inRoutes = true;
      continue;
    }
    if (/^[A-Za-z_][A-Za-z0-9_-]*:\s*$/.test(line)) break;
    let match = line.match(/^\s{2}-\s+([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (match) {
      if (current) routes.push(current);
      current = {};
      const value = scalar(match[2]);
      if (value !== undefined) current[match[1]] = value;
      continue;
    }
    match = line.match(/^\s{4}([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (match && current) {
      const value = scalar(match[2]);
      if (value !== undefined) current[match[1]] = value;
    }
  }
  if (current) routes.push(current);
  if (!routes.length) throw new Error("Could not resolve generated routes from architecture/project-routes.yaml");
  return { routes };
}

function parseDocument(text, yamlFallback) {
  try { return JSON.parse(text); }
  catch { return yamlFallback(text); }
}

const routeText = await readFile(path.join(root, "architecture", "project-routes.yaml"), "utf8");
const constantsText = await readFile(path.join(root, "architecture", "constants.yaml"), "utf8");
const routes = parseDocument(routeText, parseRouteContractYaml);
const constants = parseDocument(constantsText, parseConstantsYaml);
const languages = constants.site.supported_languages;
const homes = languages.map((lang) => ({ type: "home", lang, path: lang === constants.site.default_language ? "/" : `/${lang}/` }));
const generated = routes.routes.filter((route) => route.status === "generated");
const articles = generated.filter((route) => route.family_id === "article-detail").map((route) => ({ type: "article", lang: route.language, entity: route.entity_id, path: route.path }));
const gallery = generated.find((route) => route.family_id === "gallery-index");
const project = generated.find((route) => route.entity_id === "project-studio-renovation-barcelona");
if (!gallery || !project || !articles.length) throw new Error("Visual routes cannot be resolved from architecture/project-routes.yaml");
const targets = [...homes, ...articles, { type: "gallery", path: gallery.path }, { type: "project", path: project.path }];

const playwrightPath = path.join(root, ".visual-tools", "node_modules", "playwright", "index.mjs");
const { chromium } = await import(pathToFileURL(playwrightPath).href).catch(() => {
  throw new Error("Playwright is missing. Run: bash tools/visual/run.sh");
});

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    let file = path.join(dist, pathname);
    try { if ((await stat(file)).isDirectory()) file = path.join(file, "index.html"); }
    catch { if (!path.extname(file)) file = path.join(file, "index.html"); }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
  }
});
await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
const origin = `http://127.0.0.1:${server.address().port}`;

await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

const slug = (route) => route === "/" ? "home-es" : route.replace(/^\//, "").replace(/\/$/, "").replace(/[^a-zA-Z0-9._-]+/g, "-");
const expectedArticlePaths = new Map();
for (const article of articles) {
  const group = expectedArticlePaths.get(article.entity) || [];
  group.push(article.path);
  expectedArticlePaths.set(article.entity, group);
}
for (const [key, value] of expectedArticlePaths) expectedArticlePaths.set(key, [...new Set(value)].sort());

try {
  for (const target of targets) {
    for (const [width, height] of viewports) {
      console.log(`visual: ${target.path} @ ${width}x${height}`);
      const context = await browser.newContext({ viewport: { width, height }, locale: "es-ES", timezoneId: "Europe/Madrid", reducedMotion: "reduce" });
      const page = await context.newPage();
      const failures = [];
      page.on("requestfailed", (request) => failures.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || "failed"}`));
      page.on("response", (response) => { if (response.url().startsWith(origin) && response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
      const response = await page.goto(new URL(target.path, origin).href, { waitUntil: "networkidle" });
      if (!response?.ok()) failures.push(`navigation ${response?.status() || "failed"}`);
      await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; await Promise.all([...document.images].map((image) => image.complete ? null : new Promise((done) => { image.addEventListener("load", done, { once: true }); image.addEventListener("error", done, { once: true }); }))); });
      await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}" });
      const state = await page.evaluate(() => ({
        lang: document.documentElement.lang || null,
        title: document.title,
        overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      }));
      let languageSwitch = null;
      if (target.type === "article") {
        languageSwitch = await page.evaluate(() => ({ current: document.querySelectorAll(".article-languages a[aria-current='page']").length, paths: [...document.querySelectorAll(".article-languages a")].map((link) => new URL(link.href, location.href).pathname).sort() }));
        languageSwitch.expected = expectedArticlePaths.get(target.entity);
        languageSwitch.ok = languageSwitch.current === 1 && JSON.stringify([...new Set(languageSwitch.paths)]) === JSON.stringify(languageSwitch.expected);
      }
      const name = `${slug(target.path)}--${width}x${height}.png`;
      await page.screenshot({ path: path.join(shots, name), fullPage: true });
      let menu = null;
      if (target.type === "home" && width === 390) {
        const details = page.locator("details.menu");
        if (await details.count()) {
          await details.locator("summary").click();
          menu = await details.evaluate((element) => ({ open: element.open, overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth) }));
          await page.screenshot({ path: path.join(shots, `${slug(target.path)}--390x844--menu-open.png`), fullPage: true });
        } else menu = { open: false, missing: true, overflow: 0 };
      }
      results.push({ target, width, height, state, failures, languageSwitch, menu, screenshot: `screenshots/${name}` });
      await context.close();
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

const blocking = [];
for (const result of results) {
  const label = `${result.target.path} @${result.width}`;
  if (result.failures.length) blocking.push(`${label}: ${result.failures.length} loading failure(s)`);
  if (result.state.brokenImages.length) blocking.push(`${label}: ${result.state.brokenImages.length} broken image(s)`);
  if (result.state.overflow > 1) blocking.push(`${label}: horizontal overflow +${Math.round(result.state.overflow)}px`);
  if (result.languageSwitch && !result.languageSwitch.ok) blocking.push(`${label}: article language switch differs from route contract`);
  if (result.menu && (!result.menu.open || result.menu.missing)) blocking.push(`${label}: mobile menu did not open`);
  if (result.menu?.overflow > 1) blocking.push(`${label}: open mobile menu overflows +${Math.round(result.menu.overflow)}px`);
}
const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const summary = { generatedAt: new Date().toISOString(), commit, browser: chromium.executablePath(), viewports, targets, results, blocking };
await writeFile(path.join(out, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
const rows = results.map((result) => `| ${result.target.path} | ${result.width}x${result.height} | ${result.state.lang || "-"} | ${Math.round(result.state.overflow)}px | ${result.state.brokenImages.length} | ${result.failures.length} |`).join("\n");
const report = `# Visual QA report\n\nCommit: \`${commit}\`\n\n${blocking.length ? `**FAIL** - ${blocking.length} blocking finding(s).` : "**PASS** - loading, images, horizontal overflow, mobile menu and article language links passed."}\n\n| Route | Viewport | Lang | Overflow | Broken images | Loading failures |\n| --- | ---: | --- | ---: | ---: | ---: |\n${rows}\n\n${blocking.length ? `## Blocking findings\n\n${blocking.map((item) => `- ${item}`).join("\n")}\n\n` : ""}## Human review required\n\nThese checks do not prove visual quality. Review the screenshots for card/photo boundaries, heading wraps, spacing, crops, captions, language correctness and clipped content before choosing a baseline.\n`;
await writeFile(path.join(out, "report.md"), report);
await writeFile(path.join(out, "status.txt"), `${blocking.length ? "FAIL" : "PASS"}: ${blocking.length} blocking finding(s).\n`, "utf8");
console.log(`visual: report -> ${path.relative(root, path.join(out, "report.md"))}`);
if (blocking.length) process.exitCode = 1;
