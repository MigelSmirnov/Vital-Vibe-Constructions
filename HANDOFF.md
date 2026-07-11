# HANDOFF

## Project Rule

Every working session ends with updates to:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This rule is more important than any README because it allows a human or AI to continue the work without reading the full project history.

## Current Session

Status: Media knowledge entity connected

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

## Next Session

1. Add `Project` knowledge entity and project content table.
2. Connect projects to Knowledge Repository.
3. Add project uniqueness validation for ids and slugs.
4. Add repository validation for project/media/service references.
5. Expand `site-next` projection from knowledge records.

## Do Not Do

- Do not edit `support.js`
- Do not bypass the Knowledge layer
- Do not duplicate content
- Do not add new functionality to the legacy site
