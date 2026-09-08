#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const outputDir = path.join(root, "site-next");
const routeContractPath = path.join(root, "architecture/project-routes.yaml");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderServices(services, serviceRouteById) {
  return services.map((service, index) => {
    const route = serviceRouteById.get(service.id);
    return `<details class="service-row" id="${escapeHtml(service.slug)}">
      <summary><span class="service-number">${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(service.title)}</h3><span class="service-toggle" aria-hidden="true">+</span></summary>
      <div class="service-description"><p>${escapeHtml(service.summary)}</p>${route ? `<a class="text-link" href="${escapeHtml(route.path)}">${escapeHtml(service.title)} <span aria-hidden="true">→</span></a>` : ""}</div>
    </details>`;
  }).join("");
}

function renderProjects(projects, mediaById, serviceById) {
  return projects
    .map((project) => {
      const image = mediaById.get(project.image_ids[0]);
      const services = project.service_ids
        ? project.service_ids.map((serviceId) => serviceById.get(serviceId)).filter(Boolean)
        : [];

      if (!image) {
        throw new Error(`Project "${project.id}" does not have a resolvable lead image.`);
      }

      return `
        <article class="project-card" id="${escapeHtml(project.slug)}">
          <a class="project-card-media" href="./projects/${escapeHtml(project.slug)}/">
            <img src="../${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${escapeHtml(image.width)}" height="${escapeHtml(image.height)}" loading="lazy">
          </a>
          <div class="project-card-body">
            <p class="project-meta">${escapeHtml([project.location, project.budget_range].filter(Boolean).join(" · "))}</p>
            <h3><a href="./projects/${escapeHtml(project.slug)}/">${escapeHtml(project.title)}</a></h3>
            <p>${escapeHtml(project.summary)}</p>
            <div class="project-tags">${services.map((service) => `<span>${escapeHtml(service.title)}</span>`).join("")}</div>
          </div>
        </article>`;
    })
    .join("");
}

function renderCapabilitySections(capabilitySections, mediaById, serviceById, externalAppById) {
  return capabilitySections
    .map((section) => {
      const media = section.media_ids.map((mediaId) => mediaById.get(mediaId)).filter(Boolean);
      const services = section.service_ids.map((serviceId) => serviceById.get(serviceId)).filter(Boolean);
      const relatedApp = externalAppById.get(section.related_external_app_id);
      const [leadImage, ...galleryImages] = media;

      if (!leadImage || media.length !== section.media_ids.length) {
        throw new Error(`Capability section "${section.id}" does not have all configured media records.`);
      }

      if (services.length !== section.service_ids.length) {
        throw new Error(`Capability section "${section.id}" does not have all configured service records.`);
      }

      if (!relatedApp) {
        throw new Error(`Capability section "${section.id}" does not have its related external application.`);
      }

      return `
    <section class="section capabilities" id="${escapeHtml(section.slug)}">
      <div class="container">
        <div class="capability-header">
          <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.summary)}</p>
        </div>
        <div class="capability-layout">
          <div>
            <h3>${escapeHtml(section.capability_title)}</h3>
            <ol class="capability-list">
              ${section.capabilities
                .map(
                  (capability, index) =>
                    `<li><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(capability)}</li>`,
                )
                .join("")}
            </ol>
            <p class="capability-note">${escapeHtml(section.note)}</p>
            <div class="capability-actions">
              <div class="capability-services">${services
                .map((service) => `<span>${escapeHtml(service.title)}</span>`)
                .join("")}</div>
              <a class="button button-secondary" href="${escapeHtml(relatedApp.url)}" target="_blank" rel="noopener">
                ${escapeHtml(relatedApp.label)} <span class="badge">${escapeHtml(relatedApp.status)}</span>
              </a>
            </div>
          </div>
          <figure class="capability-lead">
            <img src="../${escapeHtml(leadImage.src)}" alt="${escapeHtml(leadImage.alt)}" width="${escapeHtml(leadImage.width)}" height="${escapeHtml(leadImage.height)}" loading="lazy">
          </figure>
        </div>
        <div class="capability-gallery-block">
          <p>${escapeHtml(section.partners_summary)}</p>
          <div class="capability-gallery">
            ${galleryImages
              .map(
                (image) => `<figure>
                  <img src="../${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${escapeHtml(image.width)}" height="${escapeHtml(image.height)}" loading="lazy">
                  <figcaption>${escapeHtml(image.caption ?? image.alt)}</figcaption>
                </figure>`,
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>`;
    })
    .join("");
}

