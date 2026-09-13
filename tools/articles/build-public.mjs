#!/usr/bin/env node
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const knowledge = createKnowledgeRepository(await loadContentTables({ root }));
const site = knowledge.getSite();
const contract = JSON.parse(await readFile(path.join(root, "architecture/project-routes.yaml"), "utf8"));
const routes = contract.routes.filter(route => route.family_id === "article-detail" && route.status === "generated");
const escape = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const labels = {
  es: { home: "Volver al sitio", contents: "En este artículo", skip: "Saltar al contenido", language: "Idioma del artículo", published: "Publicado el", top: "Volver arriba", contact: "Consultar un trabajo similar" },
  en: { home: "Back to the site", contents: "In this article", skip: "Skip to content", language: "Article language", published: "Published on", top: "Back to top", contact: "Discuss a similar job" },
  ru: { home: "На главную", contents: "В этой статье", skip: "Перейти к статье", language: "Язык статьи", published: "Опубликовано", top: "Наверх", contact: "Обсудить похожую работу" },
};

function blockHtml(block) {
  if (block.type === "paragraph") return `<p>${escape(block.text)}</p>`;
  if (block.type === "list") return `<ul>${block.items.map(item => `<li>${escape(item)}</li>`).join("")}</ul>`;
  if (block.type === "image") {
    const media = knowledge.findMediaById(block.media_id);
    if (!media) throw new Error(`Unknown article image ${block.media_id}`);
    return `<figure><img src="/${escape(media.src)}" alt="${escape(block.alt)}" width="${media.width}" height="${media.height}" loading="lazy" decoding="async"><figcaption>${escape(block.caption)}</figcaption></figure>`;
  }
  if (block.type === "source_list") return `<ul class="article-sources">${block.items.map(item => `<li><a href="${escape(item.url)}" rel="noopener noreferrer">${escape(item.label)}</a></li>`).join("")}</ul>`;
  if (block.type === "solar_collector_diagram") return `<figure class="solar-diagram" data-solar-diagram data-playing="true" data-scheme="same" data-play-label="${escape(block.play_label)}" data-pause-label="${escape(block.pause_label)}">
    <div class="solar-controls" aria-label="${escape(block.caption)}"><div class="solar-segment"><button type="button" data-scheme="same" aria-pressed="true">${escape(block.same_side_label)}</button><button type="button" data-scheme="diagonal" aria-pressed="false">${escape(block.diagonal_label)}</button></div><button type="button" data-solar-toggle>${escape(block.pause_label)}</button></div>
    <svg viewBox="0 0 800 470" role="img" aria-label="${escape(block.caption)}"><defs><linearGradient id="solar-heat" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3688c9"/><stop offset=".55" stop-color="#c38255"/><stop offset="1" stop-color="#d85f47"/></linearGradient></defs><circle class="solar-sun" cx="118" cy="78" r="34"/><g class="solar-rays"><path d="M118 24v-15M118 147v-15M64 78H49M187 78h-15M80 40 69 29M167 127l-11-11M80 116l-11 11M167 29l-11 11"/></g><rect class="solar-panel" x="225" y="74" width="390" height="285" rx="12"/><g class="solar-tubes"><path d="M270 323V112M326 323V112M382 323V112M438 323V112M494 323V112M550 323V112"/><path d="M260 112h300M260 323h300"/></g><path class="solar-flow solar-flow-cold" data-cold-path d="M665 398H260V323"/><path class="solar-flow solar-flow-hot" data-hot-path d="M260 112H665V188"/><g class="solar-tank" transform="translate(665 160)"><rect width="82" height="174" rx="18"/><path d="M8 109h66v57H8z"/><text x="41" y="198" text-anchor="middle">${escape(block.tank_label)}</text></g><g class="solar-sensor" transform="translate(548 98)"><circle r="10"/><text x="0" y="-18" text-anchor="middle">${escape(block.sensor_label)}</text></g><text class="solar-cold-label" x="404" y="426" text-anchor="middle">${escape(block.cold_label)}</text><text class="solar-hot-label" x="445" y="92" text-anchor="middle">${escape(block.hot_label)}</text></svg>
    <figcaption>${escape(block.caption)}</figcaption></figure>`;
  throw new Error(`Unsupported article block ${block.type}`);
}

