import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createKnowledgeRepository, loadContentTables } from '../../knowledge/index.mjs';
import { escape, projectLocaleRoutes } from './project-locales.mjs';

const knowledge = createKnowledgeRepository(await loadContentTables());
const contract = JSON.parse(await readFile('architecture/project-routes.yaml', 'utf8'));
const homeLocales = JSON.parse(await readFile('content/tables/home-localizations.yaml', 'utf8')).locales;
const routes = projectLocaleRoutes(contract);
const metadata = new Set();
const spanishHome = await readFile('site-next/index.html', 'utf8');
const pages = new Map(await Promise.all(routes.map(async route => [route.path, await readFile(route.generated_html_path, 'utf8')])));
for (const base of routes.filter(route => route.language === 'es')) {
  const siblings = routes.filter(route => route.source_path === base.path);
  assert.deepEqual(siblings.map(route => route.language).sort(), ['en', 'es', 'ru']);
  const source = pages.get(base.path);
  const project = base.entity_id ? knowledge.findProjectById(base.entity_id) : null;
  if (base.entity_id) assert.ok(project, `Missing project record: ${base.entity_id}`);
  const media = [...source.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*width="(\d+)" height="(\d+)"/g)].map(match => match.slice(1));
  for (const route of siblings) {
    const html = pages.get(route.path);
    assert.ok(html.includes(`<html lang="${route.language}">`), route.path);
    assert.ok(html.includes(`<link rel="canonical" href="${route.canonical_url}">`), route.path);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.deepEqual([...html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*width="(\d+)" height="(\d+)"/g)].map(match => match.slice(1)), media, `Media changed: ${route.path}`);
    for (const sibling of siblings) {
      assert.ok(html.includes(`hreflang="${sibling.language}" href="${sibling.canonical_url}"`));
      assert.ok(html.includes(`href="${sibling.path}" lang="${sibling.language}"`));
    }
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title && !metadata.has(title), `Duplicate or absent title: ${route.path}`);
    metadata.add(title);
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(data.inLanguage, route.language);
    assert.equal(data.url, route.canonical_url);
    if (route.language === 'es') continue;
    for (const [spanish, locales] of Object.entries(knowledge.projectLocalizations.translations)) {
      // Match whole visible text and text-bearing attributes, not substrings or JSON escapes.
      if (source.includes(`>${escape(spanish)}<`) || source.includes(`="${escape(spanish)}"`)) {
        assert.ok(html.includes(escape(locales[route.language])), `Untranslated copy on ${route.path}: ${spanish}`);
      }
    }
    const prefix = `/${route.language}`;
    assert.ok(html.includes(`href="${prefix}/#contacto"`), `Contact language: ${route.path}`);
    const content = html.replace(/<div class="language-switcher"[^>]*>[\s\S]*?<\/div>/, '');
    assert.ok(!/href="\/projects\//.test(content), `Project link loses language: ${route.path}`);
    const home = await readFile(`site-next/${route.language}/index.html`, 'utf8');
    assert.ok(!/href="\/projects\//.test(home), `Homepage project link loses language: ${route.language}`);
    if (project) {
      const cardMarker = `<article class="project-card" id="${project.slug}">`;
      if (spanishHome.includes(cardMarker)) {
        const card = home.split(cardMarker)[1]?.split('</article>')[0];
        assert.ok(card, `Homepage project card missing: ${route.language} ${project.slug}`);
        const leadMedia = project.imageIds.length ? knowledge.findMediaById(project.imageIds[0]) : null;
        const replacements = homeLocales[route.language]?.replacements ?? {};
        for (const spanish of [project.title, project.summary]) {
          const localized = replacements[spanish];
          assert.ok(localized, `Missing homepage project translation: ${route.language} ${spanish}`);
          assert.ok(card.includes(escape(localized)), `Homepage project translation missing: ${route.language} ${spanish}`);
        }
        if (leadMedia?.alt && replacements[leadMedia.alt]) {
          assert.ok(card.includes(escape(replacements[leadMedia.alt])), `Homepage project alt translation missing: ${route.language} ${leadMedia.alt}`);
        }
      }
    }
  }
}

for (const service of knowledge.listServices()) {
  for (const projectId of service.relatedProjectIds) {
    const project = knowledge.findProjectById(projectId);
    assert.ok(project, `Missing service-related project: ${projectId}`);
    const globalCardMarker = `<article class="project-card" id="${project.slug}">`;
    assert.ok(!spanishHome.includes(globalCardMarker), `Service-related project remains in global homepage list: ${project.slug}`);

    const spanishServiceMarker = `<details class="service-row" id="${service.slug}">`;
    const spanishServiceBlock = spanishHome.split(spanishServiceMarker)[1]?.split('</details>')[0];
    assert.ok(spanishServiceBlock, `Homepage service block missing: es ${service.slug}`);
    assert.ok(spanishServiceBlock.includes(`href="/projects/${project.slug}/"`), `Service project link missing: es ${project.slug}`);
    assert.ok(spanishServiceBlock.includes(escape(project.title)), `Service project title missing: es ${project.slug}`);

    for (const language of ['en', 'ru']) {
      const home = await readFile(`site-next/${language}/index.html`, 'utf8');
      assert.ok(!home.includes(globalCardMarker), `Service-related project remains in global homepage list: ${language} ${project.slug}`);
      const serviceMarker = `<details class="service-row" id="${service.slug}">`;
      const serviceBlock = home.split(serviceMarker)[1]?.split('</details>')[0];
      assert.ok(serviceBlock, `Homepage service block missing: ${language} ${service.slug}`);
      const projectRoute = routes.find(route => route.entity_id === project.id && route.language === language);
      assert.ok(projectRoute, `Localized service project route missing: ${language} ${project.slug}`);
      assert.ok(serviceBlock.includes(`href="${projectRoute.path}"`), `Service project link missing: ${language} ${project.slug}`);
      const replacements = homeLocales[language]?.replacements ?? {};
      const localizedTitle = replacements[project.title];
      assert.ok(localizedTitle, `Missing service project homepage translation: ${language} ${project.title}`);
      assert.ok(serviceBlock.includes(escape(localizedTitle)), `Service project title untranslated: ${language} ${project.slug}`);
    }
  }
}
console.log(`Validated ${routes.length} project pages: translations, media, language navigation, metadata and homepage links.`);