function renderRenovationTiers(renovationTiers) {
  return renovationTiers
    .map((tier) => {
      const badge = tier.badge ? `\n          <span class="tier-badge">${escapeHtml(tier.badge)}</span>` : "";

      return `
        <article class="tier-card${tier.is_featured ? " tier-card-featured" : ""}" id="${escapeHtml(tier.slug)}">${badge}
          <p class="tier-label">${escapeHtml(tier.title)}</p>
          <p class="tier-price"><span>${escapeHtml(tier.price_per_m2)}</span> ${escapeHtml(tier.currency)}/m²</p>
          <p>${escapeHtml(tier.summary)}</p>
        </article>`;
    })
    .join("");
}

function renderPage({
  site,
  contactDetails,
  services,
  renovationTiers,
  projects,
  capabilitySections,
  externalApps,
  media,
  planner,
  serviceRoutes,
}) {
  const serviceById = new Map(services.map((service) => [service.id, service]));
  const mediaById = new Map(media.map((item) => [item.id, item]));
  const featuredMedia = mediaById.get(site.featuredMediaId);
  const externalAppById = new Map(externalApps.map((app) => [app.id, app]));
  const serviceRouteById = new Map(serviceRoutes.map((route) => [route.entity_id, route]));
  const renovationTierDisclaimer = renovationTiers.find((tier) => tier.disclaimer)?.disclaimer ?? null;
  const organizationSchema = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.name,
      url: `${site.canonicalOrigin}/`,
      logo: `${site.canonicalOrigin}/VVC_primary_logo.svg`,
      areaServed: site.serviceArea,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: contactDetails.phone_display,
        email: contactDetails.email,
        contactType: "customer service",
        areaServed: site.serviceArea,
      },
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
  <link rel="stylesheet" href="/home.css">
  <script src="/home.js" defer></script>
  <script type="application/ld+json">${organizationSchema}</script>
</head>
<body class="home">
  <a class="skip-link" href="#main-content">Saltar al contenido</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="./" aria-label="${escapeHtml(site.name)}">
        <img src="../VVC_primary_logo.svg" alt="${escapeHtml(site.name)}" width="170" height="48">
      </a>
      <div class="header-tools">
        <!-- home-language-switcher -->
        <a class="header-contact" href="#contacto">Contacto</a>
        <details class="menu">
          <summary aria-label="Menú"><span class="menu-lines" aria-hidden="true"></span><span class="sr-only">Menú</span></summary>
          <nav aria-label="Navegación principal">
            <a href="#servicios">Servicios</a>
            <a href="#proyectos">Proyectos</a>
            <a href="#hogar-inteligente">Domótica</a>
            <a href="#precios">Precios</a>
            <a href="#planificador">Planificador</a>
            <a href="#contacto">Contacto</a>
          </nav>
        </details>
      </div>
    </div>
  </header>

  <main id="main-content">
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">${escapeHtml(site.hero.eyebrow)}</p>
        <h1>${escapeHtml(site.hero.title)}${site.hero.titleAccent ? ` <span>${escapeHtml(site.hero.titleAccent)}</span>` : ""}</h1>
        <p class="hero-summary">${escapeHtml(site.hero.summary)}</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#contacto">Solicitar presupuesto <span aria-hidden="true">→</span></a>
          <a class="button button-secondary" href="#proyectos">Ver proyectos <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <figure class="hero-visual">
        <img class="hero-image" src="${escapeHtml(site.hero.image)}" alt="${escapeHtml(site.hero.imageAlt)}" width="${site.hero.imageWidth}" height="${site.hero.imageHeight}" fetchpriority="high">
        ${site.hero.caption ? `<figcaption>${escapeHtml(site.hero.caption)}</figcaption>` : ""}
      </figure>
    </section>

    <section class="section" id="servicios">
      <div class="container">
        <div class="section-heading"><h2>Nuestros servicios</h2><p>Todo lo que tu reforma necesita</p></div>
        <div class="service-grid">${renderServices(services, serviceRouteById)}</div>
      </div>
    </section>

    <section class="section projects" id="proyectos">
      <div class="container">
        <div class="section-heading"><h2>Trabajos realizados</h2><a class="text-link" href="/projects/">Ver proyectos <span aria-hidden="true">→</span></a></div>
        <div class="portfolio-layout">
          ${featuredMedia ? `<figure class="featured-bathroom"><img src="/${escapeHtml(featuredMedia.src)}" alt="${escapeHtml(featuredMedia.alt)}" width="${featuredMedia.width}" height="${featuredMedia.height}" loading="lazy"><figcaption><span>Baños</span><h3>${escapeHtml(featuredMedia.caption)}</h3></figcaption></figure>` : ""}
          <div class="project-grid">${renderProjects(projects, mediaById, serviceById)}</div>
        </div>
      </div>
    </section>

