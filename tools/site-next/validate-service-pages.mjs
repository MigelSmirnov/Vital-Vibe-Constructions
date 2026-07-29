#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const siteRoot = path.join(root, "site-next");
const routeContractPath = path.join(root, "architecture/project-routes.yaml");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function assertIncludes(html, fragment, description) {
  if (!html.includes(fragment)) {
    throw new Error(`${description} is missing from generated service HTML.`);
  }
}

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listHtmlFiles(absolutePath));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(absolutePath);
  }

  return files;
}

function extractRequired(html, pattern, fieldName, routeId) {
  const value = pattern.exec(html)?.[1]?.trim();
  if (!value) throw new Error(`Route "${routeId}" is missing ${fieldName}.`);
  return value;
}

function extractStructuredGraph(html, routeId) {
  const json = extractRequired(
    html,
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    "JSON-LD",
    routeId,
  );

  let structuredData;
  try {
    structuredData = JSON.parse(json);
  } catch (error) {
    throw new Error(`Route "${routeId}" contains invalid JSON-LD: ${error.message}`);
  }

  if (!Array.isArray(structuredData["@graph"])) {
    throw new Error(`Route "${routeId}" JSON-LD must contain an @graph array.`);
  }

  return structuredData["@graph"];
}

function findSchema(graph, type, routeId) {
  const schema = graph.find((item) => item["@type"] === type);
  if (!schema) throw new Error(`Route "${routeId}" JSON-LD is missing ${type}.`);
  return schema;
}

