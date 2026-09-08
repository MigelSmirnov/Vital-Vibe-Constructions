#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const outputRoot = path.join(root, "site-next/projects");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderHeader({ site, homeHref, assetPrefix }) {
  return `<header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="${homeHref}" aria-label="${escapeHtml(site.name)}">
        <img src="${assetPrefix}VVC_primary_logo.svg" alt="${escapeHtml(site.name)}" width="170" height="48">
      </a>
      <nav aria-label="Navegación principal">
        <a href="${homeHref}#servicios">Servicios</a>
        <a href="${homeHref}#proyectos">Proyectos</a>
        <a href="${homeHref}#hogar-inteligente">Domótica</a>
        <a href="${homeHref}#precios">Precios</a>
        <a href="${homeHref}#contacto">Contacto</a>
      </nav>
    </div>
  </header>`;
}

function renderFooter(site) {
  return `<footer class="site-footer">
    <div class="container">© ${new Date().getUTCFullYear()} ${escapeHtml(site.name)}</div>
  </footer>`;
}

function renderDocument({ language, title, description, canonicalUrl, stylesheetHref, structuredData, body }) {
  return `<!doctype html>
<html lang="${escapeHtml(language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <link rel="stylesheet" href="${stylesheetHref}">
  <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>
</head>
<body>
${body}
</body>
</html>`;
}

function renderProjectIndex({ site, projects, mediaById }) {
  const title = `Proyectos de reforma en Barcelona | ${site.name}`;
  const description = `Proyectos de reforma realizados por ${site.name} en ${site.serviceArea}, con trabajos, acabados e imágenes de cada proyecto.`;
  const canonicalUrl = `${site.canonicalOrigin}/projects/`;
  const cards = projects
    .map((project) => {
      const image = mediaById.get(project.image_ids[0]);

      if (!image) throw new Error(`Project "${project.id}" does not have a lead image.`);

      return `<article class="project-index-card">
          <a class="project-index-media" href="./${escapeHtml(project.slug)}/">
            <img src="../../${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${escapeHtml(image.width)}" height="${escapeHtml(image.height)}" loading="lazy">
          </a>
          <div class="project-index-body">
            <p class="project-meta">${escapeHtml([project.location, project.budget_range].filter(Boolean).join(" · "))}</p>
            <h2><a href="./${escapeHtml(project.slug)}/">${escapeHtml(project.title)}</a></h2>
            <p>${escapeHtml(project.summary)}</p>
            <a class="text-link" href="./${escapeHtml(project.slug)}/">Ver proyecto</a>
          </div>
        </article>`;
    })
    .join("");

  return renderDocument({
    language: site.defaultLanguage,
    title,
    description,
    canonicalUrl,
    stylesheetHref: "../styles.css",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: canonicalUrl,
    },
    body: `${renderHeader({ site, homeHref: "../", assetPrefix: "../../" })}
  <main id="main-content">
    <section class="page-intro">
      <div class="container">
        <p class="eyebrow">Proyectos</p>
        <h1>Reformas y trabajos realizados en Barcelona</h1>
        <p>Consulta proyectos reales documentados con información e imágenes verificadas en nuestro repositorio de contenidos.</p>
      </div>
    </section>
    <section class="section">
      <div class="container project-index-grid">${cards}</div>
    </section>
  </main>
  ${renderFooter(site)}`,
  });
}

