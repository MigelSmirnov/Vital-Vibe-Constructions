import assert from "node:assert/strict";
import test from "node:test";
import { Service } from "./service.mjs";

const pageRecord = {
  id: "integral-renovation",
  slug: "reformas-integrales",
  title: "Reformas integrales",
  summary: "Coordinación completa de la reforma.",
  seo_title: "Reformas integrales en Barcelona | Test",
  meta_description: "Descripción única de la página de reformas integrales.",
  page_h1: "Reformas integrales en Barcelona",
  introduction: "Introducción visible de la página.",
  body: "Descripción del alcance coordinado.",
  included_service_ids: ["masonry", "electrical"],
  process_steps: [
    { title: "Contacto inicial", description: "Recogemos la información disponible." },
  ],
  faq: [
    { question: "Pregunta 1", answer: "Respuesta 1" },
    { question: "Pregunta 2", answer: "Respuesta 2" },
    { question: "Pregunta 3", answer: "Respuesta 3" },
    { question: "Pregunta 4", answer: "Respuesta 4" },
  ],
};

test("Service preserves complete page-owned content", () => {
  const service = Service.fromRecord(pageRecord);

  assert.deepEqual(service.toRecord(), pageRecord);
  assert.equal(service.processSteps[0].title, "Contacto inicial");
  assert.equal(service.faq.length, 4);
});

test("Service rejects incomplete page content", () => {
  assert.throws(
    () => Service.fromRecord({ ...pageRecord, meta_description: undefined }),
    /Expected metaDescription to be a non-empty string/,
  );

  assert.throws(
    () => Service.fromRecord({ ...pageRecord, faq: pageRecord.faq.slice(0, 3) }),
    /Expected faq to contain between 4 and 6 items/,
  );
});

test("Service rejects duplicate included service references", () => {
  assert.throws(
    () =>
      Service.fromRecord({
        ...pageRecord,
        included_service_ids: ["masonry", "masonry"],
      }),
    /Expected includedServiceIds to contain unique values/,
  );
});

test("Service preserves standalone body content without requiring a public page", () => {
  const service = Service.fromRecord({
    id: "painting",
    slug: "pintura",
    title: "Pintura",
    summary: "Preparación de superficies y acabados.",
    body: "Contenido editorial adicional de la entidad.",
  });

  assert.equal(service.body, "Contenido editorial adicional de la entidad.");
  assert.equal(service.seoTitle, null);
});
