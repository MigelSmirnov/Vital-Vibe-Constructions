import { assertNonEmptyString } from "../core/entity-core.mjs";

const localizedFields = ["slug", "title", "seo_title", "summary", "meta_description", "category", "body"];
const languages = new Set(["es", "en", "ru"]);

export class Article {
  constructor(record) {
    assertNonEmptyString(record.id, "article.id");
    if (record.status !== "published") throw new Error("Public articles must have published status.");
    if (!languages.has(record.language)) throw new Error("Unsupported article language.");
    assertNonEmptyString(record.author, "article.author");
    for (const field of ["published_at", "modified_at"]) {
      const value = record[field];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "") || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
        throw new Error(`Invalid article ${field}.`);
      }
    }
    if (record.modified_at < record.published_at) throw new Error("Article modification precedes publication.");
    validateLocalized(record);
    const translations = record.translations ?? {};
    for (const [language, translation] of Object.entries(translations)) {
      if (!languages.has(language) || language === record.language) throw new Error("Invalid article translation language.");
      validateLocalized(translation);
      const sourceIds = imageIds(record.body).sort();
      const translatedIds = imageIds(translation.body).sort();
      if (JSON.stringify(sourceIds) !== JSON.stringify(translatedIds)) throw new Error("Article translations must preserve the same media references.");
    }
    for (const field of ["related_service_ids", "related_project_ids"]) {
      const ids = record[field] ?? [];
      if (!Array.isArray(ids) || new Set(ids).size !== ids.length) throw new Error(`Invalid article ${field}.`);
      ids.forEach(id => assertNonEmptyString(id, field));
    }
    this.id = record.id;
    this.slug = record.slug;
    this.language = record.language;
    this.languages = Object.freeze([record.language, ...Object.keys(translations)]);
    this.relatedProjectIds = Object.freeze([...(record.related_project_ids ?? [])]);
    this.relatedServiceIds = Object.freeze([...(record.related_service_ids ?? [])]);
    this.mediaIds = Object.freeze(imageIds(record.body));
    this.record = freezeDeep(structuredClone(record));
    Object.freeze(this);
  }

  static fromRecord(record) { return new Article(record); }
  toRecord() { return structuredClone(this.record); }
  localized(language) {
    if (!this.languages.includes(language)) throw new Error(`Article ${this.id} has no ${language} translation.`);
    const record = this.toRecord();
    const content = language === this.language ? record : record.translations[language];
    return { ...Object.fromEntries(localizedFields.map(field => [field, content[field]])), language,
      author: record.author, published_at: record.published_at, modified_at: record.modified_at };
  }
}

function validateLocalized(record) {
  for (const field of localizedFields.filter(field => field !== "body")) assertNonEmptyString(record[field], `article.${field}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) throw new Error("Invalid article slug.");
  if (record.seo_title.length > 65 || record.meta_description.length > 170) throw new Error("Article metadata is too long.");
  if (!Array.isArray(record.body) || !record.body.length) throw new Error("Article body requires sections.");
  for (const section of record.body) {
    assertNonEmptyString(section.heading, "article section heading");
    if (!Array.isArray(section.blocks) || !section.blocks.length) throw new Error("Article section requires blocks.");
    for (const block of section.blocks) {
      if (block.type === "paragraph") assertNonEmptyString(block.text, "article paragraph");
      else if (block.type === "list") {
        if (!Array.isArray(block.items) || !block.items.length) throw new Error("Article list requires items.");
        block.items.forEach(item => assertNonEmptyString(item, "article list item"));
      } else if (block.type === "image") {
        for (const field of ["media_id", "alt", "caption"]) assertNonEmptyString(block[field], `article image ${field}`);
      } else throw new Error(`Unsupported article block: ${block.type}`);
    }
  }
  const ids = imageIds(record.body);
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate article media reference.");
}

function imageIds(body) { return body.flatMap(section => section.blocks.filter(block => block.type === "image").map(block => block.media_id)); }
function freezeDeep(value) {
  if (value && typeof value === "object") { Object.values(value).forEach(freezeDeep); Object.freeze(value); }
  return value;
}
