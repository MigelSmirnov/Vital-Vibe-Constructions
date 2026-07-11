import { EntityCore, assertNonEmptyString, compactRecord } from "../core/entity-core.mjs";

export class Service extends EntityCore {
  constructor({ id, slug, title, summary, body = null, image = null, source = null }) {
    super({ id, slug, title, summary, source });

    if (body !== null) assertNonEmptyString(body, "body");
    if (image !== null) assertNonEmptyString(image, "image");

    this.body = body;
    this.image = image;

    Object.freeze(this);
  }

  static fromRecord(record, source = null) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new Error("Expected service record to be an object.");
    }

    return new Service({
      id: record.id,
      slug: record.slug,
      title: record.title,
      summary: record.summary,
      body: record.body ?? null,
      image: record.image ?? null,
      source,
    });
  }

  toRecord() {
    return compactRecord({
      ...super.toRecord(),
      body: this.body,
      image: this.image,
    });
  }
}
