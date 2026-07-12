import { EntityCore, assertNonEmptyString, compactRecord } from "../core/entity-core.mjs";

export class Project extends EntityCore {
  constructor({
    id,
    slug,
    title,
    summary,
    imageIds,
    serviceIds = [],
    articleIds = [],
    location = null,
    areaM2 = null,
    duration = null,
    budgetRange = null,
    source = null,
  }) {
    super({ id, slug, title, summary, source });

    this.imageIds = Object.freeze(requireNonEmptyIdArray(imageIds, "imageIds"));
    this.serviceIds = Object.freeze(requireIdArray(serviceIds, "serviceIds"));
    this.articleIds = Object.freeze(requireIdArray(articleIds, "articleIds"));

    if (location !== null) assertNonEmptyString(location, "location");
    if (areaM2 !== null) assertPositiveInteger(areaM2, "areaM2");
    if (duration !== null) assertNonEmptyString(duration, "duration");
    if (budgetRange !== null) assertNonEmptyString(budgetRange, "budgetRange");

    this.location = location;
    this.areaM2 = areaM2;
    this.duration = duration;
    this.budgetRange = budgetRange;

    Object.freeze(this);
  }

  static fromRecord(record, source = null) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new Error("Expected project record to be an object.");
    }

    return new Project({
      id: record.id,
      slug: record.slug,
      title: record.title,
      summary: record.summary,
      imageIds: record.image_ids,
      serviceIds: record.service_ids ?? [],
      articleIds: record.article_ids ?? [],
      location: record.location ?? null,
      areaM2: record.area_m2 ?? null,
      duration: record.duration ?? null,
      budgetRange: record.budget_range ?? null,
      source,
    });
  }

  toRecord() {
    return compactRecord({
      ...super.toRecord(),
      image_ids: [...this.imageIds],
      service_ids: this.serviceIds.length ? [...this.serviceIds] : null,
      article_ids: this.articleIds.length ? [...this.articleIds] : null,
      location: this.location,
      area_m2: this.areaM2,
      duration: this.duration,
      budget_range: this.budgetRange,
    });
  }
}

function requireNonEmptyIdArray(value, fieldName) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Expected ${fieldName} to be a non-empty array.`);
  }

  return requireIdArray(value, fieldName);
}

function requireIdArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${fieldName} to be an array.`);
  }

  return value.map((item) => {
    assertNonEmptyString(item, fieldName);
    return item;
  });
}

function assertPositiveInteger(value, fieldName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Expected ${fieldName} to be a positive integer.`);
  }
}
