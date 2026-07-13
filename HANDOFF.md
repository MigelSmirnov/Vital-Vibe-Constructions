# HANDOFF

Version: 6
Updated: 2026-07-13T19:31:15Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

The Knowledge-backed Smart Home capability stage is complete.

Delivery state:

- branch: `agent/architecture-sandbox`
- pull request: `#1 Build architecture sandbox and knowledge foundation`
- pull request state: ready for review

Latest completed work:

- Smart Home content is owned by an explicit `CapabilitySection` model
- service, media, and related external application references are validated by the Knowledge Repository
- `site-next` projects the section into raw semantic HTML without client-side rendering
- `llms.txt` includes the same Smart Home facts from the Knowledge Repository
- desktop and mobile rendering have been verified with all configured media returning HTTP 200

Important detail artifacts:

- `artifacts/site-next-gap-audit/report.md`
- `artifacts/content-audit/legacy-content-report.md`

## Current Strategy

- Preserve the legacy website.
- Build `site-next` in parallel.
- Treat legacy runtime (`support.js` + `x-dc`) as read-only.
- Treat Knowledge Repository records as the source of truth.
- Treat HTML, `llms.txt`, and `sitemap.xml` as generated projections of validated knowledge records.
- Add canonical routes only after defining an explicit route/page contract.

## Stage Completed

The completed stage added an explicit, reusable Smart Home capability boundary:

- `content/tables/capability-sections.yaml` owns visible copy and record references
- `knowledge/entities/capability-section.mjs` validates the record shape
- the Knowledge Repository validates `service_ids`, `media_ids`, and `related_external_app_id`
- `architecture/content-model.yaml` defines capability section fields and relations
- `tools/site-next/build.mjs` renders the section, media gallery, service context, and related planner CTA
- `tools/ai-discovery/build-llms.mjs` renders the same capability facts into `llms.txt`
- `tools/ai-discovery/validate-llms.mjs` detects missing Smart Home facts
- Knowledge Repository tests cover entity validation and unknown references

Browser verification completed with Playwright Chromium:

- `site-next`: 1440x900 and 390x844
- Smart Home lead and gallery media returned HTTP 200
- no horizontal overflow or incoherent layout overlap was observed
- legacy `index.html` and `support.js` were not changed

## Non-Negotiable Constraints

- Do not edit `support.js`.
- Do not evolve the legacy runtime.
- Do not bypass the Knowledge Repository.
- Do not duplicate content between builders and tables.
- Do not add dependencies unless the current platform cannot reasonably solve the problem.
- Keep `content/tables/*.yaml` JSON-compatible until YAML-specific authoring is required.
- Do not create `Article` or `Testimonial` records without real source records.
- Do not invent canonical pages or add routes to `sitemap.xml` before their HTML output exists.
- Do not address remaining legacy structural warnings without browser/runtime verification.

## Current Checks

Run:

```bash
node tools/checks/run.mjs
```

Expected result:

- 13 Knowledge tests pass.
- `llms.txt` build and validation pass.
- `site-next` build passes.
- sitemap build and validation pass.
- content audit completes with `0 errors / 5 warnings`.
- `git diff --check` passes.
- repeated generation does not change tracked output.

Known remaining legacy audit warnings:

- `heading-level-skip`
- `missing-main`
- `heavy-inline-styles`
- `runtime-dependent-root`
- `large-inline-script`

## Next Stage

Goal:

Define the project and gallery route-generation contract before adding new canonical HTML pages.

### Step 1: Source Inventory

- map legacy gallery files to existing `Project` and `Media` records
- identify which current records have enough truthful content for a detail page
- record legacy URLs as source material, not target canonical routes

### Step 2: Route Contract

Add a machine-readable architecture contract covering:

- `/projects/`
- `/projects/{project-slug}/`
- `/gallery/`
- deferred `/projects/{project-slug}/images/{image-slug}/` routes
- ownership of canonical URL generation and sitemap inclusion

Do not introduce a generic `Page` entity until the route contract demonstrates the required fields and consumers.

### Step 3: Validation Plan

- require every route record to resolve to existing Knowledge entities
- prevent duplicate paths and canonical URLs
- require generated HTML before sitemap inclusion
- define legacy redirect decisions separately from the canonical route model

### Step 4: Handoff And Commit

Update:

- `HANDOFF.md`
- `architecture/session-state.yaml`

Suggested commit message:

```text
Define project route generation
```

## Later Work

1. Generate project index/detail pages from the approved route contract.
2. Add canonical project pages to `sitemap.xml` only after generation exists.
3. Homepage value propositions from existing legacy source content.
4. Process steps from existing legacy source content.
5. Articles and testimonials only after real source records are available.
