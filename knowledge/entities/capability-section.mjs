import { EntityCore, assertNonEmptyString } from "../core/entity-core.mjs";

export class CapabilitySection extends EntityCore {
  constructor({
    id,
    slug,
    eyebrow,
    title,
    summary,
    capabilityTitle,
    capabilities,
    note,
    partnersSummary,
    serviceIds,
    mediaIds,
    relatedExternalAppId,
    source = null,
  }) {
    super({ id, slug, title, summary, source });

    assertNonEmptyString(eyebrow, "eyebrow");
    assertNonEmptyString(capabilityTitle, "capabilityTitle");
    assertNonEmptyString(note, "note");
    assertNonEmptyString(partnersSummary, "partnersSummary");
    assertNonEmptyString(relatedExternalAppId, "relatedExternalAppId");

    this.eyebrow = eyebrow;
    this.capabilityTitle = capabilityTitle;
    this.capabilities = Object.freeze(requireNonEmptyStringArray(capabilities, "capabilities"));
    this.note = note;
    this.partnersSummary = partnersSummary;
    this.serviceIds = Object.freeze(requireNonEmptyStringArray(serviceIds, "serviceIds"));
    this.mediaIds = Object.freeze(requireNonEmptyStringArray(mediaIds, "mediaIds"));
    this.relatedExternalAppId = relatedExternalAppId;

    Object.freeze(this);
  }

  static fromRecord(record, source = null) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new Error("Expected capability section record to be an object.");
    }

    return new CapabilitySection({
      id: record.id,
      slug: record.slug,
      eyebrow: record.eyebrow,
      title: record.title,
      summary: record.summary,
      capabilityTitle: record.capability_title,
      capabilities: record.capabilities,
      note: record.note,
      partnersSummary: record.partners_summary,
      serviceIds: record.service_ids,
      mediaIds: record.media_ids,
      relatedExternalAppId: record.related_external_app_id,
      source,
    });
  }

  toRecord() {
    return {
      ...super.toRecord(),
      eyebrow: this.eyebrow,
      capability_title: this.capabilityTitle,
      capabilities: [...this.capabilities],
      note: this.note,
      partners_summary: this.partnersSummary,
      service_ids: [...this.serviceIds],
      media_ids: [...this.mediaIds],
      related_external_app_id: this.relatedExternalAppId,
    };
  }
}

function requireNonEmptyStringArray(value, fieldName) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Expected ${fieldName} to be a non-empty array.`);
  }

  const normalized = value.map((item) => {
    assertNonEmptyString(item, fieldName);
    return item;
  });

  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`Expected ${fieldName} to contain unique values.`);
  }

  return normalized;
}
