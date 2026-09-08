#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const outputRoot = path.join(root, "site-next");
const sourcePath = path.join(outputRoot, "index.html");
const localizationPath = path.join(root, "content/tables/home-localizations.yaml");
const canonicalOrigin = "https://vitalvibeconstruction.com";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function languageLinks(activeLanguage) {
  const links = [
    ["es", "/", "ES"],
    ["en", "/en/", "EN"],
    ["ru", "/ru/", "RU"],
  ];
  return `<div class="language-switcher" aria-label="Language">${links
    .map(([language, href, label]) => `<a href="${href}" lang="${language}"${language === activeLanguage ? ' aria-current="page"' : ""}>${label}</a>`)
    .join("")}</div>`;
}

function alternateLinks() {
  return [
    ["es", "/"],
    ["en", "/en/"],
    ["ru", "/ru/"],
    ["x-default", "/"],
  ].map(([language, pathname]) => `  <link rel="alternate" hreflang="${language}" href="${canonicalOrigin}${pathname}">`).join("\n");
}

function addLanguageNavigation(html, activeLanguage) {
  const navigation = html.includes("<!-- home-language-switcher -->")
    ? html.replace("<!-- home-language-switcher -->", languageLinks(activeLanguage))
    : html.replace("      </nav>", `      </nav>\n      ${languageLinks(activeLanguage)}`);
  return navigation
    .replace("  <meta name=\"twitter:card\" content=\"summary_large_image\">", `  <meta name="twitter:card" content="summary_large_image">\n${alternateLinks()}`);
}

function localize(source, language, config) {
  let html = source
    .replace('<html lang="es">', `<html lang="${language}">`)
    .replace('href="./styles.css"', 'href="/styles.css"')
    .replaceAll('href="./projects/', 'href="/projects/')
    .replace(`<link rel="canonical" href="${canonicalOrigin}/">`, `<link rel="canonical" href="${canonicalOrigin}${config.path}">`)
    .replace(`<meta property="og:url" content="${canonicalOrigin}/">`, `<meta property="og:url" content="${canonicalOrigin}${config.path}">`);

  const entries = Object.entries(config.replacements).sort(([a], [b]) => b.length - a.length);
  for (const [spanish, translation] of entries) {
    html = html.replace(new RegExp(escapeRegExp(spanish), "g"), translation);
  }
  return addLanguageNavigation(html, language);
}

async function main() {
  const [source, localizationRaw] = await Promise.all([
    readFile(sourcePath, "utf8"),
    readFile(localizationPath, "utf8"),
  ]);
  const { locales } = JSON.parse(localizationRaw);

  await writeFile(sourcePath, addLanguageNavigation(source, "es"), "utf8");
  for (const [language, config] of Object.entries(locales)) {
    const destination = path.join(outputRoot, language);
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, "index.html"), localize(source, language, config), "utf8");
  }

  console.log(`Built localized homepages: ${["es", ...Object.keys(locales)].join(", ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
