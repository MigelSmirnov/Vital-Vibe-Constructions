import test from 'node:test';
import assert from 'node:assert/strict';
import { ProjectLocalizations } from './project-localizations.mjs';
import { localizeProjectHtml } from '../tools/site-next/project-locales.mjs';

test('project translation gaps fail instead of silently falling back to Spanish', () => {
  assert.throws(() => new ProjectLocalizations({ translations: { Hola: { en: 'Hello' } }, unchanged: [] }), /Missing project translation/);
  const translations = new ProjectLocalizations({ translations: { Hola: { en: 'Hello', ru: 'Привет' } }, unchanged: [] });
  assert.throws(() => translations.translate('Nuevo párrafo', 'ru'), /Missing project translation/);
  assert.throws(() => translations.translate('Hola', 'fr'), /Unsupported/);
});

test('project localization escapes copy and preserves media URLs without cascading replacements', () => {
  const translations = new ProjectLocalizations({ translations: { Hola: { en: 'Hello & <welcome>', ru: 'Привет' } }, unchanged: [] });
  const routes = ['es','en','ru'].map(language => ({language, source_path:'/projects/test/',path:language==='es'?'/projects/test/':`/${language}/projects/test/`,canonical_url:`https://example.com${language==='es'?'':`/${language}`}/projects/test/`}));
  const html = localizeProjectHtml('<html lang="es"><head></head><body><nav></nav><h1>Hola</h1><img src="/Hola.jpg" alt="Hola"><a href="/projects/test/">Hola</a></body></html>', routes[1], routes, translations, 'https://example.com');
  assert.ok(html.includes('<h1>Hello &amp; &lt;welcome&gt;</h1>'));
  assert.ok(html.includes('src="/Hola.jpg"'));
  assert.ok(html.includes('href="/en/projects/test/"'));
  assert.ok(html.includes('hreflang="ru" href="https://example.com/ru/projects/test/"'));
});
