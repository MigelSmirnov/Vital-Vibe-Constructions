#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const outputDir = path.join(root, "site-next/gallery");
const coverageContractPath = path.join(root, "architecture/gallery-media-coverage.yaml");
const galleryStylesPath = path.join(root, "tools/site-next/gallery.css");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderGallery({ site, projects, media, capabilitySections }) {
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const capabilityByMediaId = new Map(
    capabilitySections.flatMap((section) => section.media_ids.map((mediaId) => [mediaId, section])),
  );
  const title = `Galería de reformas en Barcelona | ${site.name}`;
  const description = `Galería completa de proyectos, procesos de obra, acabados e instalaciones documentadas por ${site.name} en Barcelona.`;
  const canonicalUrl = `${site.canonicalOrigin}/gallery/`;
  const groups = new Map();

  for (const image of media) {
    const project = image.project_id ? projectById.get(image.project_id) : null;
    const capability = capabilityByMediaId.get(image.id);
    const owner = project
      ? {
          key: `project-${project.id}`,
          title: project.title,
          href: `../projects/${project.slug}/`,
          meta: [project.location, project.budget_range].filter(Boolean).join(" · "),
          linkLabel: "Ver proyecto",
        }
      : capability
        ? {
            key: `capability-${capability.id}`,
            title: capability.title,
            href: `../#${capability.slug}`,
            meta: "Domótica y preinstalación",
            linkLabel: "Ver capacidad",
          }
        : {
            key: "documented-work",
            title: "Trabajo documentado",
            href: "../#proyectos",
            meta: "Archivo de obra",
            linkLabel: "Ver proyectos",
          };

    if (!groups.has(owner.key)) groups.set(owner.key, { ...owner, images: [] });
    groups.get(owner.key).images.push(image);
  }

  const sections = [...groups.values()].map((group, groupIndex) => {
    const headingId = `gallery-group-${groupIndex + 1}`;
    const cards = group.images.map((image) => {
      const stateLabel = image.before_after_state
        ? { before: "Antes", work: "Proceso", after: "Resultado" }[image.before_after_state] ?? image.before_after_state
        : "Detalle";

      return `<figure class="gallery-card">
        <a class="gallery-card-media" href="${escapeHtml(group.href)}">
          <img src="../../${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy">
        </a>
        <figcaption>
          <span class="gallery-state">${escapeHtml(stateLabel)}</span>
          <strong>${escapeHtml(image.caption ?? image.alt)}</strong>
        </figcaption>
      </figure>`;
    }).join("");

    return `<section class="gallery-section" aria-labelledby="${headingId}">
      <header class="gallery-section-heading">
        <div>
          <p class="eyebrow">${group.images.length} ${group.images.length === 1 ? "imagen" : "imágenes"}${group.meta ? ` · ${escapeHtml(group.meta)}` : ""}</p>
          <h2 id="${headingId}">${escapeHtml(group.title)}</h2>
        </div>
        <a class="text-link" href="${escapeHtml(group.href)}">${escapeHtml(group.linkLabel)}</a>
      </header>
      <div class="gallery-grid">${cards}</div>
    </section>`;
  }).join("");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonicalUrl,
    isPartOf: { "@type": "WebSite", name: site.name, url: `${site.canonicalOrigin}/` },
  };

  return `<!doctype html>
<html lang="${escapeHtml(site.defaultLanguage)}">
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
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="../gallery.css">
  <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>
</head>
<body>
  <a class="skip-link" href="#main-content">Saltar al contenido</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="../" aria-label="${escapeHtml(site.name)}">
        <img src="../../VVC_primary_logo.svg" alt="${escapeHtml(site.name)}" width="170" height="48">
      </a>
      <nav aria-label="Navegación principal">
        <a href="../#servicios">Servicios</a>
        <a href="../projects/">Proyectos</a>
        <a href="./" aria-current="page">Galería</a>
        <a href="../#contacto">Contacto</a>
      </nav>
    </div>
  </header>
  <main id="main-content">
    <section class="page-intro">
      <div class="container">
        <p class="eyebrow">Galería completa</p>
        <h1>Reformas, procesos y acabados en Barcelona</h1>
        <p>Las 39 imágenes verificadas se conservan completas y se agrupan por proyecto o capacidad para facilitar la exploración.</p>
      </div>
    </section>
    <section class="section">
      <div class="container gallery-collection">${sections}</div>
    </section>
  </main>
  <footer class="site-footer"><div class="container">© ${new Date().getUTCFullYear()} ${escapeHtml(site.name)}</div></footer>
</body>
</html>`;
}

async function main() {
  const [knowledge, coverageContract, galleryStyles] = await Promise.all([
    loadContentTables({ root }).then((tables) => createKnowledgeRepository(tables)),
    readFile(coverageContractPath, "utf8").then(JSON.parse),
    readFile(galleryStylesPath, "utf8"),
  ]);
  const mediaBySrc = new Map(knowledge.listMedia().map((item) => [item.src, item.toRecord()]));
  const expectedSources = coverageContract.sources.flatMap((source) => source.items.map((item) => item.src));

  if (expectedSources.length !== coverageContract.policy.expected_content_media_count) {
    throw new Error(
      `Gallery coverage contract declares ${coverageContract.policy.expected_content_media_count} images but lists ${expectedSources.length}.`,
    );
  }

  const media = expectedSources.map((src) => {
    const item = mediaBySrc.get(src);
    if (!item) throw new Error(`Gallery coverage source does not resolve to Media: ${src}`);
    return item;
  });

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDir, "index.html"), renderGallery({
      site: knowledge.getSite().toRecord(),
      projects: knowledge.listProjects().map((project) => project.toRecord()),
      media,
      capabilitySections: knowledge.listCapabilitySections().map((section) => section.toRecord()),
    }), "utf8"),
    writeFile(path.join(root, "site-next/gallery.css"), galleryStyles, "utf8"),
  ]);
  console.log(`Built grouped gallery with ${media.length} contract media records`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
