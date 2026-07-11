export class EntityCore {
  constructor({ id, slug = null, title = null, summary = null, source = null }) {
    assertNonEmptyString(id, "id");

    if (slug !== null) assertNonEmptyString(slug, "slug");
    if (title !== null) assertNonEmptyString(title, "title");
    if (summary !== null) assertNonEmptyString(summary, "summary");

    this.id = id;
    this.slug = slug;
    this.title = title;
    this.summary = summary;
    this.source = source;
  }

  toRecord() {
    return compactRecord({
      id: this.id,
      slug: this.slug,
      title: this.title,
      summary: this.summary,
    });
  }
}

export function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Expected ${fieldName} to be a non-empty string.`);
  }
}

export function compactRecord(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== null && value !== undefined));
}
