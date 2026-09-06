import assert from "node:assert/strict";
import test from "node:test";
import { Media } from "./media.mjs";
import { createKnowledgeRepository } from "../repository/knowledge-repository.mjs";

const validMediaRecord = Object.freeze({
  id: "media-test",
  slug: "media-test",
  src: "project/test.jpeg",
  alt: "Test project image",
  width: 1200,
  height: 800,
  project_id: "project-test",
  service_ids: ["integral-renovation"],
  before_after_state: "after",
  published_at: "2026-07-24",
});

test("Media preserves the stable project-media contract", () => {
  const media = Media.fromRecord(validMediaRecord);

  assert.deepEqual(media.toRecord(), validMediaRecord);
});

test("Media requires a controlled state for project-owned records", () => {
  assert.throws(
    () => Media.fromRecord({ ...validMediaRecord, before_after_state: undefined }),
    /Expected beforeAfterState for project-owned media/,
  );

  assert.throws(
    () => Media.fromRecord({ ...validMediaRecord, before_after_state: "finished" }),
    /Expected beforeAfterState to be one of: before, work, after, detail/,
  );
});

test("Media rejects duplicate service references", () => {
  assert.throws(
    () => Media.fromRecord({ ...validMediaRecord, service_ids: ["integral-renovation", "integral-renovation"] }),
    /Expected serviceIds to contain unique values/,
  );
});

test("Media validates publication dates", () => {
  assert.throws(
    () => Media.fromRecord({ ...validMediaRecord, published_at: "24/07/2026" }),
    /Expected publishedAt to be an ISO date or UTC timestamp/,
  );

  assert.equal(Media.fromRecord({ ...validMediaRecord, published_at: "2026-07-24T10:30:00Z" }).publishedAt, "2026-07-24T10:30:00Z");
});

test("repository rejects duplicate media source paths", () => {
  const tables = createTables();
  tables.media.push({
    ...validMediaRecord,
    id: "media-copy",
    slug: "media-copy",
  });

  assert.throws(() => createKnowledgeRepository(tables), /Duplicate media src "project\/test.jpeg"/);
});

test("repository rejects orphan media", () => {
  const tables = createTables();
  tables.media.push({
    id: "media-orphan",
    slug: "media-orphan",
    src: "misc/orphan.jpeg",
    alt: "Orphan image",
    width: 800,
    height: 600,
  });

  assert.throws(
    () => createKnowledgeRepository(tables),
    /Orphan media "media-orphan"; expected project_id, service_ids, or an explicit project\/capability reference/,
  );
});

test("repository rejects project-owned media missing from project image_ids", () => {
  const tables = createTables();
  tables.media.push({
    ...validMediaRecord,
    id: "media-unlisted",
    slug: "media-unlisted",
    src: "project/unlisted.jpeg",
  });

  assert.throws(
    () => createKnowledgeRepository(tables),
    /Project-media mismatch for media "media-unlisted"; expected project "project-test" image_ids to include it/,
  );
});

test("repository rejects project references to media owned by another project", () => {
  const tables = createTables();
  tables.projects.push({
    id: "project-other",
    slug: "project-other",
    title: "Other project",
    summary: "Another project fixture.",
    image_ids: ["media-test"],
    service_ids: ["integral-renovation"],
  });

  assert.throws(
    () => createKnowledgeRepository(tables),
    /Project-media mismatch for project "project-other" and media "media-test"; expected media.project_id to equal "project-other"/,
  );
});

test("repository preserves author-defined project media order", () => {
  const tables = createTables();
  const secondMedia = {
    ...validMediaRecord,
    id: "media-before",
    slug: "media-before",
    src: "project/before.jpeg",
    before_after_state: "before",
  };
  tables.media.push(secondMedia);
  tables.projects[0].image_ids = [secondMedia.id, validMediaRecord.id];

  const repository = createKnowledgeRepository(tables);

  assert.deepEqual(repository.findProjectById("project-test").imageIds, ["media-before", "media-test"]);
});

function createTables() {
  return structuredClone({
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
    capabilitySections: [],
    services: [
      {
        id: "integral-renovation",
        slug: "reformas-integrales",
        title: "Reformas integrales",
        summary: "Complete renovation work.",
      },
    ],
    renovationTiers: [],
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
    externalApps: [],
    media: [validMediaRecord],
  });
}
