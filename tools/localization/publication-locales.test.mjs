import test from "node:test";
import assert from "node:assert/strict";
import { assertPublishedArticleLocales, parseSupportedLanguages } from "./publication-locales.mjs";

test("publication locale gate reads supported languages from architecture constants", () => {
  const constants = `site:
  supported_languages:
    - es
    - en
    - ru
  currency: EUR
`;
  assert.deepEqual(parseSupportedLanguages(constants), ["es", "en", "ru"]);
});

test("published articles require every supported language", () => {
  const supported = ["es", "en", "ru"];
  assert.doesNotThrow(() =>
    assertPublishedArticleLocales([{ id: "article-complete", languages: ["es", "en", "ru"] }], supported),
  );
  assert.throws(
    () => assertPublishedArticleLocales([{ id: "article-missing-ru", languages: ["es", "en"] }], supported),
    /article-missing-ru.*missing: ru/,
  );
});
