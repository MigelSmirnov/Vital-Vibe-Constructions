#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const outputDir = path.join(root, "site-next");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderServices(services) {
  return services
    .map(
      (service) => `
        <article class="service-card" id="${escapeHtml(service.slug)}">
          <h3>${escapeHtml(service.title)}</h3>
          <p>${escapeHtml(service.summary)}</p>
        </article>`,
    )
    .join("");
}

function renderPage({ site, services, planner }) {
  const organizationSchema = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.name,
      url: `${site.canonicalOrigin}/`,
      logo: `${site.canonicalOrigin}/VVC_primary_logo.svg`,
      areaServed: site.serviceArea,
      makesOffer: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.summary,
        },
      })),
    },
    null,
    2,
  );

  return `<!doctype html>
<html lang="${escapeHtml(site.defaultLanguage)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(site.title)}</title>
  <meta name="description" content="${escapeHtml(site.description)}">
  <link rel="canonical" href="${escapeHtml(site.canonicalOrigin)}/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(site.title)}">
  <meta property="og:description" content="${escapeHtml(site.description)}">
  <meta property="og:url" content="${escapeHtml(site.canonicalOrigin)}/">
  <meta property="og:image" content="${escapeHtml(site.canonicalOrigin + site.hero.image)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="./styles.css">
  <script type="application/ld+json">${organizationSchema}</script>
</head>
<body>
  <a class="skip-link" href="#main-content">Saltar al contenido</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="./" aria-label="${escapeHtml(site.name)}">
        <img src="../VVC_primary_logo.svg" alt="${escapeHtml(site.name)}" width="170" height="48">
      </a>
      <nav aria-label="Navegación principal">
        <a href="#servicios">Servicios</a>
        <a href="#planificador">Planificador</a>
        <a href="#contacto">Contacto</a>
      </nav>
    </div>
  </header>

  <main id="main-content">
    <section class="hero">
      <img class="hero-image" src="..${escapeHtml(site.hero.image)}" alt="${escapeHtml(site.hero.imageAlt)}" width="1600" height="1000">
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <p class="eyebrow">${escapeHtml(site.hero.eyebrow)}</p>
        <h1>${escapeHtml(site.hero.title)}</h1>
        <p class="hero-summary">${escapeHtml(site.hero.summary)}</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#contacto">Solicitar presupuesto</a>
          <a class="button button-secondary" href="${escapeHtml(planner.url)}" target="_blank" rel="noopener">
            ${escapeHtml(planner.label)} <span class="badge">${escapeHtml(planner.status)}</span>
          </a>
        </div>
      </div>
    </section>

    <section class="section" id="servicios">
      <div class="container">
        <p class="eyebrow">Servicios</p>
        <h2>Todo lo que tu reforma necesita</h2>
        <div class="service-grid">${renderServices(services)}</div>
      </div>
    </section>

    <section class="section planner" id="planificador">
      <div class="container planner-grid">
        <div>
          <p class="eyebrow">Herramienta en pruebas</p>
          <h2>${escapeHtml(planner.title)}</h2>
          <p>${escapeHtml(planner.summary)}</p>
        </div>
        <a class="button button-primary" href="${escapeHtml(planner.url)}" target="_blank" rel="noopener">
          ${escapeHtml(planner.label)} <span class="badge">${escapeHtml(planner.status)}</span>
        </a>
      </div>
    </section>

    <section class="section contact" id="contacto">
      <div class="container">
        <p class="eyebrow">Contacto</p>
        <h2>${escapeHtml(site.contact.heading)}</h2>
        <p>${escapeHtml(site.contact.summary)}</p>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container">© ${new Date().getUTCFullYear()} ${escapeHtml(site.name)}</div>
  </footer>
</body>
</html>`;
}

const styles = `:root {
  color-scheme: dark;
  --bg: #14171b;
  --surface: #1c2025;
  --text: #edebe6;
  --muted: #b8bec5;
  --accent: #e0a33b;
  --border: #30363d;
  font-family: Inter, system-ui, sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--bg); color: var(--text); line-height: 1.6; }
a { color: inherit; }
img { max-width: 100%; display: block; }
.container { width: min(1180px, calc(100% - 36px)); margin-inline: auto; }
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 16px; top: 16px; z-index: 1000; background: white; color: black; padding: 10px; }
.site-header { position: sticky; top: 0; z-index: 20; background: rgba(20, 23, 27, .92); border-bottom: 1px solid var(--border); backdrop-filter: blur(12px); }
.header-inner { min-height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.brand img { width: 170px; height: auto; }
nav { display: flex; gap: 24px; flex-wrap: wrap; }
nav a { text-decoration: none; color: var(--muted); }
nav a:hover, nav a:focus-visible { color: var(--text); }
.hero { min-height: 680px; position: relative; display: grid; align-items: center; overflow: hidden; }
.hero-image, .hero-overlay { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero-overlay { background: linear-gradient(180deg, rgba(20,23,27,.82), rgba(20,23,27,.58), rgba(20,23,27,.92)); }
.hero-content { position: relative; z-index: 1; text-align: center; max-width: 850px; padding-block: 100px; }
.eyebrow { text-transform: uppercase; letter-spacing: .12em; font-size: .78rem; color: var(--accent); font-weight: 700; }
h1, h2, h3 { line-height: 1.12; margin-top: 0; }
h1 { font-size: clamp(2.7rem, 7vw, 5.3rem); margin-bottom: 24px; }
h2 { font-size: clamp(2rem, 4vw, 3.3rem); margin-bottom: 24px; }
h3 { font-size: 1.3rem; }
.hero-summary { font-size: 1.15rem; color: var(--muted); max-width: 720px; margin: 0 auto 32px; }
.hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.button { display: inline-flex; align-items: center; gap: 8px; padding: 13px 19px; border-radius: 9px; text-decoration: none; font-weight: 750; border: 1px solid transparent; }
.button-primary { background: var(--accent); color: #211708; }
.button-secondary { border-color: rgba(255,255,255,.4); background: rgba(20,23,27,.5); }
.badge { font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; opacity: .78; }
.section { padding: 88px 0; }
.service-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.service-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 26px; }
.service-card p, .planner p, .contact p { color: var(--muted); }
.planner { background: #20252b; }
.planner-grid { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 36px; }
.contact { text-align: center; }
.site-footer { border-top: 1px solid var(--border); color: var(--muted); padding: 26px 0; }
@media (max-width: 760px) {
  .header-inner { align-items: flex-start; padding-block: 14px; flex-direction: column; }
  nav { gap: 16px; }
  .hero { min-height: 590px; }
  .service-grid { grid-template-columns: 1fr; }
  .planner-grid { grid-template-columns: 1fr; align-items: start; }
}`;

async function main() {
  const knowledge = createKnowledgeRepository(await loadContentTables({ root }));
  const site = knowledge.getSite();
  const services = knowledge.listServices().map((service) => service.toRecord());
  const planner = knowledge.findExternalAppById("electrical-planner");

  if (!site || !Array.isArray(services) || !planner) {
    throw new Error("Required content records are missing.");
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.html"), renderPage({ site, services, planner }), "utf8");
  await writeFile(path.join(outputDir, "styles.css"), styles, "utf8");
  console.log("Built site-next/index.html and site-next/styles.css");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
