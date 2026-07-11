# HANDOFF

## Project Rule

Every working session ends with updates to:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This rule is more important than any README because it allows a human or AI to continue the work without reading the full project history.

## Current Session

Status: External app knowledge entity added

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

## Next Session

1. Decide whether to keep JSON-compatible tables or introduce a real YAML parser.
2. Add `Site` as a typed knowledge entity for global site and hero data.
3. Add `Project` and `Media` knowledge entities.
4. Add repository validation for cross-record references.
5. Expand `site-next` projection from knowledge records.

## Do Not Do

- Do not edit `support.js`
- Do not bypass the Knowledge layer
- Do not duplicate content
- Do not add new functionality to the legacy site