async function main() {
  const [routeContract, knowledge, sitemap, llms, htmlFiles] = await Promise.all([
    readFile(routeContractPath, "utf8").then(JSON.parse),
    loadContentTables({ root }).then((tables) => createKnowledgeRepository(tables)),
    readFile(path.join(root, "sitemap.xml"), "utf8"),
    readFile(path.join(root, "llms.txt"), "utf8"),
    listHtmlFiles(siteRoot),
  ]);
  const serviceRoutes = routeContract.routes.filter(
    (route) =>
      route.family_id === "service-detail" &&
      route.status === "generated" &&
      route.sitemap_eligible === true,
  );
  const pageServices = knowledge.listServices().filter((service) => service.seoTitle !== null);

  if (serviceRoutes.length !== pageServices.length) {
    throw new Error("Generated service route count does not match Services with page content.");
  }

  const allMetadata = [];
  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    allMetadata.push({
      file: path.relative(root, htmlFile),
      title: extractRequired(html, /<title>([^<]+)<\/title>/, "title", htmlFile),
      description: extractRequired(
        html,
        /<meta name="description" content="([^"]+)">/,
        "description",
        htmlFile,
      ),
    });
  }
  assertUniqueMetadata(allMetadata, "title");
  assertUniqueMetadata(allMetadata, "description");

  const projectRouteById = new Map(
    routeContract.routes
      .filter((route) => route.family_id === "project-detail" && route.status === "generated")
      .map((route) => [route.entity_id, route]),
  );
  const contactDetails = knowledge.getContactDetails();

  for (const service of pageServices) {
    const route = serviceRoutes.find((item) => item.entity_id === service.id);
    if (!route) throw new Error(`Generated route is missing for Service "${service.id}".`);

    const expectedOutputPath = `site-next/servicios/${service.slug}-barcelona/index.html`;
    if (route.generated_html_path !== expectedOutputPath) {
      throw new Error(`Service "${service.id}" output path must be ${expectedOutputPath}.`);
    }

    const html = await readFile(path.join(root, route.generated_html_path), "utf8");
    const title = extractRequired(html, /<title>([^<]+)<\/title>/, "title", route.id);
    const description = extractRequired(
      html,
      /<meta name="description" content="([^"]+)">/,
      "description",
      route.id,
    );
    const canonical = extractRequired(
      html,
      /<link rel="canonical" href="([^"]+)">/,
      "canonical",
      route.id,
    );

    if (title !== service.seoTitle) throw new Error(`Route "${route.id}" title does not match Service content.`);
    if (description !== service.metaDescription) {
      throw new Error(`Route "${route.id}" description does not match Service content.`);
    }
    if (canonical !== route.canonical_url) {
      throw new Error(`Route "${route.id}" canonical URL does not match its contract.`);
    }
    if ([...html.matchAll(/<h1\b[^>]*>/g)].length !== 1) {
      throw new Error(`Route "${route.id}" must contain exactly one H1.`);
    }

    assertIncludes(html, `<h1>${escapeHtml(service.pageH1)}</h1>`, `H1 for ${service.id}`);
    assertIncludes(html, escapeHtml(service.introduction), `Visible introduction for ${service.id}`);
    assertIncludes(html, escapeHtml(service.body), `Visible scope description for ${service.id}`);
    assertIncludes(html, ">Inicio</a>", `Inicio breadcrumb for ${service.id}`);
    assertIncludes(html, ">Servicios</a>", `Servicios breadcrumb for ${service.id}`);
    assertIncludes(html, `>${escapeHtml(service.title)}</span>`, `Current breadcrumb for ${service.id}`);

    for (const includedServiceId of service.includedServiceIds) {
      const includedService = knowledge.findServiceById(includedServiceId);
      if (!includedService) {
        throw new Error(`Service "${service.id}" references unknown included Service "${includedServiceId}".`);
      }
      assertIncludes(html, escapeHtml(includedService.title), `Included Service "${includedServiceId}"`);
      assertIncludes(html, escapeHtml(includedService.summary), `Included Service summary "${includedServiceId}"`);
    }

    assertIncludes(html, "<h3>Coordinación general</h3>", `Coordination scope for ${service.id}`);
    assertIncludes(html, escapeHtml(service.summary), `Coordination summary for ${service.id}`);
    service.processSteps.forEach((step, index) => {
      assertIncludes(html, `<h3>${escapeHtml(step.title)}</h3>`, `Process step ${index + 1} title`);
      assertIncludes(html, `<p>${escapeHtml(step.description)}</p>`, `Process step ${index + 1} description`);
    });

    const relatedProjects = knowledge
      .listProjects()
      .filter((project) => project.serviceIds.includes(service.id));
    if (relatedProjects.length === 0) {
      throw new Error(`Service "${service.id}" must have at least one related Project.`);
    }

    for (const project of relatedProjects) {
      const projectRoute = projectRouteById.get(project.id);
      if (!projectRoute) throw new Error(`Related Project "${project.id}" does not have a generated route.`);

      for (const mediaId of project.imageIds) {
        if (!knowledge.findMediaById(mediaId)) {
          throw new Error(`Related Project "${project.id}" references unknown Media "${mediaId}".`);
        }
      }

      const leadImage = knowledge.findMediaById(project.imageIds[0]);
      assertIncludes(html, `href="${projectRoute.path}"`, `Project link for ${project.id}`);
      assertIncludes(html, escapeHtml(project.title), `Project title for ${project.id}`);
      assertIncludes(html, escapeHtml(project.summary), `Project summary for ${project.id}`);
      assertIncludes(html, `src="/${leadImage.src}"`, `Project image for ${project.id}`);
      assertIncludes(html, `alt="${escapeHtml(leadImage.alt)}"`, `Project image alt for ${project.id}`);
      assertIncludes(
        html,
        `width="${leadImage.width}" height="${leadImage.height}"`,
        `Project image dimensions for ${project.id}`,
      );
    }

    const graph = extractStructuredGraph(html, route.id);
    const webPageSchema = findSchema(graph, "WebPage", route.id);
    const serviceSchema = findSchema(graph, "Service", route.id);
    const breadcrumbSchema = findSchema(graph, "BreadcrumbList", route.id);
    const faqSchema = findSchema(graph, "FAQPage", route.id);

    if (webPageSchema.url !== route.canonical_url || webPageSchema.name !== service.seoTitle) {
      throw new Error(`Route "${route.id}" WebPage schema does not match visible metadata.`);
    }
    if (
      serviceSchema.name !== service.pageH1 ||
      serviceSchema.description !== service.introduction ||
      serviceSchema.areaServed !== knowledge.getSite().serviceArea
    ) {
      throw new Error(`Route "${route.id}" Service schema does not match visible content.`);
    }

    const breadcrumbNames = breadcrumbSchema.itemListElement?.map((item) => item.name);
    if (
      JSON.stringify(breadcrumbNames) !== JSON.stringify(["Inicio", "Servicios", service.title])
    ) {
      throw new Error(`Route "${route.id}" BreadcrumbList does not match visible breadcrumbs.`);
    }

    if (!Array.isArray(faqSchema.mainEntity) || faqSchema.mainEntity.length !== service.faq.length) {
      throw new Error(`Route "${route.id}" FAQPage item count does not match visible FAQ.`);
    }
    service.faq.forEach((item, index) => {
      assertIncludes(html, `<summary>${escapeHtml(item.question)}</summary>`, `FAQ question ${index + 1}`);
      assertIncludes(html, `<p>${escapeHtml(item.answer)}</p>`, `FAQ answer ${index + 1}`);

      const schemaQuestion = faqSchema.mainEntity[index];
      if (
        schemaQuestion?.name !== item.question ||
        schemaQuestion?.acceptedAnswer?.text !== item.answer
      ) {
        throw new Error(`Route "${route.id}" FAQPage item ${index + 1} does not match visible FAQ.`);
      }
    });

    for (const href of [
      contactDetails.whatsappUrl,
      contactDetails.phoneHref,
      `mailto:${contactDetails.email}`,
      "/#contacto",
    ]) {
      assertIncludes(html, `href="${escapeHtml(href)}"`, `Contact CTA ${href}`);
    }

    const relativeUrl = /\b(?:href|src)=(['"])(?:\.\.?\/)[^'"]*\1/;
    if (relativeUrl.test(html)) {
      throw new Error(`Route "${route.id}" contains a relative href or src.`);
    }
    if (!sitemap.includes(`<loc>${route.canonical_url}</loc>`)) {
      throw new Error(`Route "${route.id}" is missing from sitemap.xml.`);
    }
    if (!llms.includes(route.canonical_url)) {
      throw new Error(`Route "${route.id}" is missing from llms.txt.`);
    }
  }

  console.log(`Validated ${serviceRoutes.length} service detail page`);
}

function assertUniqueMetadata(metadata, fieldName) {
  const values = metadata.map((item) => item[fieldName]);
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);

  if (duplicates.length) {
    throw new Error(`Generated pages must have unique ${fieldName} values; duplicate: ${duplicates[0]}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
