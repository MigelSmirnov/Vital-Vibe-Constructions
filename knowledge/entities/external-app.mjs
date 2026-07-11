import { EntityCore, assertNonEmptyString, compactRecord } from "../core/entity-core.mjs";

export class ExternalApp extends EntityCore {
  constructor({ id, url, status, label, title, summary, source = null }) {
    assertNonEmptyString(title, "title");
    assertNonEmptyString(summary, "summary");
    super({ id, title, summary, source });

    assertNonEmptyString(url, "url");
    assertNonEmptyString(status, "status");
    assertNonEmptyString(label, "label");

    this.url = url;
    this.status = status;
    this.label = label;

    Object.freeze(this);
  }

  static fromRecord(record, source = null) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new Error("Expected external app record to be an object.");
    }

    return new ExternalApp({
      id: record.id,
      url: record.url,
      status: record.status,
      label: record.label,
      title: record.title,
      summary: record.summary,
      source,
    });
  }

  toRecord() {
    return compactRecord({
      ...super.toRecord(),
      url: this.url,
      status: this.status,
      label: this.label,
    });
  }
}
