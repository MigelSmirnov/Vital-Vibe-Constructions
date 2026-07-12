# HANDOFF

Version: 2
Updated: 2026-07-12T10:58:22Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

The current knowledge-foundation stage is complete.

Branch:

- `agent/architecture-sandbox`
- ahead of origin by 6 commits

Latest completed commit:

- `7b560c1 Document site-next gaps`

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

The completed stage established the Knowledge Repository foundation and connected the first real homepage content:

- site metadata, hero, and contact copy
- services
- media inventory
- projects
- external electrical planner
- public contact channels
- `site-next` projection for hero, services, projects, planner, and contact
- Organization JSON-LD with offers and contactPoint
- focused `node:test` checks for repository invariants
- `node tools/checks/run.mjs` as the current local check suite
- legacy head metadata cleanup, reducing content audit to `0 errors / 5 warnings`
- gap audit for the next `site-next` work

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

Make pricing and renovation tiers first-class knowledge records and project them into `site-next`, with tests.

Source records already exist in legacy content:

- `Económica`: `800 EUR/m2`, "Soluciones básicas y funcionales."
- `Estándar`: `1200 EUR/m2`, "La mejor relación calidad-precio.", featured / most chosen.
- `Premium`: `1500 EUR/m2`, "Materiales y acabados de alta gama."
- pricing disclaimer from calculator: estimates are approximate and not a binding offer.

### Step 1: Model

Add `RenovationTier` to the content model.

Recommended fields:

- required: `id`, `slug`, `title`, `summary`, `price_per_m2`, `currency`
- optional: `is_featured`, `badge`, `disclaimer`

Expected files:

- `knowledge/entities/renovation-tier.mjs`
- `content/tables/renovation-tiers.yaml`
- updates to `architecture/content-model.yaml`

### Step 2: Repository

Connect renovation tiers to the Knowledge Repository.

Expected repository API:

- `listRenovationTiers()`
- `findRenovationTierById(id)`

Required validation:

- unique `id`
- unique `slug`
- positive integer `price_per_m2`
- non-empty `currency`

Expected files:

- `knowledge/adapters/content-tables.mjs`
- `knowledge/repository/knowledge-repository.mjs`
- `knowledge/index.mjs`

### Step 3: Tests

Extend `knowledge/repository/knowledge-repository.test.mjs`.

Required test coverage:

- current content tables load with 3 renovation tiers
- repository exposes tiers in source order
- duplicate tier `id` or `slug` is rejected
- empty required fields are rejected
- non-positive or non-integer `price_per_m2` is rejected
- featured tier is preserved in `toRecord()`

### Step 4: Projection

Project renovation tiers into `site-next`.

Expected behavior:

- add a visible pricing/tier section after projects or before planner
- render three tiers from Knowledge Repository records
- visually mark the featured `Estándar` tier
- include the disclaimer near the tiers or planner
- do not hardcode tier prices in `tools/site-next/build.mjs`

Expected files:

- `tools/site-next/build.mjs`
- generated `site-next/index.html`
- generated `site-next/styles.css`

### Step 5: Verification

Run:

```bash
node tools/checks/run.mjs
```

Also verify generated HTML contains:

- `Económica`
- `Estándar`
- `Premium`
- `800`
- `1200`
- `1500`
- the pricing disclaimer

### Step 6: Handoff And Commit

Update:

- `HANDOFF.md`
- `architecture/session-state.yaml`

Commit as a separate reviewable commit, suggested message:

```text
Add renovation tier knowledge
```

## Next After Renovation Tiers

Likely follow-up work:

1. Knowledge-backed `llms.txt` generation.
2. Knowledge-backed `sitemap.xml` generation.
3. Smart home capability section from existing service/media records.
4. Project/gallery detail route planning.
