# Project Evidence Standard

Status: active

Applies to: public project records and generated project-detail pages in `site-next`

Related work:

- `architecture/ai-discovery-backlog.md` — AI-011
- `architecture/content-model.yaml`
- `content/tables/projects.yaml`
- `tools/site-next/build-projects.mjs`

## Purpose

A project page must document a real construction case with facts that can be understood, verified, and cited. It must not become a generic renovation template that would remain unchanged if the company name were replaced.

The central question is:

> What makes this project impossible to confuse with hundreds of other renovation pages?

## Evidence priority

Use information in this order:

1. Verified project facts.
2. Visible conditions supported by project media.
3. Engineering problems and constraints.
4. Decisions made in response to those constraints.
5. Reasons behind budget and material choices.
6. The completed result.
7. Promotional interpretation only when it is directly supported by the evidence above.

Unknown facts must remain absent or explicitly unconfirmed. Do not infer dates, brands, dimensions, certifications, customer identities, private addresses, or technical properties from incomplete evidence.

## Recommended case-study structure

A complete case study should use the following sections when the underlying facts exist:

1. `Resumen`
2. `Estado inicial`
3. `Objetivo del cliente`
4. `Principales desafíos`
5. `Decisiones de ingeniería`
6. `Dónde se redujo el presupuesto`
7. `Dónde no se aceptó ningún compromiso`
8. `Coste aproximado`
9. `Resultado`
10. `Galería técnica`

Sections must be omitted when there is no verified content. Empty headings and invented filler are not allowed.

## Writing rules

Prefer concrete evidence over adjectives.

Do not rely on unsupported phrases such as:

- `alta calidad`
- `equipo profesional`
- `amplia experiencia`
- `soluciones modernas`
- `máxima calidad`
- `acabados impecables`
- `atención al detalle`

Replace them with a specific fact whenever possible.

Avoid:

> Instalación eléctrica de alta calidad.

Prefer:

> Cada toma de corriente dispone de una línea prevista en la distribución eléctrica, evitando conexiones en cadena cuando así se ejecutó en el proyecto.

The replacement must remain faithful to the source record and must not generalize one project's solution into a company-wide promise.

## Engineering decisions

Engineering sections should explain three things:

1. The condition or constraint.
2. The chosen solution.
3. Why that solution mattered in this project.

Useful categories include:

- electricity;
- water supply;
- drainage;
- ventilation;
- waterproofing;
- floor build-up and leveling;
- partitions and dry lining;
- phased execution;
- preparation for future systems.

Material or system names should be included only when verified.

## Budget treatment

A published amount must state whether it is exact or approximate.

When the total cannot be reconstructed precisely because the customer purchased part of the materials, the page must say so visibly.

An approximate project cost:

- describes the documented case only;
- is not a standard price;
- is not a quote for another property;
- must include the principal conditions that affected the amount.

Do not derive a price per square metre from one case unless the source record explicitly supports that use.

## Media as evidence

Important technical claims should be connected to relevant photographs when those photographs exist.

Preferred evidence subjects include:

- original condition;
- demolition and preparation;
- wall repair;
- floor build-up and leveling;
- waterproofing;
- electrical conduit installation;
- electrical panel;
- plumbing and drainage;
- work in progress;
- finished result.

A pending image may be recorded as `pending_technical_media`, but the generated page must not create a broken URL. Once uploaded, the subject should resolve to a real `Media` record with truthful alt text, dimensions, ownership, and project association.

A general gallery does not replace contextual evidence. When practical, technical sections should link to the photograph that supports the statement.

## Human project notes

A real comment from the project lead may be included when it:

- is truthful;
- relates directly to the project;
- adds context that formal facts do not capture;
- does not expose the customer or private address;
- is not rewritten into a promotional slogan.

Humour is acceptable when it reflects an authentic project memory and does not misrepresent the work.

## Privacy and safety

Do not publish:

- exact private residential addresses;
- customer names without explicit permission;
- access details, security layouts, alarm information, or keys;
- photographs containing private documents or identifying information;
- claims about structural safety that have not been professionally verified;
- confidential commercial records.

Use a district, municipality, or general location when that provides enough context.

## Acceptance criteria

A project case study meets this standard when:

- it contains facts beyond generic marketing copy;
- technical decisions are tied to real constraints;
- unknown information is not inferred;
- cost limitations are visible;
- private details remain protected;
- media descriptions do not overclaim what is visible;
- primary content is present in generated raw HTML;
- removing the company name would not turn the page into a reusable generic template;
- the Knowledge Repository remains the source of truth;
- generated outputs pass the repository checks.
