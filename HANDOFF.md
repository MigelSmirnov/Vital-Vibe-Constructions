# HANDOFF

Version: 4
Updated: 2026-07-12T12:31:07Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

The Knowledge-backed `llms.txt` stage is complete.

Branch:

- `agent/architecture-sandbox`
- ahead of origin by 9 commits after this stage commit

Latest completed commit:

- this stage is committed as `Generate llms from knowledge`

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

The completed stage made `llms.txt` a generated projection of Knowledge Repository records:

- `tools/ai-discovery/build-llms.mjs`
- `tools/ai-discovery/validate-llms.mjs`
- `tools/checks/run.mjs` now builds and validates `llms.txt`
- generated `llms.txt` includes site identity, service area, services, renovation tiers, projects, planner URL, and contact channels
- generated `llms.txt` uses `https://app.vitalvibeconstruction.com/manual`
- validation checks service titles, renovation tier titles/prices, project titles, contact email, and stale planner-root usage

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
- `llms.txt` build passes.
- `llms.txt` validation passes.
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

Generate `sitemap.xml` from explicit site/page knowledge so the sitemap stops listing utility files and external app URLs as main indexable pages.

### Step 1: Builder

Add a builder that writes `sitemap.xml`.

Expected file:

- `tools/seo/build-sitemap.mjs`

The initial sitemap should include:

- homepage only, because `site-next` currently generates only one canonical HTML page

It should exclude:

- `robots.txt`
- `llms.txt`
- external planner app URLs

### Step 2: Validation

Add validation without new dependencies.

Expected file:

- `tools/seo/validate-sitemap.mjs`

Validate:

- homepage URL exists
- utility files are not listed
- external planner URL is not listed
- every URL starts with `Site.canonicalOrigin`

### Step 3: Checks

Add sitemap build and validation to `tools/checks/run.mjs`.

### Step 4: Handoff And Commit

Update:

- `HANDOFF.md`
- `architecture/session-state.yaml`

Suggested commit message:

```text
Generate sitemap from knowledge
```

## Later Work

1. Smart home capability section from existing service/media records.
2. Project/gallery detail route planning.
