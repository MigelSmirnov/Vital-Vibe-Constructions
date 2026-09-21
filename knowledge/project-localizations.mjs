// Exact source-string translations, shared by generated project pages and their metadata.
// Missing copy is an error: a new Spanish paragraph must never silently leak into EN/RU.
export class ProjectLocalizations {
  constructor(record = { translations: {}, unchanged: [] }) {
    this.translations = structuredClone(record.translations);
    this.unchanged = new Set(record.unchanged);
    for (const [source, locales] of Object.entries(this.translations)) {
      for (const language of ['en', 'ru']) {
        if (!source.trim() || typeof locales[language] !== 'string' || !locales[language].trim()) {
          throw new Error(`Missing project translation (${language}): ${source}`);
        }
      }
      Object.freeze(locales);
    }
    Object.freeze(this.translations);
    Object.freeze(this);
  }

  translate(text, language) {
    if (!['es', 'en', 'ru'].includes(language)) throw new Error(`Unsupported project language: ${language}`);
    if (language === 'es' || !text.trim() || this.unchanged.has(text)) return text;
    // Copyright year is generated, while the brand is intentionally untranslated.
    if (/^© \d{4} Vital Vibe Construction$/.test(text)) return text;
    const translated = this.translations[text]?.[language];
    if (!translated) throw new Error(`Missing project translation (${language}): ${text}`);
    return translated;
  }
}
