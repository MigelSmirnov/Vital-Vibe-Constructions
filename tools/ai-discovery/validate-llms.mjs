#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const llmsPath = path.join(root, "llms.txt");

async function main() {
  const [llms, knowledge] = await Promise.all([
    readFile(llmsPath, "utf8"),
    loadContentTables({ root }).then((tables) => createKnowledgeRepository(tables)),
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
    ...knowledge.listServices().map((service) => service.title),
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