${renderCapabilitySections(capabilitySections, mediaById, serviceById, externalAppById)}

    <section class="section tiers" id="precios">
      <div class="container">
        <p class="eyebrow">Tipos de reforma</p>
        <h2>Elige el nivel que encaja con tu proyecto</h2>
        <div class="tier-grid">${renderRenovationTiers(renovationTiers)}</div>
        ${renovationTierDisclaimer ? `<p class="tier-disclaimer">${escapeHtml(renovationTierDisclaimer)}</p>` : ""}
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
        <div class="contact-actions">
          <a class="button button-primary" href="${escapeHtml(contactDetails.whatsapp_url)}" target="_blank" rel="noopener">WhatsApp</a>
          <a class="button button-secondary" href="${escapeHtml(contactDetails.phone_href)}">${escapeHtml(contactDetails.phone_display)}</a>
          <a class="button button-secondary" href="mailto:${escapeHtml(contactDetails.email)}">${escapeHtml(contactDetails.email)}</a>
          <a class="button button-secondary" href="${escapeHtml(contactDetails.map_url)}" target="_blank" rel="noopener">${escapeHtml(contactDetails.map_label)}</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-main">
      <a class="brand" href="/" aria-label="${escapeHtml(site.name)}"><img src="/VVC_primary_logo.svg" alt="${escapeHtml(site.name)}" width="240" height="83" loading="lazy"></a>
      <p>${escapeHtml(site.serviceArea)}</p>
      <div><a href="mailto:${escapeHtml(contactDetails.email)}">${escapeHtml(contactDetails.email)}</a><a href="${escapeHtml(contactDetails.phone_href)}">${escapeHtml(contactDetails.phone_display)}</a></div>
    </div>
    <div class="container footer-bottom"><span>© ${new Date().getUTCFullYear()} ${escapeHtml(site.name)}</span><a href="/aviso-legal.dc.html">Aviso legal</a></div>
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
.language-switcher { display: flex; gap: 4px; margin-left: 4px; }
.language-switcher a { min-width: 32px; padding: 5px 7px; border: 1px solid var(--border); border-radius: 6px; text-align: center; font-size: .75rem; font-weight: 800; }
.language-switcher a[aria-current="page"] { border-color: var(--accent); color: var(--accent); }
.hero { min-height: 680px; position: relative; display: grid; align-items: center; overflow: hidden; }
.hero-image, .hero-overlay { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero-overlay { background: linear-gradient(180deg, rgba(20,23,27,.82), rgba(20,23,27,.58), rgba(20,23,27,.92)); }
.hero-content { position: relative; z-index: 1; text-align: center; max-width: 850px; padding-block: 100px; }
.eyebrow { text-transform: uppercase; letter-spacing: .12em; font-size: .78rem; color: var(--accent); font-weight: 700; }
h1, h2, h3 { line-height: 1.12; margin-top: 0; }
h1 { font-size: clamp(2.7rem, 7vw, 5.3rem); margin-bottom: 24px; }
h2 { font-size: clamp(2rem, 4vw, 3.3rem); margin-bottom: 24px; }
h3 { font-size: 1.3rem; }
.section-summary { color: var(--muted); max-width: 680px; margin: -10px 0 32px; }
.hero-summary { font-size: 1.15rem; color: var(--muted); max-width: 720px; margin: 0 auto 32px; }
.hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.button { display: inline-flex; align-items: center; gap: 8px; padding: 13px 19px; border-radius: 9px; text-decoration: none; font-weight: 750; border: 1px solid transparent; }
.button-primary { background: var(--accent); color: #211708; }
.button-secondary { border-color: rgba(255,255,255,.4); background: rgba(20,23,27,.5); }
.badge { font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; opacity: .78; }
.section { padding: 88px 0; }
.service-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.service-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 26px; }
.service-card h3 a { text-decoration: none; }
.service-card h3 a:hover, .service-card h3 a:focus-visible { color: var(--accent); }
.service-card p, .project-card p, .planner p, .contact p { color: var(--muted); }
.projects { background: #181c20; }
.project-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: start; gap: 18px; }
.project-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
.project-card-media { display: block; }
.project-card img { width: 100%; height: 260px; object-fit: cover; }
.project-card-body { padding: 22px; display: flex; flex: 1; flex-direction: column; }
.project-card h3 a { text-decoration: none; }
.project-card h3 a:hover, .project-card h3 a:focus-visible { color: var(--accent); }
.project-card .project-meta { margin: 0 0 10px; font-size: .82rem; color: var(--accent); font-weight: 700; }
.project-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 18px; }
.project-tags span { border: 1px solid var(--border); border-radius: 999px; padding: 4px 9px; color: var(--muted); font-size: .78rem; }
.capabilities { background: #20252b; }
.capability-header { max-width: 820px; margin-bottom: 42px; }
.capability-header > p:last-child { color: var(--muted); font-size: 1.05rem; }
.capability-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 420px); align-items: center; gap: 52px; }
.capability-list { list-style: none; margin: 24px 0; padding: 0; border-top: 1px solid var(--border); }
.capability-list li { display: flex; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--border); }
.capability-list span { color: var(--accent); font-size: .8rem; font-weight: 800; }
.capability-note { margin: 24px 0; padding-left: 18px; border-left: 3px solid var(--accent); color: var(--muted); }
.capability-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 18px; }
.capability-services { display: flex; flex-wrap: wrap; gap: 8px; }
.capability-services span { border: 1px solid var(--border); border-radius: 999px; padding: 5px 10px; color: var(--muted); font-size: .78rem; }
.capability-lead { margin: 0; overflow: hidden; border: 1px solid var(--border); border-radius: 8px; }
.capability-lead img { width: 100%; height: 520px; object-fit: cover; }
.capability-gallery-block { margin-top: 52px; padding-top: 36px; border-top: 1px solid var(--border); }
.capability-gallery-block > p { color: var(--muted); font-size: 1.05rem; }
.capability-gallery { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.capability-gallery figure { margin: 0; }
.capability-gallery img { width: 100%; height: 300px; object-fit: cover; border-radius: 8px; }
.capability-gallery figcaption { padding-top: 9px; color: var(--muted); font-size: .82rem; }
.page-intro, .project-detail-intro { padding: 72px 0 54px; background: #181c20; }
.page-intro h1, .project-detail-intro h1 { max-width: 900px; margin-bottom: 22px; font-size: 3.4rem; }
.page-intro .container > p:last-child, .project-detail-summary { max-width: 780px; color: var(--muted); font-size: 1.08rem; }
.project-index-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: start; gap: 18px; }
.project-index-card { overflow: hidden; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; }
.project-index-media { display: block; }
.project-index-media img { width: 100%; height: 260px; object-fit: cover; }
.project-index-body { padding: 22px; }
.project-index-body h2, .project-index-body h3 { font-size: 1.45rem; }
.project-index-body h2 a, .project-index-body h3 a, .text-link, .back-link { text-decoration: none; }
.project-index-body > p { color: var(--muted); }
.text-link, .back-link { color: var(--accent); font-weight: 750; }
.project-detail-intro .back-link { display: inline-block; margin-bottom: 30px; }
.project-facts { display: flex; flex-wrap: wrap; gap: 12px 36px; margin: 32px 0 0; }
.project-facts div { min-width: 130px; }
.project-facts dt { color: var(--muted); font-size: .78rem; text-transform: uppercase; }
.project-facts dd { margin: 3px 0 0; font-weight: 750; }
.project-detail-lead { padding: 34px 0 0; background: #181c20; }
.project-detail-lead img { width: 100%; height: 560px; object-fit: cover; border-radius: 8px; }
.project-detail-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 440px); gap: 56px; }
.project-detail-grid p, .project-service-list span { color: var(--muted); }
.project-service-list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--border); }
.project-service-list li { display: grid; gap: 4px; padding: 16px 0; border-bottom: 1px solid var(--border); }
.project-media-section { background: #20252b; }
.project-media-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.project-media-grid figure { margin: 0; }
.project-media-grid img { width: 100%; height: 420px; object-fit: cover; border-radius: 8px; }
.project-media-grid figcaption { padding-top: 9px; color: var(--muted); font-size: .85rem; }
.project-navigation .container { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 14px; }
.service-hero { padding: 34px 0 76px; background: #181c20; }
.breadcrumb { margin-bottom: 42px; }
.breadcrumb ol { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; color: var(--muted); font-size: .88rem; }
.breadcrumb li:not(:last-child)::after { margin-left: 8px; content: "/"; color: #727982; }
.breadcrumb a { text-decoration: none; }
.breadcrumb a:hover, .breadcrumb a:focus-visible { color: var(--text); }
.service-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 480px); align-items: center; gap: 58px; }
.service-hero h1 { max-width: 760px; font-size: clamp(2.7rem, 6vw, 4.8rem); }
.service-introduction { max-width: 720px; margin: 0 0 30px; color: var(--muted); font-size: 1.12rem; }
.service-hero-media { margin: 0; overflow: hidden; border: 1px solid var(--border); border-radius: 8px; }
.service-hero-media img { width: 100%; height: 540px; object-fit: cover; }
.service-section-heading { max-width: 820px; margin-bottom: 38px; }
.service-section-heading > p:last-child { color: var(--muted); font-size: 1.05rem; }
.service-scope-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.service-scope-card { padding: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; }
.service-scope-card p { margin-bottom: 0; color: var(--muted); }
.service-process { background: #20252b; }
.service-process-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 36px; margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--border); }
.service-process-list li { display: grid; grid-template-columns: 42px 1fr; gap: 14px; padding: 24px 0; border-bottom: 1px solid var(--border); }
.service-process-list h3 { margin-bottom: 8px; }
.service-process-list p { margin: 0; color: var(--muted); }
.service-process-number { color: var(--accent); font-size: .8rem; font-weight: 800; }
.service-projects { background: #181c20; }
.service-faq-layout { display: grid; grid-template-columns: minmax(260px, 380px) minmax(0, 1fr); gap: 64px; align-items: start; }
.service-faq-list { border-top: 1px solid var(--border); }
.service-faq-list details { border-bottom: 1px solid var(--border); }
.service-faq-list summary { padding: 20px 34px 20px 0; cursor: pointer; font-weight: 750; }
.service-faq-list p { margin: 0; padding: 0 0 22px; color: var(--muted); }
.service-contact { text-align: center; background: #20252b; }
.service-contact > .container > p:not(.eyebrow) { max-width: 680px; margin-inline: auto; color: var(--muted); }
.service-contact .button { overflow-wrap: anywhere; }
.tiers { background: #f3f0e8; color: #171a1f; }
.tiers .eyebrow { color: #9a6819; }
.tier-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.tier-card { position: relative; background: #fff; border: 1px solid #ddd6c8; border-radius: 8px; padding: 28px; }
.tier-card-featured { background: #171a1f; color: #fff; border-color: #171a1f; }
.tier-badge { position: absolute; top: -11px; left: 22px; background: var(--accent); color: #211708; border-radius: 5px; padding: 5px 10px; font-size: .68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.tier-label { margin: 0; color: #666d75; font-size: .82rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.tier-card-featured .tier-label { color: var(--accent); }
.tier-price { margin: 14px 0 12px; color: inherit; font-weight: 800; }
.tier-price span { font-size: 2.8rem; line-height: 1; }
.tier-disclaimer { max-width: 760px; margin: 24px auto 0; color: #666d75; text-align: center; font-size: .92rem; }
.planner { background: #20252b; }
.planner-grid { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 36px; }
.contact { text-align: center; }
.contact-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 28px; }
.site-footer { border-top: 1px solid var(--border); color: var(--muted); padding: 26px 0; }
@media (max-width: 760px) {
  .header-inner { align-items: flex-start; padding-block: 14px; flex-direction: column; }
  nav { gap: 16px; }
  .hero { min-height: 590px; }
  .service-grid { grid-template-columns: 1fr; }
  .project-grid { grid-template-columns: 1fr; }
  .project-card img { height: 240px; }
  .capability-layout { grid-template-columns: 1fr; gap: 32px; }
  .capability-lead img { height: 380px; }
  .capability-gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .capability-gallery img { height: 230px; }
  .page-intro h1, .project-detail-intro h1 { font-size: 2.3rem; }
  .project-index-grid { grid-template-columns: 1fr; }
  .project-index-media img { height: 240px; }
  .project-detail-lead img { height: 360px; }
  .project-detail-grid { grid-template-columns: 1fr; gap: 32px; }
  .project-media-grid { grid-template-columns: 1fr; }
  .project-media-grid img { height: 360px; }
  .service-hero { padding-top: 24px; }
  .breadcrumb { margin-bottom: 30px; }
  .service-hero-grid { grid-template-columns: 1fr; gap: 34px; }
  .service-hero-media img { height: 380px; }
  .service-scope-grid { grid-template-columns: 1fr; }
  .service-process-list { grid-template-columns: 1fr; }
  .service-faq-layout { grid-template-columns: 1fr; gap: 24px; }
  .tier-grid { grid-template-columns: 1fr; }
  .planner-grid { grid-template-columns: 1fr; align-items: start; }
}`;

async function main() {
  const [knowledge, routeContract] = await Promise.all([
    loadContentTables({ root }).then((tables) => createKnowledgeRepository(tables)),
    readFile(routeContractPath, "utf8").then(JSON.parse),
  ]);
  const site = knowledge.getSite().toRecord();
  const contactDetails = knowledge.getContactDetails().toRecord();
  const services = knowledge.listServices().map((service) => service.toRecord());
  const renovationTiers = knowledge.listRenovationTiers().map((tier) => tier.toRecord());
  const projects = knowledge.listProjects().map((project) => project.toRecord());
  const capabilitySections = knowledge.listCapabilitySections().map((section) => section.toRecord());
  const externalApps = knowledge.listExternalApps().map((app) => app.toRecord());
  const media = knowledge.listMedia().map((item) => item.toRecord());
  const planner = knowledge.findExternalAppById("electrical-planner");
  const serviceRoutes = routeContract.routes.filter(
    (route) => route.family_id === "service-detail" && route.status === "generated",
  );

  if (
    !site ||
    !contactDetails ||
    !Array.isArray(services) ||
    !Array.isArray(renovationTiers) ||
    !Array.isArray(projects) ||
    !Array.isArray(capabilitySections) ||
    !Array.isArray(externalApps) ||
    !Array.isArray(media) ||
    !planner
  ) {
    throw new Error("Required content records are missing.");
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(
    path.join(outputDir, "index.html"),
    renderPage({
      site,
      contactDetails,
      services,
      renovationTiers,
      projects,
      capabilitySections,
      externalApps,
      media,
      planner,
      serviceRoutes,
    }),
    "utf8",
  );
  await writeFile(path.join(outputDir, "styles.css"), styles, "utf8");
  await writeFile(path.join(outputDir, "home.css"), await readFile(path.join(root, "tools/site-next/home.css"), "utf8"), "utf8");
  await writeFile(path.join(outputDir, "home.js"), await readFile(path.join(root, "tools/site-next/home.js"), "utf8"), "utf8");
  console.log("Built site-next homepage and styles/scripts");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
