#!/usr/bin/env node

import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");
const out = path.join(root, "artifacts", "visual", "latest");
const visual = JSON.parse(await readFile(path.join(out, "summary.json"), "utf8"));
const requiredTokens = ["--bg", "--surface", "--text", "--muted", "--accent", "--border"];
const minTarget = 24;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

const playwrightPath = path.join(root, ".visual-tools", "node_modules", "playwright", "index.mjs");
const { chromium } = await import(pathToFileURL(playwrightPath).href);
const browser = await chromium.launch({ headless: true });
const results = [];

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

try {
  for (const target of visual.targets) {
    for (const [width, height] of visual.viewports) {
      console.log(`a11y: ${target.path} @ ${width}x${height}`);
      const context = await browser.newContext({ viewport: { width, height }, locale: "es-ES", timezoneId: "Europe/Madrid", reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.route("http://vvc.local/**", localRoute);
      await page.goto(new URL(target.path, "http://vvc.local").href, { waitUntil: "networkidle" });

      const audit = await page.evaluate(({ requiredTokens, minTarget }) => {
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
        };
        const describe = (element) => {
          const text = (element.getAttribute("aria-label") || element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
          return `${element.tagName.toLowerCase()}${text ? ` \"${text}\"` : ""}`;
        };
        const tokenStyle = getComputedStyle(document.body);
        const tokens = Object.fromEntries(requiredTokens.map((token) => [token, tokenStyle.getPropertyValue(token).trim()]));
        const missingTokens = requiredTokens.filter((token) => !tokens[token]);
        const controlSelector = "button,summary,[role='button'],.button,.language-switcher a,.article-languages a,.menu nav a,.header-contact";
        const targetViolations = [...document.querySelectorAll(controlSelector)].filter(visible).map((element) => {
          const rect = element.getBoundingClientRect();
          return { element: describe(element), width: Math.round(rect.width * 10) / 10, height: Math.round(rect.height * 10) / 10 };
        }).filter((item) => item.width < minTarget || item.height < minTarget);
        const nonZeroTime = (value) => value.split(",").some((part) => parseFloat(part) > 0.001);
        const motionViolations = [];
        for (const element of document.querySelectorAll("body *")) {
          if (!visible(element)) continue;
          const style = getComputedStyle(element);
          if (nonZeroTime(style.animationDuration) || nonZeroTime(style.transitionDuration)) {
            motionViolations.push({ element: describe(element), animationDuration: style.animationDuration, transitionDuration: style.transitionDuration });
            if (motionViolations.length >= 12) break;
          }
        }
        const focusableSelector = "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex='-1'])";
        return {
          tokens,
          missingTokens,
          targetViolations,
          motion: { mediaMatches: matchMedia("(prefers-reduced-motion: reduce)").matches, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior, violations: motionViolations },
          focusableCount: [...document.querySelectorAll(focusableSelector)].filter(visible).length,
        };
      }, { requiredTokens, minTarget });

      const focusChecks = [];
      const focusFailures = [];
      const seen = new Set();
      const maxTabs = Math.min(Math.max(audit.focusableCount + 2, 8), 36);
      for (let index = 0; index < maxTabs; index += 1) {
        await page.keyboard.press("Tab");
        const focus = await page.evaluate(() => {
          const active = document.activeElement;
          if (!active || active === document.body || active === document.documentElement) return null;
          const style = getComputedStyle(active);
          const text = (active.getAttribute("aria-label") || active.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
          const key = `${active.tagName}:${active.getAttribute("href") || ""}:${text}`;
          const outlineVisible = style.outlineStyle !== "none" && parseFloat(style.outlineWidth || "0") > 0;
          const shadowVisible = style.boxShadow && style.boxShadow !== "none";
          return { key, element: `${active.tagName.toLowerCase()}${text ? ` \"${text}\"` : ""}`, outline: `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}`, visibleIndicator: outlineVisible || shadowVisible };
        });
        if (!focus || seen.has(focus.key)) continue;
        seen.add(focus.key);
        focusChecks.push(focus);
        if (!focus.visibleIndicator) focusFailures.push(focus);
        if (focusChecks.length >= 24) break;
      }

      results.push({ target, width, height, ...audit, focusChecks, focusFailures });
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const blocking = [];
for (const result of results) {
  const label = `${result.target.path} @${result.width}`;
  if (result.missingTokens.length) blocking.push(`${label}: missing semantic tokens ${result.missingTokens.join(", ")}`);
  if (result.targetViolations.length) blocking.push(`${label}: ${result.targetViolations.length} control target(s) smaller than ${minTarget}px`);
  if (!result.motion.mediaMatches) blocking.push(`${label}: reduced-motion preference did not reach the page`);
  if (result.motion.violations.length) blocking.push(`${label}: ${result.motion.violations.length} visible motion rule(s) remain under reduced motion`);
  if (result.focusableCount > 0 && result.focusChecks.length === 0) blocking.push(`${label}: keyboard traversal did not reach a focusable control`);
  if (result.focusFailures.length) blocking.push(`${label}: ${result.focusFailures.length} sampled keyboard focus target(s) lack a visible indicator`);
}

const rows = results.map((result) => `| ${result.target.path} | ${result.width}x${result.height} | ${result.missingTokens.length} | ${result.targetViolations.length} | ${result.focusFailures.length} | ${result.motion.violations.length} | ${result.motion.scrollBehavior} |`).join("\n");
const report = `# Accessibility QA report\n\n${blocking.length ? `**FAIL** - ${blocking.length} blocking finding(s).` : "**PASS** - semantic tokens, target size, sampled keyboard focus and reduced-motion checks passed."}\n\nMinimum checked control target: ${minTarget}px. Inline text links are excluded from target-size enforcement because WCAG 2.2 provides an inline-link exception.\n\n| Route | Viewport | Missing tokens | Small controls | Focus failures | Motion rules | Scroll behavior |\n| --- | ---: | ---: | ---: | ---: | ---: | --- |\n${rows}\n\n${blocking.length ? `## Blocking findings\n\n${blocking.map((item) => `- ${item}`).join("\n")}\n\n` : ""}## Scope\n\nEvery tested page must expose --bg, --surface, --text, --muted, --accent and --border. Focus is sampled with real Tab traversal. Reduced-motion fails when visible CSS transitions or animations exceed 1 ms; computed scroll behavior is recorded for review.\n`;
await writeFile(path.join(out, "accessibility.json"), `${JSON.stringify({ minTarget, results, blocking }, null, 2)}\n`, "utf8");
await writeFile(path.join(out, "accessibility.md"), report, "utf8");
console.log(`a11y: report -> ${path.relative(root, path.join(out, "accessibility.md"))}`);
if (blocking.length) process.exitCode = 1;
