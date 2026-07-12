# HANDOFF

## Project Rule

Every working session ends with updates to:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This rule is more important than any README because it allows a human or AI to continue the work without reading the full project history.

## Current Session

Status: Contact details knowledge entity connected and projected in site-next

Branch:
agent/architecture-sandbox

## Current Strategy

- Legacy website is preserved.
- New implementation is developed in parallel.
- Legacy runtime (`support.js` + `x-dc`) is read-only.
- Knowledge is the primary model.
- HTML is a projection of the knowledge model.

## Completed

- Architecture contracts
- Content extractor
- Crawlability audit
- AI-native requirements
- Initial `site-next`
- Planner integration
- Engineering process
- `knowledge/` layer
- `EntityCore`
- `Service`
- `KnowledgeRepository`
- JSON-compatible content table adapter
- `site-next` build connected to Knowledge Repository
- repository uniqueness validation for service ids and slugs
- `ExternalApp` typed knowledge entity
- repository uniqueness validation for external app ids
- `Site` typed knowledge entity for metadata, hero, and contact data
- content table parser strategy decision
- `content/tables/media.yaml` with homepage-visible raster media
- repeatable media dimensions helper
- `Media` typed knowledge entity
- media table connected to Knowledge Repository
- media uniqueness validation for ids, slugs, and src values
- `Project` typed knowledge entity
- `content/tables/projects.yaml` with homepage-visible project records
- projects connected to Knowledge Repository
- project uniqueness validation for ids and slugs
- repository cross-reference validation for project/media/service references
- `site-next` project section projected from Knowledge Repository records
- focused `node:test` coverage for Project and Knowledge Repository invariants
- `tools/checks/run.mjs` check runner for knowledge tests, `site-next` build, content audit, and whitespace checks
- static `site-next` project projection review for metadata, landmarks, local assets, duplicate ids, image dimensions, and project card count
- project section summary and equal-height project card layout refinements
- legacy `index.html` head metadata added for title, description, canonical, Open Graph, Twitter card, and Organization JSON-LD
- legacy content audit reduced from 1 error / 7 warnings to 0 errors / 5 warnings
- `ContactDetails` typed knowledge entity
- `content/tables/contact-details.yaml` with public phone, WhatsApp, email, and map URL records
- contact details connected to Knowledge Repository
- focused `node:test` coverage for required contact channels
- `site-next` contact section projected from ContactDetails records
- `site-next` Organization JSON-LD includes contactPoint from ContactDetails

## Decisions

- Do not evolve the legacy runtime.
- Build the new implementation independently.
- YAML files are architecture contracts.
- Keep module APIs small.
- Use deep modules.
- Content is the single source of truth.
- Builders consume content through the Knowledge Repository.
- Current `content/tables/*.yaml` files are JSON-compatible and are parsed without adding dependencies.
- Knowledge collections must validate unique ids and slugs before powering projections.
- Planner data is a typed knowledge entity, not a plain content table object.
- Site metadata, hero, and contact content are typed knowledge records before projection.
- Keep `content/tables/*.yaml` JSON-compatible until YAML-specific authoring features are needed.
- If a real YAML parser is introduced, it belongs inside `knowledge/adapters/content-tables.mjs`.
- Homepage raster media records must include measured `width` and `height`.
- Brand SVG assets are not part of the project/media inventory unless they become content records.
- Media records are loaded through the Knowledge Repository before any projection consumes them.
- Project records are loaded through the Knowledge Repository before projections consume them.
- Project lead images are resolved through media knowledge records, not duplicated in the projection.
- Public contact channels are loaded through the Knowledge Repository before projections consume them.
- Use `node tools/checks/run.mjs` for the current full local check suite.
- The content audit currently completes with legacy findings: 0 errors and 5 warnings.
- Remaining legacy audit warnings are structural debt: heading-level skip, missing `<main>`, heavy inline styles, `x-dc` runtime root, and large inline script.
- Do not address remaining legacy structural warnings without a browser/runtime verification path.

## Next Session

1. Continue the next content-model entity only when source records are ready.
2. Add browser screenshot tooling only if visual/runtime checks become a recurring need.
3. Defer remaining legacy audit warnings unless the session explicitly targets legacy structural cleanup.

## Do Not Do

- Do not edit `support.js`
- Do not bypass the Knowledge layer
- Do not duplicate content
- Do not add new functionality to the legacy site
