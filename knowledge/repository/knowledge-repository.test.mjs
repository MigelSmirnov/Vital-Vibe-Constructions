import assert from "node:assert/strict";
import test from "node:test";
import { loadContentTables } from "../adapters/content-tables.mjs";
import { ContactDetails } from "../entities/contact-details.mjs";
import { Project } from "../entities/project.mjs";
import { RenovationTier } from "../entities/renovation-tier.mjs";
import { createKnowledgeRepository } from "./knowledge-repository.mjs";

const baseTables = Object.freeze({
  site: {
    name: "Vital Vibe Construction",
    canonicalOrigin: "https://example.test",
    defaultLanguage: "es",
    title: "Test title",
    description: "Test description",
    serviceArea: "Barcelona",
    hero: {
      eyebrow: "Hero",
      title: "Hero title",
      summary: "Hero summary",
      image: "/hero.jpeg",
      imageAlt: "Hero image",
    },
    contact: {
      heading: "Contact",
      summary: "Contact summary",
    },
  },
  contactDetails: {
    id: "primary-contact",
    phone_display: "+34 600 00 00 00",
    phone_href: "tel:+34600000000",
    whatsapp_url: "https://wa.me/34600000000",
    email: "test@example.test",
    map_url: "https://maps.example.test",
    map_label: "View map",
  },
  services: [
    {
      id: "integral-renovation",
      slug: "reformas-integrales",
      title: "Reformas integrales",
      summary: "Complete renovation work.",
    },
  ],
  renovationTiers: [
    {
      id: "economical",
      slug: "economica",
      title: "Económica",
      summary: "Soluciones básicas y funcionales.",
      price_per_m2: 800,
      currency: "EUR",
    },
    {
      id: "standard",
      slug: "estandar",
      title: "Estándar",
      summary: "La mejor relación calidad-precio.",
      price_per_m2: 1200,
      currency: "EUR",
      is_featured: true,
      badge: "Más elegida",
    },
  ],
  projects: [
    {
      id: "project-test",
      slug: "project-test",
      title: "Project test",
      summary: "A project record used by repository tests.",
      image_ids: ["media-test"],
      service_ids: ["integral-renovation"],
      location: "Barcelona",
    },
  ],
  externalApps: [
    {
      id: "electrical-planner",
      url: "https://example.test/planner",
      status: "beta",
      label: "Planner",
      title: "Electrical planner",
      summary: "Planner test fixture.",
    },
  ],
  media: [
    {
      id: "media-test",
      slug: "media-test",
      src: "project/test.jpeg",
      alt: "Test project image",
      width: 1200,
      height: 800,
      project_id: "project-test",
      service_ids: ["integral-renovation"],
    },
  ],
});

test("loads current content tables into a repository with project records", async () => {
  const repository = createKnowledgeRepository(await loadContentTables());

  assert.equal(repository.getContactDetails().email, "info@vitalvibeconstruction.com");
  assert.equal(repository.listRenovationTiers().length, 3);
  assert.equal(repository.listRenovationTiers()[0].id, "economical");
  assert.equal(repository.findRenovationTierById("standard").pricePerM2, 1200);
  assert.equal(repository.listProjects().length, 3);
  assert.equal(repository.findProjectById("project-reforma-integral-estandar-barcelona").slug, "reforma-integral-estandar-barcelona");
  assert.equal(repository.findMediaById("media-estandar-cocina-terminada").projectId, "project-reforma-integral-estandar-barcelona");
});

test("RenovationTier requires valid pricing and preserves featured metadata", () => {
  assert.throws(
    () =>
      RenovationTier.fromRecord({
        id: "invalid-tier",
        slug: "invalid-tier",
        title: "Invalid tier",
        summary: "Invalid tier.",
        price_per_m2: 0,
        currency: "EUR",
      }),
    /Expected pricePerM2 to be a positive integer/,
  );

  assert.throws(
    () =>
      RenovationTier.fromRecord({
        id: "invalid-tier",
        slug: "invalid-tier",
        title: "Invalid tier",
        summary: "Invalid tier.",
        price_per_m2: 1200.5,
        currency: "EUR",
      }),
    /Expected pricePerM2 to be a positive integer/,
  );

  assert.throws(
    () =>
      RenovationTier.fromRecord({
        id: "invalid-tier",
        slug: "invalid-tier",
        title: "Invalid tier",
        summary: "Invalid tier.",
        price_per_m2: 1000,
        currency: "",
      }),
    /Expected currency to be a non-empty string/,
  );

  const tier = RenovationTier.fromRecord(baseTables.renovationTiers[1]);

  assert.deepEqual(tier.toRecord(), baseTables.renovationTiers[1]);
});

