import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createKnowledgeRepository, loadContentTables } from '../../knowledge/index.mjs';
import { escape, projectLocaleRoutes } from './project-locales.mjs';

const knowledge = createKnowledgeRepository(await loadContentTables());
const contract = JSON.parse(await readFile('architecture/project-routes.yaml', 'utf8'));
const routes = projectLocaleRoutes(contract);
const metadata = new Set();
const pages = new Map(await Promise.all(routes.map(async route => [route.path, await readFile(route.generated_html_path, 'utf8')])));
for (const base of routes.filter(route => route.language === 'es')) {
  const siblings = routes.filter(route => route.source_path === base.path);
  assert.deepEqual(siblings.map(route => route.language).sort(), ['en', 'es', 'ru']);
  const source = pages.get(base.path);
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
  }
}
console.log(`Validated ${routes.length} project pages: translations, media, language navigation, metadata and homepage links.`);
