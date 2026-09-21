import test from "node:test";
import assert from "node:assert/strict";
import { ServiceLocalizations } from "./service-localizations.mjs";
import { localizeServiceHtml } from "../tools/site-next/service-locales.mjs";

test("service translation gaps fail instead of silently falling back to Spanish", () => {
  assert.throws(() => new ServiceLocalizations({ translations: { Hola: { en: "Hello" } }, unchanged: [] }), /Missing service translation/);
  const translations = new ServiceLocalizations({ translations: { Hola: { en: "Hello", ru: "Привет" } }, unchanged: [] });
  assert.throws(() => translations.translate("Nuevo párrafo", "ru"), /Missing service translation/);
  assert.throws(() => translations.translate("Hola", "fr"), /Unsupported/);
});

test("service localization rewrites canonical, project links and JSON-LD language", () => {
  const translations = new ServiceLocalizations({
    translations: {
      Hola: { en: "Hello", ru: "Привет" },
      Inicio: { en: "Home", ru: "Главная" },
    },
    unchanged: ["Vital Vibe Construction"],
  });
  const routes = [
    { family_group: "service", language: "es", source_path: "/servicios/test/", path: "/servicios/test/", canonical_url: "https://example.com/servicios/test/" },
    { family_group: "service", language: "en", source_path: "/servicios/test/", path: "/en/servicios/test/", canonical_url: "https://example.com/en/servicios/test/" },
    { family_group: "service", language: "ru", source_path: "/servicios/test/", path: "/ru/servicios/test/", canonical_url: "https://example.com/ru/servicios/test/" },
    { family_group: "project", language: "es", source_path: "/projects/test/", path: "/projects/test/", canonical_url: "https://example.com/projects/test/" },
    { family_group: "project", language: "en", source_path: "/projects/test/", path: "/en/projects/test/", canonical_url: "https://example.com/en/projects/test/" },
    { family_group: "project", language: "ru", source_path: "/projects/test/", path: "/ru/projects/test/", canonical_url: "https://example.com/ru/projects/test/" },
  ];
  const source = `<html lang="es"><head><link rel="canonical" href="https://example.com/servicios/test/"><script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebPage","url":"https://example.com/servicios/test/","name":"Hola","inLanguage":"es"}]}</script></head><body><nav><a href="/">Inicio</a></nav><h1>Hola</h1><a href="/projects/test/">Hola</a></body></html>`;
  const html = localizeServiceHtml(source, routes[1], routes, translations, "https://example.com");
  assert.ok(html.includes('<html lang="en">'));
  assert.ok(html.includes('href="https://example.com/en/servicios/test/"'));
  assert.ok(html.includes('href="/en/projects/test/"'));
  assert.ok(html.includes(">Hello<"));
  const data = JSON.parse(html.match(/<script type="application\\/ld\\+json">([\\s\\S]*?)<\\/script>/)[1]);
  assert.equal(data["@graph"][0].inLanguage, "en");
  assert.equal(data["@graph"][0].url, "https://example.com/en/servicios/test/");
});
