#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const routeContractPath = path.join(root, "architecture/project-routes.yaml");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderHeader(site) {
  return `<header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="${escapeHtml(site.name)}">
        <img src="/VVC_primary_logo.svg" alt="${escapeHtml(site.name)}" width="170" height="48">
      </a>
      <nav aria-label="Navegación principal">
        <a href="/#servicios" aria-current="page">Servicios</a>
        <a href="/projects/">Proyectos</a>
        <a href="/gallery/">Galería</a>
        <a href="/#hogar-inteligente">Domótica</a>
        <a href="/#contacto">Contacto</a>
      </nav>
    </div>
  </header>`;
}

function renderBreadcrumb({ service, canonicalUrl }) {
  const items = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/#servicios" },
    { name: service.title, href: canonicalUrl },
  ];

  return `<nav class="breadcrumb" aria-label="Migas de pan">
        <ol>${items
          .map(
            (item, index) =>
              `<li>${index < items.length - 1 ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.name)}</a>` : `<span aria-current="page">${escapeHtml(item.name)}</span>`}</li>`,
          )
          .join("")}</ol>
      </nav>`;
}

function renderScope(service, includedServices) {
  return `<section class="section service-scope" id="incluye">
      <div class="container">
        <div class="service-section-heading">
          <p class="eyebrow">Alcance coordinado</p>
          <h2>Qué incluye una reforma integral</h2>
          <p>${escapeHtml(service.body)}</p>
        </div>
        <div class="service-scope-grid">
          <article class="service-scope-card">
            <h3>Coordinación general</h3>
            <p>${escapeHtml(service.summary)}</p>
          </article>
          ${includedServices
            .map(
              (includedService) => `<article class="service-scope-card">
            <h3>${escapeHtml(includedService.title)}</h3>
            <p>${escapeHtml(includedService.summary)}</p>
          </article>`,
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

function renderProcess(service) {
  return `<section class="section service-process" id="proceso">
      <div class="container">
        <div class="service-section-heading">
          <p class="eyebrow">Proceso</p>
          <h2>Cómo trabajamos</h2>
          <p>El proceso se adapta al alcance real de cada reforma, sin asumir partidas ni plazos antes de revisar el proyecto.</p>
        </div>
        <ol class="service-process-list">${service.process_steps
          .map(
            (step, index) => `<li>
            <span class="service-process-number">${String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>${escapeHtml(step.title)}</h3>
              <p>${escapeHtml(step.description)}</p>
            </div>
          </li>`,
          )
          .join("")}</ol>
      </div>
    </section>`;
}

function renderProjects(projects, mediaById, projectRouteById) {
  const cards = projects
    .map((project) => {
      const route = projectRouteById.get(project.id);
      const image = mediaById.get(project.image_ids[0]);

      if (!route) throw new Error(`Related Project "${project.id}" does not have a generated route.`);
      if (!image) throw new Error(`Related Project "${project.id}" does not have a resolvable lead image.`);

      return `<article class="project-index-card">
          <a class="project-index-media" href="${escapeHtml(route.path)}">
            <img src="/${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy">
          </a>
          <div class="project-index-body">
            <p class="project-meta">${escapeHtml([project.location, project.budget_range].filter(Boolean).join(" · "))}</p>
            <h3><a href="${escapeHtml(route.path)}">${escapeHtml(project.title)}</a></h3>
            <p>${escapeHtml(project.summary)}</p>
            <a class="text-link" href="${escapeHtml(route.path)}">Ver proyecto</a>
          </div>
        </article>`;
    })
    .join("");

  return `<section class="section service-projects" id="proyectos-relacionados">
      <div class="container">
        <div class="service-section-heading">
          <p class="eyebrow">Proyectos reales</p>
          <h2>Reformas integrales documentadas</h2>
          <p>Estos proyectos del repositorio están relacionados directamente con el servicio de reformas integrales.</p>
        </div>
        <div class="project-index-grid">${cards}</div>
      </div>
    </section>`;
}

function renderFaq(service) {
  return `<section class="section service-faq" id="preguntas-frecuentes">
      <div class="container service-faq-layout">
        <div class="service-section-heading">
          <p class="eyebrow">Preguntas frecuentes</p>
          <h2>Antes de plantear la reforma</h2>
          <p>Respuestas basadas en el alcance y los servicios que actualmente figuran en nuestro repositorio.</p>
        </div>
        <div class="service-faq-list">${service.faq
          .map(
            (item) => `<details>
            <summary>${escapeHtml(item.question)}</summary>
            <p>${escapeHtml(item.answer)}</p>
          </details>`,
          )
          .join("")}</div>
      </div>
    </section>`;
}

function renderContact({ site, contactDetails }) {
  return `<section class="section service-contact">
      <div class="container">
        <p class="eyebrow">Contacto</p>
        <h2>${escapeHtml(site.contact.heading)}</h2>
        <p>${escapeHtml(site.contact.summary)}</p>
        <div class="contact-actions">
          <a class="button button-primary" href="${escapeHtml(contactDetails.whatsapp_url)}" target="_blank" rel="noopener">WhatsApp</a>
          <a class="button button-secondary" href="${escapeHtml(contactDetails.phone_href)}">${escapeHtml(contactDetails.phone_display)}</a>
          <a class="button button-secondary" href="mailto:${escapeHtml(contactDetails.email)}">${escapeHtml(contactDetails.email)}</a>
          <a class="button button-secondary" href="/#contacto">Formulario de contacto</a>
        </div>
      </div>
    </section>`;
}

function createStructuredData({ site, service, canonicalUrl }) {
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const serviceId = `${canonicalUrl}#service`;
  const faqId = `${canonicalUrl}#faq`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: service.seo_title,
        description: service.meta_description,
        inLanguage: site.defaultLanguage,
        breadcrumb: { "@id": breadcrumbId },
        mainEntity: [{ "@id": serviceId }, { "@id": faqId }],
      },
      {
        "@type": "Service",
        "@id": serviceId,
        name: service.page_h1,
        description: service.introduction,
        serviceType: service.title,
        areaServed: site.serviceArea,
        provider: {
          "@type": "Organization",
          name: site.name,
          url: `${site.canonicalOrigin}/`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: `${site.canonicalOrigin}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Servicios",
            item: `${site.canonicalOrigin}/#servicios`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: service.title,
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": faqId,
        mainEntity: service.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

function renderServicePage({
  site,
  service,
  includedServices,
  relatedProjects,
  mediaById,
  projectRouteById,
  contactDetails,
  route,
}) {
  const canonicalUrl = route.canonical_url;
  const leadImage = mediaById.get(relatedProjects[0].image_ids[0]);

  if (!leadImage) throw new Error(`Service "${service.id}" does not have a resolvable project image.`);

  const structuredData = createStructuredData({ site, service, canonicalUrl });

  return `<!doctype html>
<html lang="${escapeHtml(site.defaultLanguage)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(service.seo_title)}</title>
  <meta name="description" content="${escapeHtml(service.meta_description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(service.seo_title)}">
  <meta property="og:description" content="${escapeHtml(service.meta_description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(site.canonicalOrigin)}/${escapeHtml(leadImage.src)}">
  <link rel="stylesheet" href="/styles.css">
  <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>
</head>
<body>
  <a class="skip-link" href="#main-content">Saltar al contenido</a>
  ${renderHeader(site)}
  <main id="main-content">
    <section class="service-hero">
      <div class="container">
        ${renderBreadcrumb({ service, canonicalUrl })}
        <div class="service-hero-grid">
          <div>
            <p class="eyebrow">Servicio en Barcelona</p>
            <h1>${escapeHtml(service.page_h1)}</h1>
            <p class="service-introduction">${escapeHtml(service.introduction)}</p>
            <a class="button button-primary" href="/#contacto">Cuéntanos tu proyecto</a>
          </div>
          <figure class="service-hero-media">
            <img src="/${escapeHtml(leadImage.src)}" alt="${escapeHtml(leadImage.alt)}" width="${leadImage.width}" height="${leadImage.height}">
          </figure>
        </div>
      </div>
    </section>
    ${renderScope(service, includedServices)}
    ${renderProcess(service)}
    ${renderProjects(relatedProjects, mediaById, projectRouteById)}
    ${renderFaq(service)}
    ${renderContact({ site, contactDetails })}
  </main>
  <footer class="site-footer">
    <div class="container">© ${new Date().getUTCFullYear()} ${escapeHtml(site.name)}</div>
  </footer>
</body>
</html>`;
}

async function main() {
  const [knowledge, routeContract] = await Promise.all([
    loadContentTables({ root }).then((tables) => createKnowledgeRepository(tables)),
    readFile(routeContractPath, "utf8").then(JSON.parse),
  ]);
  const site = knowledge.getSite().toRecord();
  const contactDetails = knowledge.getContactDetails().toRecord();
  const mediaById = new Map(knowledge.listMedia().map((item) => [item.id, item.toRecord()]));
  const projectRouteById = new Map(
    routeContract.routes
      .filter((route) => route.family_id === "project-detail" && route.status === "generated")
      .map((route) => [route.entity_id, route]),
  );
  const serviceRoutes = routeContract.routes.filter(
    (route) => route.family_id === "service-detail" && route.status === "generated",
  );

  for (const route of serviceRoutes) {
    const serviceEntity = knowledge.findServiceById(route.entity_id);
    if (!serviceEntity) throw new Error(`Service route "${route.id}" does not resolve to a Service.`);

    const service = serviceEntity.toRecord();
    const includedServices = service.included_service_ids.map((serviceId) => {
      const includedService = knowledge.findServiceById(serviceId);
      if (!includedService) throw new Error(`Service "${service.id}" references unknown Service "${serviceId}".`);
      return includedService.toRecord();
    });
    const relatedProjects = knowledge
      .listProjects()
      .filter((project) => project.serviceIds.includes(service.id))
      .map((project) => project.toRecord());

    if (relatedProjects.length === 0) {
      throw new Error(`Service "${service.id}" does not have any related Projects.`);
    }

    const outputPath = path.join(root, route.generated_html_path);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(
      outputPath,
      renderServicePage({
        site,
        service,
        includedServices,
        relatedProjects,
        mediaById,
        projectRouteById,
        contactDetails,
        route,
      }),
      "utf8",
    );
  }

  console.log(`Built ${serviceRoutes.length} service detail page`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
