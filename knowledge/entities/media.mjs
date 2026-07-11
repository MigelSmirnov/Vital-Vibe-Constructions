import { EntityCore, assertNonEmptyString, compactRecord } from "../core/entity-core.mjs";

export class Media extends EntityCore {
  constructor({
    id,
    slug,
    src,
    alt,
    width,
    height,
    caption = null,
    description = null,
    projectId = null,
    serviceIds = [],
    beforeAfterState = null,
    publishedAt = null,
    source = null,
  }) {
    super({ id, slug, source });

    assertNonEmptyString(src, "src");
    assertNonEmptyString(alt, "alt");
    assertPositiveInteger(width, "width");
    assertPositiveInteger(height, "height");
    if (caption !== null) assertNonEmptyString(caption, "caption");
    if (description !== null) assertNonEmptyString(description, "description");
    if (projectId !== null) assertNonEmptyString(projectId, "projectId");
    if (beforeAfterState !== null) assertNonEmptyString(beforeAfterState, "beforeAfterState");
    if (publishedAt !== null) assertNonEmptyString(publishedAt, "publishedAt");

    this.src = src;
    this.alt = alt;
    this.width = width;
    this.height = height;
    this.caption = caption;
    this.description = description;
    this.projectId = projectId;
    this.serviceIds = Object.freeze(serviceIds.map((serviceId) => normalizeId(serviceId, "serviceIds")));
    this.beforeAfterState = beforeAfterState;
    this.publishedAt = publishedAt;

    Object.freeze(this);
  }

  static fromRecord(record, source = null) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new Error("Expected media record to be an object.");
    }

    return new Media({
      id: record.id,
      slug: record.slug,
      src: record.src,
      alt: record.alt,
      width: record.width,
      height: record.height,
      caption: record.caption ?? null,
      description: record.description ?? null,
      projectId: record.project_id ?? null,
      serviceIds: record.service_ids ?? [],
      beforeAfterState: record.before_after_state ?? null,
      publishedAt: record.published_at ?? null,
      source,
    });
  }

  toRecord() {
    return compactRecord({
      ...super.toRecord(),
      src: this.src,
      alt: this.alt,
      width: this.width,
      height: this.height,
      caption: this.caption,
      description: this.description,
      project_id: this.projectId,
      service_ids: this.serviceIds.length ? [...this.serviceIds] : null,
      before_after_state: this.beforeAfterState,
      published_at: this.publishedAt,
    });
  }
}

export function assertPositiveInteger(value, fieldName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Expected ${fieldName} to be a positive integer.`);
  }
}

function normalizeId(value, fieldName) {
  assertNonEmptyString(value, fieldName);
  return value;
}
