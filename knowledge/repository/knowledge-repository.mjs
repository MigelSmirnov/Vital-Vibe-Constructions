import { assertUniqueEntityKeys, assertUniqueField } from "../core/collection-invariants.mjs";
import { ExternalApp } from "../entities/external-app.mjs";
import { Media } from "../entities/media.mjs";
import { Project } from "../entities/project.mjs";
import { Service } from "../entities/service.mjs";
import { Site } from "../entities/site.mjs";

export class KnowledgeRepository {
  constructor({ site, services, projects, externalApps, media }) {
    this.site = Site.fromRecord(site, "content/tables/site.yaml#site");
    this.services = Object.freeze(
      services.map((record, index) => Service.fromRecord(record, `content/tables/services.yaml#services[${index}]`)),
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

    assertUniqueEntityKeys(this.services, "services");
    assertUniqueEntityKeys(this.projects, "projects");
    assertUniqueField(this.externalApps, "id", "externalApps");
    assertUniqueEntityKeys(this.media, "media");
    assertUniqueField(this.media, "src", "media");
    assertKnownReferences({
      services: this.services,
      projects: this.projects,
      media: this.media,
    });

    Object.freeze(this);
  }

  getSite() {
    return this.site;
  }

  listServices() {
    return this.services;
  }

  findServiceById(id) {
    return this.services.find((service) => service.id === id) ?? null;
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

function assertKnownReferences({ services, projects, media }) {
  const serviceIds = new Set(services.map((service) => service.id));
  const projectIds = new Set(projects.map((project) => project.id));
  const mediaIds = new Set(media.map((item) => item.id));

  for (const project of projects) {
    assertAllKnown(project.imageIds, mediaIds, `projects "${project.id}" image_ids`, "media");
    assertAllKnown(project.serviceIds, serviceIds, `projects "${project.id}" service_ids`, "services");
  }

  for (const item of media) {
    if (item.projectId !== null) {
      assertKnown(item.projectId, projectIds, `media "${item.id}" project_id`, "projects");
    }

    assertAllKnown(item.serviceIds, serviceIds, `media "${item.id}" service_ids`, "services");
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
