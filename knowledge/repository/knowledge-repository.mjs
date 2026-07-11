import { assertUniqueEntityKeys, assertUniqueField } from "../core/collection-invariants.mjs";
import { ExternalApp } from "../entities/external-app.mjs";
import { Media } from "../entities/media.mjs";
import { Service } from "../entities/service.mjs";
import { Site } from "../entities/site.mjs";

export class KnowledgeRepository {
  constructor({ site, services, externalApps, media }) {
    this.site = Site.fromRecord(site, "content/tables/site.yaml#site");
    this.services = Object.freeze(
      services.map((record, index) => Service.fromRecord(record, `content/tables/services.yaml#services[${index}]`)),
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
    assertUniqueField(this.externalApps, "id", "externalApps");
    assertUniqueEntityKeys(this.media, "media");
    assertUniqueField(this.media, "src", "media");

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
