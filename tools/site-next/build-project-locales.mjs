import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createKnowledgeRepository, loadContentTables } from '../../knowledge/index.mjs';
import { localizeProjectHtml, projectLocaleRoutes } from './project-locales.mjs';

const knowledge = createKnowledgeRepository(await loadContentTables());
const contract = JSON.parse(await readFile('architecture/project-routes.yaml', 'utf8'));
const routes = projectLocaleRoutes(contract);
const styleVersion = createHash("sha256").update(await readFile("site-next/styles.css")).digest("hex").slice(0,12);
for (const base of routes.filter(route => route.language === 'es')) {
  const source = await readFile(base.generated_html_path, 'utf8');
  for (const route of routes.filter(route => route.source_path === base.path)) {
    const html = localizeProjectHtml(source, route, routes, knowledge.projectLocalizations, knowledge.getSite().canonicalOrigin).replace('href="/styles.css"', `href="/styles.css?v=${styleVersion}"`);
    await mkdir(path.dirname(route.generated_html_path), { recursive: true });
    await writeFile(route.generated_html_path, html);
  }
}
console.log(`Built ${routes.length} project pages across ES/EN/RU.`);