function renderProjectDetail({ site, project, mediaById, serviceById }) {
  const media = project.image_ids.map((mediaId) => mediaById.get(mediaId)).filter(Boolean);
  const services = project.service_ids.map((serviceId) => serviceById.get(serviceId)).filter(Boolean);

  if (media.length !== project.image_ids.length) {
    throw new Error(`Project "${project.id}" does not have all configured media records.`);
  }

  if (services.length !== project.service_ids.length) {
    throw new Error(`Project "${project.id}" does not have all configured service records.`);
  }

  const canonicalUrl = `${site.canonicalOrigin}/projects/${project.slug}/`;
  const title = `${project.title} | ${site.name}`;
  const description = project.summary;
  const [leadImage, ...galleryImages] = media;
  const duration = project.duration ?? renderExecutionDuration(project.execution);
  const facts = [
    project.location ? ["Ubicación", project.location] : null,
    project.project_type ? ["Tipo de proyecto", project.project_type] : null,
    project.area_m2 ? ["Superficie", `${project.area_m2} m²`] : null,
    duration ? ["Duración", duration] : null,
    project.estimated_total_cost_eur
      ? ["Coste aproximado", formatCurrency(project.estimated_total_cost_eur, site.currency ?? "EUR")]
      : null,
  ].filter(Boolean);

  const evidenceSections = renderEvidenceSections(project);

  return renderDocument({
    language: site.defaultLanguage,
    title,
    description,
    canonicalUrl,
    stylesheetHref: "../../styles.css",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: project.title,
      description,
      url: canonicalUrl,
      about: {
        "@type": "CreativeWork",
        name: project.title,
        description: project.transformation_summary ?? project.summary,
        locationCreated: project.location ?? undefined,
      },
      isPartOf: {
        "@type": "WebSite",
        name: site.name,
        url: `${site.canonicalOrigin}/`,
      },
    },
    body: `${renderHeader({ site, homeHref: "../../", assetPrefix: "../../../" })}
  <main id="main-content">
    <section class="project-detail-intro">
      <div class="container">
        <a class="back-link" href="../">Todos los proyectos</a>
        <p class="eyebrow">Proyecto · ${escapeHtml(project.budget_range ?? project.location ?? site.serviceArea)}</p>
        <h1>${escapeHtml(project.title)}</h1>
        <p class="project-detail-summary">${escapeHtml(project.summary)}</p>
        <dl class="project-facts">${facts
          .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
          .join("")}</dl>
      </div>
    </section>
    <section class="project-detail-lead">
      <div class="container">
        <img src="../../../${escapeHtml(leadImage.src)}" alt="${escapeHtml(leadImage.alt)}" width="${escapeHtml(leadImage.width)}" height="${escapeHtml(leadImage.height)}">
      </div>
    </section>
    ${evidenceSections}
    <section class="section project-detail-content">
      <div class="container project-detail-grid">
        <div>
          <p class="eyebrow">Servicios relacionados</p>
          <h2>Trabajos vinculados al proyecto</h2>
          <p>${escapeHtml(project.transformation_summary ?? project.summary)}</p>
        </div>
        <ul class="project-service-list">${services
          .map((service) => `<li><strong>${escapeHtml(service.title)}</strong><span>${escapeHtml(service.summary)}</span></li>`)
          .join("")}</ul>
      </div>
    </section>
    ${
      galleryImages.length
        ? `<section class="section project-media-section" id="project-media">
      <div class="container">
        <p class="eyebrow">Imágenes del proyecto</p>
        <h2>Proceso y resultado</h2>
        <div class="project-media-grid">${galleryImages
          .map(
            (image) => `<figure>
              <img src="../../../${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${escapeHtml(image.width)}" height="${escapeHtml(image.height)}" loading="lazy">
              <figcaption>${escapeHtml(image.caption ?? image.alt)}</figcaption>
            </figure>`,
          )
          .join("")}</div>
      </div>
    </section>`
        : ""
    }
    ${renderPendingTechnicalMedia(project.pending_technical_media)}
    <section class="section project-navigation">
      <div class="container">
        <a class="button button-secondary" href="../">Volver a todos los proyectos</a>
        <a class="button button-primary" href="../../#contacto">Consultar un proyecto</a>
      </div>
    </section>
  </main>
  ${renderFooter(site)}`,
  });
}

function renderEvidenceSections(project) {
  const sections = [];

  if (project.initial_condition) {
    const facts = project.initial_condition.verified_facts ?? [];
    sections.push(renderTextAndListSection({
      eyebrow: "Punto de partida",
      title: "Estado inicial",
      text: project.initial_condition.summary,
      items: facts,
      quote: project.initial_condition.project_lead_note,
    }));
  }

  if (project.project_objective) {
    sections.push(renderTextAndListSection({
      eyebrow: "Objetivo",
      title: "Dos estudios independientes con un presupuesto controlado",
      text: project.project_objective,
    }));
  }

  if (project.engineering_challenges?.length) {
    sections.push(renderTextAndListSection({
      eyebrow: "Diagnóstico",
      title: "Principales desafíos de la obra",
      items: project.engineering_challenges,
    }));
  }

  if (project.engineering_decisions) {
    const groups = [
      ["Instalación eléctrica", project.engineering_decisions.electrical],
      ["Fontanería, saneamiento y ventilación", project.engineering_decisions.water_and_drainage],
      ["Nivelación y formación de los suelos", project.engineering_decisions.floor_system],
      ["Divisiones y acabados", project.engineering_decisions.partition_and_finish],
    ].filter(([, items]) => Array.isArray(items) && items.length);

    sections.push(`<section class="section project-detail-content">
      <div class="container">
        <p class="eyebrow">Decisiones de ingeniería</p>
        <h2>Soluciones adoptadas y motivo de cada prioridad</h2>
        <div class="project-detail-grid">${groups
          .map(([heading, items]) => `<div><h3>${escapeHtml(heading)}</h3>${renderList(items)}</div>`)
          .join("")}</div>
      </div>
    </section>`);
  }

  if (project.budget_strategy) {
    sections.push(`<section class="section project-detail-content">
      <div class="container">
        <p class="eyebrow">Criterio de presupuesto</p>
        <h2>${escapeHtml(project.budget_strategy.principle)}</h2>
        <div class="project-detail-grid">
          <div>
            <h3>Dónde se redujo el presupuesto</h3>
            ${renderList(project.budget_strategy.where_savings_were_made ?? [])}
          </div>
          <div>
            <h3>Dónde no se aceptó ningún compromiso</h3>
            ${renderList(project.budget_strategy.where_no_compromise_was_accepted ?? [])}
          </div>
        </div>
      </div>
    </section>`);
  }

  if (project.estimated_total_cost_eur || project.cost_note) {
    sections.push(renderTextAndListSection({
      eyebrow: "Coste del caso",
      title: project.estimated_total_cost_eur
        ? `Orden de magnitud: ${formatCurrency(project.estimated_total_cost_eur, "EUR")}`
        : "Coste aproximado",
      text: project.cost_note,
    }));
  }

  if (project.transformation_summary) {
    sections.push(renderTextAndListSection({
      eyebrow: "Resultado",
      title: "Transformación conseguida",
      text: project.transformation_summary,
    }));
  }

  return sections.join("");
}

