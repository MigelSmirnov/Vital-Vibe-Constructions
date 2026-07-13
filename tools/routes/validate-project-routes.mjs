#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const contractPath = path.join(root, "architecture/project-routes.yaml");
const sitemapPath = path.join(root, "sitemap.xml");

async function main() {
  const [contract, sitemap, knowledge] = await Promise.all([
    readJsonContract(contractPath),
    readFile(sitemapPath, "utf8"),
    loadContentTables({ root }).then((tables) => createKnowledgeRepository(tables)),
  ]);
  const canonicalOrigin = new URL(knowledge.getSite().canonicalOrigin).origin;
  const families = requireArray(contract.route_families, "route_families");
  const routes = requireArray(contract.routes, "routes");
  const mappings = requireArray(contract.legacy_source_mappings, "legacy_source_mappings");
  const familyById = uniqueMap(families, "id", "route families");
  const routeById = uniqueMap(routes, "id", "routes");

  if (contract.version !== 1) throw new Error("Unsupported project route contract version.");
  if (contract.policies?.generated_html_required_for_sitemap !== true) {
    throw new Error("Route contract must require generated HTML before sitemap inclusion.");
  }

  assertRequiredFamilies(familyById);
  assertUniqueValues(routes, "path", "route paths");
  assertUniqueValues(routes, "canonical_url", "route canonical URLs");

  const sitemapLocations = new Set(
    [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1].trim()),
  );

  for (const route of routeById.values()) {
    if (!familyById.has(route.family_id)) {
      throw new Error(`Route "${route.id}" references unknown family "${route.family_id}".`);
    }

    assertConcretePath(route.path, route.id);
    const expectedCanonicalUrl = new URL(route.path, canonicalOrigin).href;

    if (route.canonical_url !== expectedCanonicalUrl) {
      throw new Error(`Route "${route.id}" canonical URL must be ${expectedCanonicalUrl}.`);
    }

    if (route.entity_type === "Project" && !knowledge.findProjectById(route.entity_id)) {
      throw new Error(`Route "${route.id}" references unknown Project "${route.entity_id}".`);
    }

    for (const sourceFile of requireArray(route.source_files, `${route.id}.source_files`)) {
      await assertFileExists(sourceFile, `Route "${route.id}" source file`);
    }

    if (route.sitemap_eligible) {
      if (typeof route.generated_html_path !== "string" || route.generated_html_path.trim() === "") {
        throw new Error(`Route "${route.id}" is sitemap eligible without a generated HTML path.`);
      }

      await assertFileExists(route.generated_html_path, `Route "${route.id}" generated HTML`);
      if (!sitemapLocations.has(route.canonical_url)) {
        throw new Error(`Sitemap-eligible route "${route.id}" is missing from sitemap.xml.`);
      }
    } else if (sitemapLocations.has(route.canonical_url)) {
      throw new Error(`Non-eligible route "${route.id}" is already present in sitemap.xml.`);
    }
  }

  assertProjectRouteCoverage(routes, knowledge.listProjects());
  assertDeferredImageRoutes(familyById, routes);

  for (const mapping of mappings) {
    await assertFileExists(mapping.source_file, "Legacy mapping source file");

    for (const projectId of requireArray(mapping.project_ids, `${mapping.source_file}.project_ids`)) {
      if (!knowledge.findProjectById(projectId)) {
        throw new Error(`Legacy source "${mapping.source_file}" references unknown Project "${projectId}".`);
      }
    }

    if (
      !Number.isInteger(mapping.content_media_count) ||
      !Number.isInteger(mapping.project_owned_media_count) ||
      !Number.isInteger(mapping.modeled_non_project_media_count) ||
      mapping.project_owned_media_count + mapping.modeled_non_project_media_count > mapping.content_media_count
    ) {
      throw new Error(`Legacy source "${mapping.source_file}" has invalid media coverage counts.`);
    }
  }

  await assertFileExists(contract.diagnostic_artifact, "Route diagnostic artifact");
  console.log("Validated project route contract");
}

async function readJsonContract(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to read JSON-compatible route contract: ${error.message}`);
  }
}

function requireArray(value, name) {
  if (!Array.isArray(value)) throw new Error(`Expected ${name} to be an array.`);
  return value;
}

function uniqueMap(records, fieldName, description) {
  assertUniqueValues(records, fieldName, description);
  return new Map(records.map((record) => [record[fieldName], record]));
}

function assertUniqueValues(records, fieldName, description) {
  const values = records.map((record) => record[fieldName]);

  if (values.some((value) => typeof value !== "string" || value.trim() === "")) {
    throw new Error(`Expected every ${description} ${fieldName} to be a non-empty string.`);
  }

  if (new Set(values).size !== values.length) {
    throw new Error(`Expected unique ${description} ${fieldName} values.`);
  }
}

function assertRequiredFamilies(familyById) {
  const expectedPatterns = new Map([
    ["projects-index", "/projects/"],
    ["project-detail", "/projects/{project.slug}/"],
    ["gallery-index", "/gallery/"],
    ["project-image-detail", "/projects/{project.slug}/images/{media.slug}/"],
  ]);

  for (const [familyId, pathPattern] of expectedPatterns) {
    const family = familyById.get(familyId);

    if (!family) throw new Error(`Missing required route family: ${familyId}`);
    if (family.path_pattern !== pathPattern) {
      throw new Error(`Route family "${familyId}" must use path pattern "${pathPattern}".`);
    }
  }
}

function assertConcretePath(routePath, routeId) {
  if (
    typeof routePath !== "string" ||
    !routePath.startsWith("/") ||
    !routePath.endsWith("/") ||
    routePath.includes("{") ||
    routePath.includes("}")
  ) {
    throw new Error(`Route "${routeId}" must use a concrete root-relative path with a trailing slash.`);
  }
}

function assertProjectRouteCoverage(routes, projects) {
  const expectedProjectIds = new Set(projects.map((project) => project.id));
  const projectRoutes = routes.filter((route) => route.family_id === "project-detail");
  const routedProjectIds = new Set(projectRoutes.map((route) => route.entity_id));

  if (
    projectRoutes.length !== projects.length ||
    expectedProjectIds.size !== routedProjectIds.size ||
    [...expectedProjectIds].some((projectId) => !routedProjectIds.has(projectId))
  ) {
    throw new Error("Project detail routes must cover every current Project record exactly once.");
  }
}

function assertDeferredImageRoutes(familyById, routes) {
  if (familyById.get("project-image-detail").status !== "deferred") {
    throw new Error("Project image detail routes must remain deferred during the route-planning stage.");
  }

  if (routes.some((route) => route.family_id === "project-image-detail")) {
    throw new Error("Project image detail route instances must not exist while the family is deferred.");
  }
}

async function assertFileExists(relativePath, description) {
  if (typeof relativePath !== "string" || relativePath.trim() === "") {
    throw new Error(`${description} must be a non-empty repository path.`);
  }

  try {
    await access(path.join(root, relativePath));
  } catch {
    throw new Error(`${description} does not exist: ${relativePath}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