test("ContactDetails requires public contact channels", () => {
  assert.throws(
    () =>
      ContactDetails.fromRecord({
        id: "incomplete-contact",
        phone_display: "+34 600 00 00 00",
        phone_href: "tel:+34600000000",
        whatsapp_url: "https://wa.me/34600000000",
        map_url: "https://maps.example.test",
        map_label: "View map",
      }),
    /Expected email to be a non-empty string/,
  );

  const contactDetails = ContactDetails.fromRecord(baseTables.contactDetails);

  assert.equal(contactDetails.phoneHref, "tel:+34600000000");
  assert.equal(contactDetails.whatsappUrl, "https://wa.me/34600000000");
});

test("Project requires at least one image id and preserves optional references", () => {
  assert.throws(
    () =>
      Project.fromRecord({
        id: "project-without-images",
        slug: "project-without-images",
        title: "Project without images",
        summary: "Invalid project.",
        image_ids: [],
      }),
    /Expected imageIds to be a non-empty array/,
  );

  const project = Project.fromRecord({
    id: "project-minimal",
    slug: "project-minimal",
    title: "Minimal project",
    summary: "Valid minimal project.",
    image_ids: ["media-minimal"],
  });

  assert.deepEqual(project.serviceIds, []);
  assert.deepEqual(project.articleIds, []);
});

test("repository rejects duplicate project entity keys", () => {
  assert.throws(
    () =>
      createKnowledgeRepository(
        withOverrides({
          projects: [
            ...baseTables.projects,
            {
              ...baseTables.projects[0],
              id: "project-test-copy",
            },
          ],
        }),
      ),
    /Duplicate projects slug "project-test"/,
  );
});

test("repository rejects duplicate renovation tier entity keys", () => {
  assert.throws(
    () =>
      createKnowledgeRepository(
        withOverrides({
          renovationTiers: [
            ...baseTables.renovationTiers,
            {
              ...baseTables.renovationTiers[0],
              slug: "economica-copy",
            },
          ],
        }),
      ),
    /Duplicate renovationTiers id "economical"/,
  );

  assert.throws(
    () =>
      createKnowledgeRepository(
        withOverrides({
          renovationTiers: [
            ...baseTables.renovationTiers,
            {
              ...baseTables.renovationTiers[0],
              id: "economical-copy",
            },
          ],
        }),
      ),
    /Duplicate renovationTiers slug "economica"/,
  );
});

test("repository rejects project references to unknown media", () => {
  assert.throws(
    () =>
      createKnowledgeRepository(
        withOverrides({
          projects: [
            {
              ...baseTables.projects[0],
              image_ids: ["missing-media"],
            },
          ],
        }),
      ),
    /Unknown projects "project-test" image_ids reference "missing-media"/,
  );
});

test("repository rejects project references to unknown services", () => {
  assert.throws(
    () =>
      createKnowledgeRepository(
        withOverrides({
          projects: [
            {
              ...baseTables.projects[0],
              service_ids: ["missing-service"],
            },
          ],
        }),
      ),
    /Unknown projects "project-test" service_ids reference "missing-service"/,
  );
});

test("repository rejects media references to unknown projects", () => {
  assert.throws(
    () =>
      createKnowledgeRepository(
        withOverrides({
          media: [
            {
              ...baseTables.media[0],
              project_id: "missing-project",
            },
          ],
        }),
      ),
    /Unknown media "media-test" project_id reference "missing-project"/,
  );
});

function withOverrides(overrides) {
  return structuredClone({
    ...baseTables,
    ...overrides,
  });
}
