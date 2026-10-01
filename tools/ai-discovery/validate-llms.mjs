#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const llmsPath = path.join(root, "llms.txt");
const routeContractPath = path.join(root, "architecture/project-routes.yaml");

async function main() {
  const [llms, knowledge, routeContract] = await Promise.all([
    readFile(llmsPath, "utf8"),
    loadContentTables({ root }).then((tables) => createKnowledgeRepository(tables)),
    readFile(routeContractPath, "utf8").then(JSON.parse),
  ]);
  const planner = knowledge.findExternalAppById("electrical-planner");

  if (!planner) {
    throw new Error("Required external app record is missing: electrical-planner");
  }

  const requiredFragments = [
    knowledge.getSite().name,
    knowledge.getSite().canonicalOrigin,
    knowledge.getContactDetails().email,
    planner.url,
    ...routeContract.routes.filter(route => route.family_id === "article-detail" && route.status === "generated").flatMap(route => [route.canonical_url, knowledge.findArticleById(route.entity_id).localized(route.language).title]),
    ...knowledge.listServices().map((service) => service.title),
    ...routeContract.routes
      .filter((route) => route.family_id === "service-detail" && route.status === "generated")
      .flatMap((route) => {
        const service = knowledge.findServiceById(route.entity_id);
        if (!service) throw new Error(`Service route "${route.id}" does not resolve to a Service.`);
        return [route.canonical_url, service.pageH1, service.metaDescription];
      }),
    ...knowledge.listRenovationTiers().flatMap((tier) => [tier.title, String(tier.pricePerM2)]),
    ...knowledge
      .listProjects()
      .flatMap((project) => [project.title, `${knowledge.getSite().canonicalOrigin}/projects/${project.slug}/`]),
    ...knowledge
      .listCapabilitySections()
      .flatMap((section) => [section.title, section.note, ...section.capabilities]),
  ];

  for (const fragment of requiredFragments) {
    if (!llms.includes(fragment)) {
      throw new Error(`llms.txt is missing required content: ${fragment}`);
    }
  }

  const stalePlannerUrlPattern = /Planner URL:\s*\nhttps:\/\/app\.vitalvibeconstruction\.com\/\s*(?:\n|$)/;
  if (stalePlannerUrlPattern.test(llms)) {
    throw new Error("llms.txt uses the stale planner root URL as the primary planner URL.");
  }

  console.log("Validated llms.txt");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
