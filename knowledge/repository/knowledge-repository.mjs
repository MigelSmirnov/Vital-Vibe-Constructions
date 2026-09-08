import { assertUniqueEntityKeys, assertUniqueField } from "../core/collection-invariants.mjs";
import { CapabilitySection } from "../entities/capability-section.mjs";
import { ContactDetails } from "../entities/contact-details.mjs";
import { ExternalApp } from "../entities/external-app.mjs";
import { Media } from "../entities/media.mjs";
import { Project } from "../entities/project.mjs";
import { RenovationTier } from "../entities/renovation-tier.mjs";
import { Service } from "../entities/service.mjs";
import { Site } from "../entities/site.mjs";

export class KnowledgeRepository {
  constructor({ site, capabilitySections, contactDetails, services, renovationTiers, projects, externalApps, media }) {
    this.site = Site.fromRecord(site, "content/tables/site.yaml#site");
    this.capabilitySections = Object.freeze(
      capabilitySections.map((record, index) =>
        CapabilitySection.fromRecord(
          record,
          `content/tables/capability-sections.yaml#capabilitySections[${index}]`,
        ),
      ),
    );
    this.contactDetails = ContactDetails.fromRecord(contactDetails, "content/tables/contact-details.yaml#contactDetails");
    this.services = Object.freeze(
      services.map((record, index) => Service.fromRecord(record, `content/tables/services.yaml#services[${index}]`)),
    );
    this.renovationTiers = Object.freeze(
      renovationTiers.map((record, index) =>
        RenovationTier.fromRecord(record, `content/tables/renovation-tiers.yaml#renovationTiers[${index}]`),
      ),
    );
    this.projects = Object.freeze(
      projects.map((record, index) => Project.fromRecord(record, `content/tables/projects.yaml#projects[${index}]`)),
    );
    this.externalApps = Object.freeze(
      externalApps.map((record, index) =>
        ExternalApp.fromRecord(record, `content/tables/external-apps.yaml#externalApps[${index}]`),
      ),
    );
    this.media = Object.freeze(
      media.map((record, index) => Media.fromRecord(record, `content/tables/media.yaml#media[${index}]`)),
    );

    assertUniqueEntityKeys(this.capabilitySections, "capabilitySections");
    assertUniqueEntityKeys(this.services, "services");
    assertUniqueEntityKeys(this.renovationTiers, "renovationTiers");
    assertUniqueEntityKeys(this.projects, "projects");
    assertUniqueField(this.externalApps, "id", "externalApps");
    assertUniqueEntityKeys(this.media, "media");
    assertUniqueField(this.media, "src", "media");
    assertKnownReferences({
      services: this.services,
      projects: this.projects,
      capabilitySections: this.capabilitySections,
      externalApps: this.externalApps,
      media: this.media,
    });
    if (this.site.featuredMediaId !== null) {
      assertKnown(this.site.featuredMediaId, new Set(this.media.map(item => item.id)), "site.featuredMediaId", "media");
    }
    assertMediaOwnership({
      projects: this.projects,
      capabilitySections: this.capabilitySections,
      media: this.media,
    });
    assertProjectMediaConsistency({ projects: this.projects, media: this.media });

    Object.freeze(this);
  }

  getSite() {
    return this.site;
  }

  getContactDetails() {
    return this.contactDetails;
  }

  listCapabilitySections() {
    return this.capabilitySections;
  }

  findCapabilitySectionById(id) {
    return this.capabilitySections.find((section) => section.id === id) ?? null;
  }

  listServices() {
    return this.services;
  }

  findServiceById(id) {
    return this.services.find((service) => service.id === id) ?? null;
  }

  listRenovationTiers() {
    return this.renovationTiers;
  }

  findRenovationTierById(id) {
    return this.renovationTiers.find((tier) => tier.id === id) ?? null;
  }

  listProjects() {
    return this.projects;
  }

  findProjectById(id) {
    return this.projects.find((project) => project.id === id) ?? null;
  }

