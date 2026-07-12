# HANDOFF

Version: 3
Updated: 2026-07-12T11:10:20Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

The renovation-tier knowledge stage is complete.

Branch:

- `agent/architecture-sandbox`
- ahead of origin by 8 commits after this stage commit

Latest completed commit:

- this stage is committed as `Add renovation tier knowledge`

Important detail artifacts:

- `artifacts/site-next-gap-audit/report.md`
- `artifacts/content-audit/legacy-content-report.md`

## Current Strategy

- Preserve the legacy website.
- Build `site-next` in parallel.
- Treat legacy runtime (`support.js` + `x-dc`) as read-only.
- Treat Knowledge Repository records as the source of truth.
- Treat HTML as a projection of validated knowledge records.

## Stage Completed

The completed stage made renovation pricing tiers first-class knowledge records and projected them into `site-next`:

- `RenovationTier` entity
- `content/tables/renovation-tiers.yaml`
- Knowledge Repository API: `listRenovationTiers()` and `findRenovationTierById(id)`
- uniqueness validation for tier `id` and `slug`
- validation for required fields and positive integer `price_per_m2`
- repository tests for loading, ordering, uniqueness, price validation, and featured metadata
- `site-next` pricing/tier section from Knowledge Repository records
- generated HTML contains `Económica`, `Estándar`, `Premium`, `800`, `1200`, `1500`, and the pricing disclaimer

## Non-Negotiable Constraints

- Do not edit `support.js`.
- Do not evolve the legacy runtime.
- Do not bypass the Knowledge Repository.
- Do not duplicate content between builders and tables.
- Do not add dependencies unless the current platform cannot reasonably solve the problem.
- Keep `content/tables/*.yaml` JSON-compatible until YAML-specific authoring is required.
- Do not create `Article` or `Testimonial` records without real source records.
- Do not address remaining legacy structural warnings without browser/runtime verification.

## Current Checks

Run:

```bash
node tools/checks/run.mjs
```

Expected result:

- Knowledge tests pass.
- `site-next` build passes.
- content audit completes with `0 errors / 5 warnings`.
- `git diff --check` passes.

Known remaining legacy audit warnings:

- `heading-level-skip`
- `missing-main`
- `heavy-inline-styles`
- `runtime-dependent-root`
- `large-inline-script`

## Next Stage

Goal:

Generate `llms.txt` from the Knowledge Repository so AI-facing content stops drifting from content tables.

### Step 1: Builder

Add a builder that reads Knowledge Repository records and writes `llms.txt`.

Expected file:

- `tools/ai-discovery/build-llms.mjs`

The builder should include:

- company name
- canonical origin
- service area
- services from `Service`
- renovation tiers from `RenovationTier`
- projects from `Project`
- planner URL from `ExternalApp`
- public contact channels from `ContactDetails`

### Step 2: Checks

Add the builder to `tools/checks/run.mjs` before the content audit.

Expected behavior:

- running `node tools/checks/run.mjs` regenerates `llms.txt`
- generated `llms.txt` uses `https://app.vitalvibeconstruction.com/manual`
- generated `llms.txt` includes `Económica`, `Estándar`, `Premium`
- generated `llms.txt` includes public contact email

### Step 3: Tests Or Validation

Add focused validation without new dependencies.

Recommended options:

- add a small `tools/ai-discovery/validate-llms.mjs`
- or extend `tools/checks/run.mjs` with a direct content assertion command

Validate:

- no stale planner root URL appears as the primary planner URL
- all service titles appear
- all renovation tier titles and prices appear
- contact email appears

### Step 4: Handoff And Commit

Update:

- `HANDOFF.md`
- `architecture/session-state.yaml`

Suggested commit message:

```text
Generate llms from knowledge
```

## Later Work

1. Knowledge-backed `sitemap.xml` generation.
2. Smart home capability section from existing service/media records.
3. Project/gallery detail route planning.
