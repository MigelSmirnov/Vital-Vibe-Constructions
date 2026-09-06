import { EntityCore, assertNonEmptyString, compactRecord } from "../core/entity-core.mjs";

export class Service extends EntityCore {
  constructor({
    id,
    slug,
    title,
    summary,
    body = null,
    image = null,
    seoTitle = null,
    metaDescription = null,
    pageH1 = null,
    introduction = null,
    includedServiceIds = [],
    processSteps = [],
    faq = [],
    source = null,
  }) {
    super({ id, slug, title, summary, source });

    if (body !== null) assertNonEmptyString(body, "body");
    if (image !== null) assertNonEmptyString(image, "image");
    if (seoTitle !== null) assertNonEmptyString(seoTitle, "seoTitle");
    if (metaDescription !== null) assertNonEmptyString(metaDescription, "metaDescription");
    if (pageH1 !== null) assertNonEmptyString(pageH1, "pageH1");
    if (introduction !== null) assertNonEmptyString(introduction, "introduction");

    this.body = body;
    this.image = image;
    this.seoTitle = seoTitle;
    this.metaDescription = metaDescription;
    this.pageH1 = pageH1;
    this.introduction = introduction;
    this.includedServiceIds = Object.freeze(requireUniqueIdArray(includedServiceIds, "includedServiceIds"));
    this.processSteps = Object.freeze(requireContentItems(processSteps, "processSteps", ["title", "description"]));
    this.faq = Object.freeze(requireContentItems(faq, "faq", ["question", "answer"]));

    const hasPageContent = [
      seoTitle,
      metaDescription,
      pageH1,
      introduction,
      this.includedServiceIds.length ? this.includedServiceIds : null,
      this.processSteps.length ? this.processSteps : null,
      this.faq.length ? this.faq : null,
    ].some((value) => value !== null);

    if (hasPageContent) {
      for (const [fieldName, value] of [
        ["body", body],
        ["seoTitle", seoTitle],
        ["metaDescription", metaDescription],
        ["pageH1", pageH1],
        ["introduction", introduction],
      ]) {
        assertNonEmptyString(value, fieldName);
      }

      if (this.includedServiceIds.length === 0) {
        throw new Error("Expected includedServiceIds to be a non-empty array for service page content.");
      }
      if (this.processSteps.length === 0) {
        throw new Error("Expected processSteps to be a non-empty array for service page content.");
      }
      if (this.faq.length < 4 || this.faq.length > 6) {
        throw new Error("Expected faq to contain between 4 and 6 items for service page content.");
      }
    }

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
      seoTitle: record.seo_title ?? null,
      metaDescription: record.meta_description ?? null,
      pageH1: record.page_h1 ?? null,
      introduction: record.introduction ?? null,
      includedServiceIds: record.included_service_ids ?? [],
      processSteps: record.process_steps ?? [],
      faq: record.faq ?? [],
      source,
    });
  }

  toRecord() {
    return compactRecord({
      ...super.toRecord(),
      body: this.body,
      image: this.image,
      seo_title: this.seoTitle,
      meta_description: this.metaDescription,
      page_h1: this.pageH1,
      introduction: this.introduction,
      included_service_ids: this.includedServiceIds.length ? [...this.includedServiceIds] : null,
      process_steps: this.processSteps.length ? this.processSteps.map((item) => ({ ...item })) : null,
      faq: this.faq.length ? this.faq.map((item) => ({ ...item })) : null,
    });
  }
}

function requireUniqueIdArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${fieldName} to be an array.`);
  }

  const ids = value.map((item) => {
    assertNonEmptyString(item, fieldName);
    return item;
  });

  if (new Set(ids).size !== ids.length) {
    throw new Error(`Expected ${fieldName} to contain unique values.`);
  }

  return ids;
}

function requireContentItems(value, fieldName, requiredFields) {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${fieldName} to be an array.`);
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Expected ${fieldName}[${index}] to be an object.`);
    }

    const normalized = {};
    for (const requiredField of requiredFields) {
      assertNonEmptyString(item[requiredField], `${fieldName}[${index}].${requiredField}`);
      normalized[requiredField] = item[requiredField];
    }
    return Object.freeze(normalized);
  });
}
