import assert from "node:assert/strict";
import test from "node:test";
import { loadContentTables } from "../adapters/content-tables.mjs";
import { Project } from "../entities/project.mjs";
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
  services: [
    {
      id: "integral-renovation",
      slug: "reformas-integrales",
      title: "Reformas integrales",
      summary: "Complete renovation work.",
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

  assert.equal(repository.listProjects().length, 3);
  assert.equal(repository.findProjectById("project-reforma-integral-estandar-barcelona").slug, "reforma-integral-estandar-barcelona");
  assert.equal(repository.findMediaById("media-estandar-cocina-terminada").projectId, "project-reforma-integral-estandar-barcelona");
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
