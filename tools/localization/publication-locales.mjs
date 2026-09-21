export function parseSupportedLanguages(constantsText) {
  const match = constantsText.match(/^\s*supported_languages:\s*\n((?:\s*-\s*[^\n]+\n?)+)/m);
  if (!match) throw new Error("architecture/constants.yaml must define site.supported_languages.");

  const languages = match[1]
    .split("\n")
    .map((line) => line.match(/^\s*-\s*([^#\s][^#]*?)\s*(?:#.*)?$/)?.[1]?.trim())
    .filter(Boolean);

  if (!languages.length) throw new Error("site.supported_languages must not be empty.");
  if (new Set(languages).size !== languages.length) {
    throw new Error("site.supported_languages must contain unique language codes.");
  }

  return languages;
}

export function assertPublishedArticleLocales(articles, supportedLanguages) {
  const expected = [...supportedLanguages].sort();

  for (const article of articles) {
    const actual = [...article.languages].sort();
    const missing = expected.filter((language) => !actual.includes(language));
    const unexpected = actual.filter((language) => !expected.includes(language));

    if (
      actual.length !== expected.length ||
      missing.length > 0 ||
      unexpected.length > 0
    ) {
      const details = [
        missing.length ? `missing: ${missing.join(", ")}` : null,
        unexpected.length ? `unexpected: ${unexpected.join(", ")}` : null,
      ].filter(Boolean).join("; ");

      throw new Error(
        `Published article "${article.id}" must include every supported language (${expected.join(", ")})${details ? `; ${details}` : ""}.`,
      );
    }
  }
}
