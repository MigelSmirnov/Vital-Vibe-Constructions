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
    projectType = null,
    execution = null,
    initialCondition = null,
    projectObjective = null,
    engineeringChallenges = [],
    engineeringDecisions = null,
    budgetStrategy = null,
    estimatedTotalCostEur = null,
    costNote = null,
    pendingTechnicalMedia = [],
    transformationSummary = null,
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
    if (projectType !== null) assertNonEmptyString(projectType, "projectType");
    if (projectObjective !== null) assertNonEmptyString(projectObjective, "projectObjective");
    if (estimatedTotalCostEur !== null) assertPositiveInteger(estimatedTotalCostEur, "estimatedTotalCostEur");
    if (costNote !== null) assertNonEmptyString(costNote, "costNote");
    if (transformationSummary !== null) assertNonEmptyString(transformationSummary, "transformationSummary");

    this.location = location;
    this.areaM2 = areaM2;
    this.duration = duration;
    this.budgetRange = budgetRange;
    this.projectType = projectType;
    this.execution = freezeOptionalRecord(execution, "execution");
    this.initialCondition = freezeOptionalRecord(initialCondition, "initialCondition");
    this.projectObjective = projectObjective;
    this.engineeringChallenges = Object.freeze(requireStringArray(engineeringChallenges, "engineeringChallenges"));
    this.engineeringDecisions = freezeOptionalRecord(engineeringDecisions, "engineeringDecisions");
    this.budgetStrategy = freezeOptionalRecord(budgetStrategy, "budgetStrategy");
    this.estimatedTotalCostEur = estimatedTotalCostEur;
    this.costNote = costNote;
    this.pendingTechnicalMedia = Object.freeze(requireRecordArray(pendingTechnicalMedia, "pendingTechnicalMedia"));
    this.transformationSummary = transformationSummary;

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
      projectType: record.project_type ?? null,
      execution: record.execution ?? null,
      initialCondition: record.initial_condition ?? null,
      projectObjective: record.project_objective ?? null,
      engineeringChallenges: record.engineering_challenges ?? [],
      engineeringDecisions: record.engineering_decisions ?? null,
      budgetStrategy: record.budget_strategy ?? null,
      estimatedTotalCostEur: record.estimated_total_cost_eur ?? null,
      costNote: record.cost_note ?? null,
      pendingTechnicalMedia: record.pending_technical_media ?? [],
      transformationSummary: record.transformation_summary ?? null,
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
      project_type: this.projectType,
      execution: cloneOptionalRecord(this.execution),
      initial_condition: cloneOptionalRecord(this.initialCondition),
      project_objective: this.projectObjective,
      engineering_challenges: this.engineeringChallenges.length ? [...this.engineeringChallenges] : null,
      engineering_decisions: cloneOptionalRecord(this.engineeringDecisions),
      budget_strategy: cloneOptionalRecord(this.budgetStrategy),
      estimated_total_cost_eur: this.estimatedTotalCostEur,
      cost_note: this.costNote,
      pending_technical_media: this.pendingTechnicalMedia.length
        ? this.pendingTechnicalMedia.map((item) => ({ ...item }))
        : null,
      transformation_summary: this.transformationSummary,
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

function requireStringArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${fieldName} to be an array.`);
  }

  return value.map((item) => {
    assertNonEmptyString(item, fieldName);
    return item;
  });
}

function requireRecordArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${fieldName} to be an array.`);
  }

  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Expected every ${fieldName} item to be an object.`);
    }

    return Object.freeze({ ...item });
  });
}

function freezeOptionalRecord(value, fieldName) {
  if (value === null) return null;

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected ${fieldName} to be an object or null.`);
  }

  return Object.freeze(structuredClone(value));
}

function cloneOptionalRecord(value) {
  return value === null ? null : structuredClone(value);
}

function assertPositiveInteger(value, fieldName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Expected ${fieldName} to be a positive integer.`);
  }
}