function renderTextAndListSection({ eyebrow, title, text = null, items = [], quote = null }) {
  return `<section class="section project-detail-content">
      <div class="container">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h2>${escapeHtml(title)}</h2>
        ${text ? `<p>${escapeHtml(text)}</p>` : ""}
        ${items.length ? renderList(items) : ""}
        ${quote ? `<blockquote><p>${escapeHtml(quote)}</p></blockquote>` : ""}
      </div>
    </section>`;
}

function renderList(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderPendingTechnicalMedia(items = []) {
  if (!items.length) return "";

  return `<section class="section project-detail-content" id="technical-media-pending">
      <div class="container">
        <p class="eyebrow">Documentación técnica</p>
        <h2>Fotografías pendientes de incorporar</h2>
        <p>Esta lista reserva el lugar para imágenes que documentarán soluciones concretas del proyecto.</p>
        <ul>${items
          .map((item) => `<li><a href="#technical-media-pending">${escapeHtml(item.subject)}</a></li>`)
          .join("")}</ul>
      </div>
    </section>`;
}

function renderExecutionDuration(execution) {
  if (!execution?.phase_count || !execution?.duration_per_phase_months) return null;

  return `${execution.phase_count} fases de ${execution.duration_per_phase_months} meses`;
}

function formatCurrency(value, currency) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

async function main() {
  const knowledge = createKnowledgeRepository(await loadContentTables({ root }));
  const site = knowledge.getSite().toRecord();
  const projects = knowledge.listProjects().map((project) => project.toRecord());
  const mediaById = new Map(knowledge.listMedia().map((item) => [item.id, item.toRecord()]));
  const serviceById = new Map(knowledge.listServices().map((service) => [service.id, service.toRecord()]));

  await mkdir(outputRoot, { recursive: true });
  await writeFile(path.join(outputRoot, "index.html"), renderProjectIndex({ site, projects, mediaById }), "utf8");

  for (const project of projects) {
    const projectOutputDir = path.join(outputRoot, project.slug);
    await mkdir(projectOutputDir, { recursive: true });
    await writeFile(
      path.join(projectOutputDir, "index.html"),
      renderProjectDetail({ site, project, mediaById, serviceById }),
      "utf8",
    );
  }

  const contract = JSON.parse(await readFile(path.join(root, "architecture/project-routes.yaml"), "utf8"));
  for (const redirect of contract.redirects ?? []) {
    const target = contract.routes.find((route) => route.path === redirect.to && route.family_id === "project-detail");
    if (!/^\/projects\/[a-z0-9-]+\/$/.test(redirect.from) || !target || contract.routes.some((route) => route.path === redirect.from)) {
      throw new Error(`Invalid project redirect: ${redirect.from}`);
    }
    const project = projects.find((item) => item.id === target.entity_id);
    const directory = path.join(root, "site-next", redirect.from.slice(1));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), `<!doctype html>
<html lang="${escapeHtml(site.defaultLanguage)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Proyecto actualizado | ${escapeHtml(site.name)}</title>
  <meta name="description" content="Las fotografías de este inmueble se han reunido en una única página de proyecto.">
  <meta name="robots" content="noindex, follow">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(redirect.to)}">
  <link rel="canonical" href="${escapeHtml(target.canonical_url)}">
</head>
<body><main id="main-content"><h1>${escapeHtml(project.title)}</h1><p><a href="${escapeHtml(redirect.to)}">Ver el proyecto completo</a></p></main></body>
</html>
`, "utf8");
  }

  console.log(`Built project index and ${projects.length} project detail pages`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
