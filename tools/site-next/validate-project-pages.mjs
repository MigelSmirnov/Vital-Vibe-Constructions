#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const contractPath = path.join(root, "architecture/project-routes.yaml");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function main() {
  const [contract, knowledge] = await Promise.all([
    readFile(contractPath, "utf8").then(JSON.parse),
    loadContentTables({ root }).then((tables) => createKnowledgeRepository(tables)),
  ]);
  const generatedRoutes = contract.routes.filter(
    (route) => route.status === "generated" && route.sitemap_eligible === true,
  );
  const projectIndexRoute = generatedRoutes.find((route) => route.family_id === "projects-index");
  const projectRoutes = generatedRoutes.filter((route) => route.family_id === "project-detail");

  if (!projectIndexRoute) throw new Error("Generated projects index route is missing from the route contract.");
  if (projectRoutes.length !== knowledge.listProjects().length) {
    throw new Error("Generated project detail route count does not match current Project records.");
  }

  const metadata = [];
  const indexHtml = await readGeneratedPage(projectIndexRoute);
  metadata.push(validatePageShell(indexHtml, projectIndexRoute));

  for (const project of knowledge.listProjects()) {
    const route = projectRoutes.find((item) => item.entity_id === project.id);

    if (!route) throw new Error(`Generated route is missing for Project "${project.id}".`);
    if (route.generated_html_path !== `site-next/projects/${project.slug}/index.html`) {
      throw new Error(`Project "${project.id}" output path does not match its slug.`);
    }

    assertIncludes(indexHtml, `href="./${project.slug}/"`, `Projects index link for ${project.id}`);
    assertIncludes(indexHtml, escapeHtml(project.title), `Projects index title for ${project.id}`);

    const html = await readGeneratedPage(route);
    metadata.push(validatePageShell(html, route));
    assertIncludes(html, escapeHtml(project.title), `Project title for ${project.id}`);
    assertIncludes(html, escapeHtml(project.summary), `Project summary for ${project.id}`);
    assertIncludes(html, 'href="../"', `Project index backlink for ${project.id}`);

    for (const serviceId of project.serviceIds) {
      const service = knowledge.findServiceById(serviceId);
      assertIncludes(html, escapeHtml(service.title), `Service "${serviceId}" for ${project.id}`);
    }

    for (const mediaId of project.imageIds) {
      const media = knowledge.findMediaById(mediaId);
      assertIncludes(html, media.src, `Media source "${mediaId}" for ${project.id}`);
      assertIncludes(html, `alt="${escapeHtml(media.alt)}"`, `Media alt "${mediaId}" for ${project.id}`);
      assertIncludes(
        html,
        `width="${media.width}" height="${media.height}"`,
        `Media dimensions "${mediaId}" for ${project.id}`,
      );
    }
  }

  assertUniqueMetadata(metadata, "title");
  assertUniqueMetadata(metadata, "description");
  assertUniqueMetadata(metadata, "canonical");
  await assertMissing("site-next/gallery/index.html", "Blocked gallery output");

  console.log(`Validated project index and ${projectRoutes.length} project detail pages`);
}

async function readGeneratedPage(route) {
  if (typeof route.generated_html_path !== "string") {
    throw new Error(`Route "${route.id}" does not declare a generated HTML path.`);
  }

  try {
    return await readFile(path.join(root, route.generated_html_path), "utf8");
  } catch (error) {
    throw new Error(`Failed to read generated page for route "${route.id}": ${error.message}`);
  }
}

function validatePageShell(html, route) {
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
    "canonical URL",
    route.id,
  );
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>/g)];

  if (canonical !== route.canonical_url) {
    throw new Error(`Route "${route.id}" generated canonical URL does not match its contract.`);
  }

  if (h1Matches.length !== 1) {
    throw new Error(`Route "${route.id}" must contain exactly one H1; found ${h1Matches.length}.`);
  }

  assertIncludes(html, '<main id="main-content">', `Main landmark for ${route.id}`);
  return { routeId: route.id, title, description, canonical };
}

function extractRequired(html, pattern, fieldName, routeId) {
  const value = pattern.exec(html)?.[1]?.trim();
  if (!value) throw new Error(`Route "${routeId}" is missing ${fieldName}.`);
  return value;
}

function assertIncludes(html, fragment, description) {
  if (!html.includes(fragment)) throw new Error(`${description} is missing from generated HTML.`);
}

function assertUniqueMetadata(metadata, fieldName) {
  const values = metadata.map((item) => item[fieldName]);
  if (new Set(values).size !== values.length) {
    throw new Error(`Generated project pages must have unique ${fieldName} values.`);
  }
}

async function assertMissing(relativePath, description) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    return;
  }

  throw new Error(`${description} must not exist: ${relativePath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
