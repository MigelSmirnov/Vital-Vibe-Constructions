#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const outputRoot = path.join(root, "site-next");
const sourcePath = path.join(outputRoot, "index.html");
const homeStylesOutputPath = path.join(outputRoot, "home-redesign.css");
const homeStylesPath = path.join(root, "tools", "site-next", "home-redesign.css");
const homeCorrectionsOutputPath = path.join(outputRoot, "home-corrections.css");
const homeCorrectionsPath = path.join(root, "tools", "site-next", "home-corrections.css");
const localizationPath = path.join(root, "content/tables/home-localizations.yaml");
const canonicalOrigin = "https://vitalvibeconstruction.com";

const additions = {
  es: {
    nav: "Guías",
    eyebrow: "Guías de obra / documentación técnica",
    title: "Explicamos cómo pensamos el trabajo.",
    paintingTitle: "Pintura de paredes: precio y preparación",
    paintingSummary: "Por qué no basta con repintar y qué determina realmente el coste.",
    kitchenTitle: "Cómo planificar una reforma de cocina",
    kitchenSummary: "Distribución, instalaciones, decisiones y preparación previa.",
    open: "Abrir documento ↗",
    projectAlt: "Pasillo reformado",
  },
  en: {
    nav: "Guides",
    eyebrow: "Work guides / technical documentation",
    title: "How we approach the work.",
    paintingTitle: "Wall painting: price and preparation",
    paintingSummary: "Why repainting alone is not enough and what really determines the cost.",
    kitchenTitle: "How to plan a kitchen renovation",
    kitchenSummary: "Layout, services, decisions and preparation before work begins.",
    open: "Open document ↗",
    projectAlt: "Renovated hallway",
  },
  ru: {
    nav: "Статьи",
    eyebrow: "Практические материалы / техническая документация",
    title: "Объясняем, как мы планируем и выполняем работы.",
    paintingTitle: "Покраска стен: цена и подготовка",
    paintingSummary: "Почему недостаточно просто перекрасить и от чего на самом деле зависит стоимость.",
    kitchenTitle: "Как спланировать ремонт кухни",
    kitchenSummary: "Планировка, инженерия, решения и подготовка до начала работ.",
    open: "Открыть материал ↗",
    projectAlt: "Коридор после ремонта",
  },
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
  return html
    .replace("  <meta name=\"twitter:card\" content=\"summary_large_image\">", `  <meta name="twitter:card" content="summary_large_image">\n${alternateLinks()}`)
    .replace("      </nav>", `      </nav>\n      ${languageLinks(activeLanguage)}`);
}

function markHomepage(html) {
  return html
    .replace("<body>", '<body class="home">')
    .replace("</head>", '  <link rel="stylesheet" href="/home-redesign.css">\n  <link rel="stylesheet" href="/home-corrections.css">\n</head>');
}

function renderGuideSection(language) {
  const text = additions[language] ?? additions.es;
  return `    <section class="section guides" id="guias">
      <div class="container">
        <p class="eyebrow">${escapeHtml(text.eyebrow)}</p>
        <h2>${escapeHtml(text.title)}</h2>
        <div class="guide-grid">
          <article class="guide-card">
            <div class="sheet-mini"><span>A</span><strong>VVC-ART-002</strong><small>HOJA 01</small></div>
            <h3>${escapeHtml(text.paintingTitle)}</h3>
            <p>${escapeHtml(text.paintingSummary)}</p>
            <a class="guide-link" href="/sandbox/articles/?article=pintura-paredes-barcelona">${escapeHtml(text.open)}</a>
          </article>
          <article class="guide-card">
            <div class="sheet-mini"><span>B</span><strong>VVC-ART-001</strong><small>HOJA 01</small></div>
            <h3>${escapeHtml(text.kitchenTitle)}</h3>
            <p>${escapeHtml(text.kitchenSummary)}</p>
            <a class="guide-link" href="/sandbox/articles/?article=reforma-cocina-barcelona">${escapeHtml(text.open)}</a>
          </article>
        </div>
      </div>
    </section>\n\n`;
}

function enhanceHomepage(html, language) {
  const text = additions[language] ?? additions.es;
  const projectPattern = /(<article class="project-card" id="piso-reformado-barcelona">[\s\S]*?<a class="project-card-media" href="[^"]+">\s*)<img[^>]+>/;

  return html
    .replace(
      '        <a href="#planificador">',
      `        <a href="#guias">${escapeHtml(text.nav)}</a>\n        <a href="#planificador">`,
    )
    .replace(
      projectPattern,
      `$1<img src="../proyecto-2/b7.jpeg" alt="${escapeHtml(text.projectAlt)}" width="1200" height="1600" loading="lazy">`,
    )
    .replace(
      '    <section class="section planner" id="planificador">',
      `${renderGuideSection(language)}    <section class="section planner" id="planificador">`,
    );
}

function localize(source, language, config) {
  let html = markHomepage(source)
    .replace('<html lang="es">', `<html lang="${language}">`)
    .replace('href="./styles.css"', 'href="/styles.css"')
    .replaceAll('href="./projects/', 'href="/projects/')
    .replace(`<link rel="canonical" href="${canonicalOrigin}/">`, `<link rel="canonical" href="${canonicalOrigin}${config.path}">`)
    .replace(`<meta property="og:url" content="${canonicalOrigin}/">`, `<meta property="og:url" content="${canonicalOrigin}${config.path}">`);

  const entries = Object.entries(config.replacements).sort(([a], [b]) => b.length - a.length);
  for (const [spanish, translation] of entries) {
    html = html.replace(new RegExp(escapeRegExp(spanish), "g"), translation);
  }
  return addLanguageNavigation(enhanceHomepage(html, language), language);
}

async function main() {
  const [source, localizationRaw, homeStyles, homeCorrections] = await Promise.all([
    readFile(sourcePath, "utf8"),
    readFile(localizationPath, "utf8"),
    readFile(homeStylesPath, "utf8"),
    readFile(homeCorrectionsPath, "utf8"),
  ]);
  const { locales } = JSON.parse(localizationRaw);

  await writeFile(sourcePath, addLanguageNavigation(enhanceHomepage(markHomepage(source), "es"), "es"), "utf8");
  await writeFile(homeStylesOutputPath, homeStyles, "utf8");
  await writeFile(homeCorrectionsOutputPath, homeCorrections, "utf8");
  for (const [language, config] of Object.entries(locales)) {
    const destination = path.join(outputRoot, language);
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, "index.html"), localize(source, language, config), "utf8");
  }

  console.log(`Built localized homepages, guide links and mobile home corrections: ${["es", ...Object.keys(locales)].join(", ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
