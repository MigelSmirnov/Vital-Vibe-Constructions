import { EntityCore, assertNonEmptyString, compactRecord } from "../core/entity-core.mjs";

export class RenovationTier extends EntityCore {
  constructor({
    id,
    slug,
    title,
    summary,
    pricePerM2,
    currency,
    isFeatured = false,
    badge = null,
    disclaimer = null,
    source = null,
  }) {
    super({ id, slug, title, summary, source });

    assertPositiveInteger(pricePerM2, "pricePerM2");
    assertNonEmptyString(currency, "currency");
    if (typeof isFeatured !== "boolean") {
      throw new Error("Expected isFeatured to be a boolean.");
    }
    if (badge !== null) assertNonEmptyString(badge, "badge");
    if (disclaimer !== null) assertNonEmptyString(disclaimer, "disclaimer");

    this.pricePerM2 = pricePerM2;
    this.currency = currency;
    this.isFeatured = isFeatured;
    this.badge = badge;
    this.disclaimer = disclaimer;

    Object.freeze(this);
  }

  static fromRecord(record, source = null) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new Error("Expected renovation tier record to be an object.");
    }

    return new RenovationTier({
      id: record.id,
      slug: record.slug,
      title: record.title,
      summary: record.summary,
      pricePerM2: record.price_per_m2,
      currency: record.currency,
      isFeatured: record.is_featured ?? false,
      badge: record.badge ?? null,
      disclaimer: record.disclaimer ?? null,
      source,
    });
  }

  toRecord() {
    return compactRecord({
      ...super.toRecord(),
      price_per_m2: this.pricePerM2,
      currency: this.currency,
      is_featured: this.isFeatured ? true : null,
      badge: this.badge,
      disclaimer: this.disclaimer,
    });
  }
}

function assertPositiveInteger(value, fieldName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Expected ${fieldName} to be a positive integer.`);
  }
}
