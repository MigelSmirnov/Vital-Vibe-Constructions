import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";
import { projectLocaleRoutes } from "./project-locales.mjs";
import { localizeServiceHtml, serviceLocaleRoutes } from "./service-locales.mjs";

const knowledge = createKnowledgeRepository(await loadContentTables());
const contract = JSON.parse(await readFile("architecture/project-routes.yaml", "utf8"));
const serviceRoutes = serviceLocaleRoutes(contract);
const projectRoutes = projectLocaleRoutes(contract).map((route) => ({ ...route, family_group: "project" }));
const allRoutes = [...serviceRoutes, ...projectRoutes];

for (const base of serviceRoutes.filter((route) => route.language === "es")) {
  const source = await readFile(base.generated_html_path, "utf8");
  for (const route of serviceRoutes.filter((item) => item.source_path === base.path)) {
    const html = localizeServiceHtml(
      source,
      route,
      allRoutes,
      knowledge.serviceLocalizations,
      knowledge.getSite().canonicalOrigin,
    );
    await mkdir(path.dirname(route.generated_html_path), { recursive: true });
    await writeFile(route.generated_html_path, html, "utf8");
  }
}

console.log(`Built ${serviceRoutes.length} service pages across ES/EN/RU.`);
