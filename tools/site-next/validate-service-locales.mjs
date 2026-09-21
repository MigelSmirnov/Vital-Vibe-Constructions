import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";
import { escapeServiceText, serviceLocaleRoutes } from "./service-locales.mjs";

const knowledge = createKnowledgeRepository(await loadContentTables());
const contract = JSON.parse(await readFile("architecture/project-routes.yaml", "utf8"));
const routes = serviceLocaleRoutes(contract);
const sitemap = await readFile("sitemap.xml", "utf8");
const pages = new Map(await Promise.all(routes.map(async (route) => [route.path, await readFile(route.generated_html_path, "utf8")])));
const metadata = new Set();

for (const base of routes.filter((route) => route.language === "es")) {
  const siblings = routes.filter((route) => route.source_path === base.path);
  assert.deepEqual(siblings.map((route) => route.language).sort(), ["en", "es", "ru"]);
  const source = pages.get(base.path);
  const media = [...source.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*width="(\d+)" height="(\d+)"/g)].map((match) => match.slice(1));

  for (const route of siblings) {
    const html = pages.get(route.path);
    assert.ok(html.includes(`<html lang="${route.language}">`), route.path);
    assert.ok(html.includes(`<link rel="canonical" href="${route.canonical_url}">`), route.path);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, route.path);
    assert.deepEqual(
      [...html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*width="(\d+)" height="(\d+)"/g)].map((match) => match.slice(1)),
      media,
      `Media changed: ${route.path}`,
    );
    for (const sibling of siblings) {
      assert.ok(html.includes(`hreflang="${sibling.language}" href="${sibling.canonical_url}"`), route.path);
      assert.ok(html.includes(`href="${sibling.path}" lang="${sibling.language}"`), route.path);
    }
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title && !metadata.has(title), `Duplicate or absent title: ${route.path}`);
    metadata.add(title);

    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const webPage = data["@graph"].find((item) => item["@type"] === "WebPage");
    const service = data["@graph"].find((item) => item["@type"] === "Service");
    assert.equal(webPage.inLanguage, route.language, route.path);
    assert.equal(webPage.url, route.canonical_url, route.path);
    assert.ok(service?.serviceType, route.path);

    if (route.language !== "es") {
      for (const [spanish, locales] of Object.entries(knowledge.serviceLocalizations.translations)) {
        if (
          source.includes(`>${escapeServiceText(spanish)}<`) ||
          source.includes(`="${escapeServiceText(spanish)}"`) ||
          source.includes(`"${spanish.replaceAll('"', '\\"')}"`)
        ) {
          assert.ok(html.includes(escapeServiceText(locales[route.language])) || html.includes(locales[route.language]), `Untranslated copy on ${route.path}: ${spanish}`);
        }
      }
      const body = html.slice(html.indexOf("<body"));
      const bodyWithoutSwitcher = body.replace(/<div class="language-switcher"[^>]*>[\s\S]*?<\/div>/, "");
      assert.ok(!bodyWithoutSwitcher.includes('href="/servicios/'), `Service link loses language: ${route.path}`);
      assert.ok(!bodyWithoutSwitcher.includes('href="/projects/'), `Project link loses language: ${route.path}`);
      assert.ok(bodyWithoutSwitcher.includes(`href="/${route.language}/#contacto"`), `Contact language: ${route.path}`);
      const home = await readFile(`site-next/${route.language}/index.html`, "utf8");
      assert.ok(!home.includes('href="/servicios/reformas-integrales-barcelona/"'), `Homepage service link loses language: ${route.language}`);
    }

    assert.ok(sitemap.includes(`<loc>${route.canonical_url}</loc>`), `Missing sitemap route: ${route.path}`);
  }
}

console.log(`Validated ${routes.length} service pages: translations, language navigation, metadata and homepage links.`);