  listExternalApps() {
    return this.externalApps;
  }

  findExternalAppById(id) {
    return this.externalApps.find((app) => app.id === id) ?? null;
  }

  listMedia() {
    return this.media;
  }

  findMediaById(id) {
    return this.media.find((media) => media.id === id) ?? null;
  }

  findMediaBySrc(src) {
    return this.media.find((media) => media.src === src) ?? null;
  }
}

export function createKnowledgeRepository(contentTables) {
  return new KnowledgeRepository(contentTables);
}

function assertKnownReferences({ services, projects, capabilitySections, externalApps, media }) {
  const serviceIds = new Set(services.map((service) => service.id));
  const projectIds = new Set(projects.map((project) => project.id));
  const externalAppIds = new Set(externalApps.map((app) => app.id));
  const mediaIds = new Set(media.map((item) => item.id));

  for (const section of capabilitySections) {
    assertAllKnown(section.serviceIds, serviceIds, `capabilitySections "${section.id}" service_ids`, "services");
    assertAllKnown(section.mediaIds, mediaIds, `capabilitySections "${section.id}" media_ids`, "media");
    assertKnown(
      section.relatedExternalAppId,
      externalAppIds,
      `capabilitySections "${section.id}" related_external_app_id`,
      "externalApps",
    );
  }

  for (const project of projects) {
    assertAllKnown(project.imageIds, mediaIds, `projects "${project.id}" image_ids`, "media");
    assertAllKnown(project.serviceIds, serviceIds, `projects "${project.id}" service_ids`, "services");
  }

  for (const service of services) {
    assertAllKnown(
      service.includedServiceIds,
      serviceIds,
      `services "${service.id}" included_service_ids`,
      "services",
    );
  }

  for (const item of media) {
    if (item.projectId !== null) {
      assertKnown(item.projectId, projectIds, `media "${item.id}" project_id`, "projects");
    }

    assertAllKnown(item.serviceIds, serviceIds, `media "${item.id}" service_ids`, "services");
  }
}

function assertMediaOwnership({ projects, capabilitySections, media }) {
  const referencedMediaIds = new Set([
    ...projects.flatMap((project) => project.imageIds),
    ...capabilitySections.flatMap((section) => section.mediaIds),
  ]);

  for (const item of media) {
    const hasOwner = item.projectId !== null || item.serviceIds.length > 0 || referencedMediaIds.has(item.id);
    if (!hasOwner) {
      throw new Error(
        `Orphan media "${item.id}"; expected project_id, service_ids, or an explicit project/capability reference.`,
      );
    }
  }
}

function assertProjectMediaConsistency({ projects, media }) {
  const mediaById = new Map(media.map((item) => [item.id, item]));
  const projectImageIds = new Map(projects.map((project) => [project.id, new Set(project.imageIds)]));

  for (const project of projects) {
    for (const mediaId of project.imageIds) {
      const item = mediaById.get(mediaId);
      if (item.projectId !== project.id) {
        throw new Error(
          `Project-media mismatch for project "${project.id}" and media "${mediaId}"; expected media.project_id to equal "${project.id}".`,
        );
      }
    }
  }

  for (const item of media) {
    if (item.projectId === null) continue;

    const imageIds = projectImageIds.get(item.projectId);
    if (!imageIds.has(item.id)) {
      throw new Error(
        `Project-media mismatch for media "${item.id}"; expected project "${item.projectId}" image_ids to include it.`,
      );
    }
  }
}

function assertAllKnown(values, knownValues, fieldDescription, targetCollection) {
  for (const value of values) {
    assertKnown(value, knownValues, fieldDescription, targetCollection);
  }
}

function assertKnown(value, knownValues, fieldDescription, targetCollection) {
  if (!knownValues.has(value)) {
    throw new Error(`Unknown ${fieldDescription} reference "${value}"; expected a matching ${targetCollection} record.`);
  }
}
