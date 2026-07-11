import { Service } from "../entities/service.mjs";

export class KnowledgeRepository {
  constructor({ site, services, externalApps }) {
    if (!site || typeof site !== "object" || Array.isArray(site)) {
      throw new Error("Expected site knowledge to be an object.");
    }

    this.site = Object.freeze({ ...site });
    this.services = Object.freeze(services.map((record) => Service.fromRecord(record, "content/tables/services.yaml")));
    this.externalApps = Object.freeze(externalApps.map((record) => Object.freeze({ ...record })));

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
}

export function createKnowledgeRepository(contentTables) {
  return new KnowledgeRepository(contentTables);
}
