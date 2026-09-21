// Exact source-string translations for generated service pages.
// Missing copy is an error so Spanish content never silently leaks into EN/RU.
export class ServiceLocalizations {
  constructor(record = { translations: {}, unchanged: [] }) {
    this.translations = structuredClone(record.translations);
    this.unchanged = new Set(record.unchanged);
    for (const [source, locales] of Object.entries(this.translations)) {
      for (const language of ["en", "ru"]) {
        if (!source.trim() || typeof locales[language] !== "string" || !locales[language].trim()) {
          throw new Error(`Missing service translation (${language}): ${source}`);
        }
      }
      Object.freeze(locales);
    }
    Object.freeze(this.translations);
    Object.freeze(this);
  }

  translate(text, language) {
    if (!["es", "en", "ru"].includes(language)) throw new Error(`Unsupported service language: ${language}`);
    if (language === "es" || !text.trim() || this.unchanged.has(text)) return text;
    if (/^© \\d{4} Vital Vibe Construction$/.test(text)) return text;
    const translated = this.translations[text]?.[language];
    if (!translated) throw new Error(`Missing service translation (${language}): ${text}`);
    return translated;
  }
}