for (const route of routes) {
  const article = knowledge.findArticleById(route.entity_id);
  if (!article) throw new Error(`Unknown article route ${route.id}`);
  const local = article.localized(route.language);
  const ui = labels[route.language];
  const home = route.language === site.defaultLanguage ? "/" : `/${route.language}/`;
  const siblings = routes.filter(item => item.entity_id === article.id);
  const defaultRoute = siblings.find(item => item.language === article.language);
  if (!defaultRoute || siblings.length !== article.languages.length) throw new Error(`Incomplete article routes for ${article.id}`);
  const date = new Intl.DateTimeFormat(route.language, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(local.published_at));
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: local.title, description: local.meta_description,
    inLanguage: route.language, datePublished: local.published_at, dateModified: local.modified_at, mainEntityOfPage: route.canonical_url,
    author: { "@type": "Organization", name: local.author, url: site.canonicalOrigin },
    image: article.mediaIds.map(id => `${site.canonicalOrigin}/${knowledge.findMediaById(id).src}`) };
  const html = `<!doctype html>
<html lang="${route.language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(local.seo_title)} | Vital Vibe</title>
  <meta name="description" content="${escape(local.meta_description)}">
  <link rel="canonical" href="${escape(route.canonical_url)}">
  ${siblings.map(item => `<link rel="alternate" hreflang="${item.language}" href="${escape(item.canonical_url)}">`).join("\n  ")}
  <link rel="alternate" hreflang="x-default" href="${escape(defaultRoute.canonical_url)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escape(local.title)}">
  <meta property="og:description" content="${escape(local.meta_description)}">
  <meta property="og:url" content="${escape(route.canonical_url)}">
  <link rel="stylesheet" href="/article.css">
  ${local.body.some(section => section.blocks.some(block => block.type === "solar_collector_diagram")) ? '<script src="/solar-collector.js" defer></script>' : ''}
  <script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>
</head>
<body>
  <a class="skip-link" href="#main-content">${ui.skip}</a>
  <header class="site-header"><div class="header-inner"><a href="${home}" aria-label="Vital Vibe"><img src="/VVC_primary_logo.svg" alt="Vital Vibe Construcción" width="230" height="65"></a><div class="header-actions"><nav class="article-languages" aria-label="${ui.language}">${siblings.map(item => `<a href="${escape(item.path)}" lang="${item.language}" hreflang="${item.language}"${item.language === route.language ? ' aria-current="page"' : ""}>${item.language.toUpperCase()}</a>`).join("")}</nav><a href="${home}">${ui.home}</a></div></div></header>
  <main id="main-content"><article>
    <header class="article-header"><div class="article-label"><span>${escape(local.category)}</span></div><h1>${escape(local.title)}</h1><p class="introduction">${escape(local.summary)}</p><div class="article-meta"><span>${escape(local.author)}</span><span>${ui.published} <time datetime="${local.published_at}">${escape(date)}</time></span></div></header>
    <div class="reading-layout"><nav class="contents" aria-label="${ui.contents}"><details open><summary>${ui.contents}</summary><ol>${local.body.map((section, index) => `<li><a href="#section-${index + 1}"><span>${String(index + 1).padStart(2, "0")}</span>${escape(section.heading)}</a></li>`).join("")}</ol></details></nav>
    <div class="article-body">${local.body.map((section, index) => `<section id="section-${index + 1}" class="article-section"><h2><span class="section-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>${escape(section.heading)}</h2>${section.blocks.map(blockHtml).join("")}</section>`).join("\n")}
      <footer class="article-footer"><a href="${home}#contacto">${ui.contact}</a><a href="#main-content">${ui.top} ↑</a></footer>
    </div></div>
  </article></main>
  <script>if (window.matchMedia('(max-width: 760px)').matches) document.querySelector('.contents details').open = false;</script>
</body>
</html>
`;
  const destination = path.join(root, route.generated_html_path);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, html.replace(/[\t ]+$/gm, ""));
}

await copyFile(path.join(root, "tools/articles/article.css"), path.join(root, "site-next/article.css"));
await copyFile(path.join(root, "tools/articles/solar-collector.js"), path.join(root, "site-next/solar-collector.js"));
for (const redirect of contract.article_redirects ?? []) {
  const target = routes.find(route => route.path === redirect.to);
  if (!target || redirect.status !== 301 || !/^\/(?:[a-z0-9-]+\/)+$/.test(redirect.from) || contract.routes.some(route => route.path === redirect.from)) throw new Error("Invalid article redirect.");
  const destination = path.join(root, "site-next", redirect.from.slice(1), "index.html");
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0; url=${escape(target.path)}"><link rel="canonical" href="${escape(target.canonical_url)}"><meta name="description" content="El caso del traslado del lavabo se ha publicado en su nueva dirección."><title>Artículo trasladado</title></head><body><main><h1>Artículo trasladado</h1><a href="${escape(target.path)}">Leer el artículo</a></main></body></html>\n`);
}
console.log(`Built ${routes.length} published article language pages`);
