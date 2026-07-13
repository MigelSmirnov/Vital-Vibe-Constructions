# HANDOFF

Version: 8
Updated: 2026-07-13T22:05:48Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

The approved project page generation stage is complete.

Delivery state:

- branch: `agent/architecture-sandbox`
- pull request: `#1 Build architecture sandbox and knowledge foundation`
- pull request state: ready for review

Latest completed work:

- `site-next/projects/index.html` and three project detail pages are generated from Knowledge Repository records
- `tools/site-next/validate-project-pages.mjs` enforces metadata, semantic HTML, media, service, and reciprocal-link invariants
- `architecture/project-routes.yaml` marks the four generated routes as sitemap eligible
- `sitemap.xml` contains exactly the homepage and the four eligible project routes
- `llms.txt` exposes canonical links for all current projects
- desktop and mobile browser verification passed; every referenced project image returned HTTP 200

Important detail artifacts:

- `artifacts/project-route-audit/report.md`
- `artifacts/site-next-gap-audit/report.md`
- `artifacts/content-audit/legacy-content-report.md`

## Current Strategy

- Preserve the legacy website.
- Build `site-next` in parallel.
- Treat legacy runtime (`support.js` + `x-dc`) as read-only.
- Treat Knowledge Repository records as the source of truth.
- Treat HTML, `llms.txt`, and `sitemap.xml` as generated projections of validated knowledge records.
- Generate only route instances approved by the project route contract.
- Keep redirect decisions separate from canonical route ownership.

## Stage Completed

The completed generation stage activated two route families:

- `/projects/`: generated and sitemap eligible
- `/projects/{project-slug}/`: three routes generated and sitemap eligible
- `/gallery/`: blocked on media migration or an explicit curated-gallery decision
- `/projects/{project-slug}/images/{media-slug}/`: deferred

Generated page guarantees:

- unique title, description, canonical URL, and exactly one H1 per page
- index-to-detail and detail-to-index links are reciprocal
- project facts, services, and media resolve through Knowledge Repository records
- image paths, alt text, width, and height match current Media records
- output paths match the route contract
- blocked and deferred route families remain absent from generated output and the sitemap

The legacy homepage runtime remains unchanged. Project cards on the generated `site-next` homepage now link to the corresponding generated detail pages.

## Non-Negotiable Constraints

- Do not edit `support.js`.
- Do not evolve the legacy runtime.
- Do not bypass the Knowledge Repository.
- Do not duplicate content between builders and tables.
- Do not add dependencies unless the current platform cannot reasonably solve the problem.
- Keep `content/tables/*.yaml` JSON-compatible until YAML-specific authoring is required.
- Do not create `Article` or `Testimonial` records without real source records.
- Do not generate `/gallery/` while its contract status is blocked.
- Do not generate image-detail routes while their family status is deferred.
- Do not add a route to `sitemap.xml` before its raw HTML exists and passes validation.

## Current Checks

Run:

```bash
node tools/checks/run.mjs
```

Expected result:

- 13 Knowledge tests pass.
- project page build and raw HTML validation pass.
- project route contract validation passes.
- `llms.txt` build and validation pass.
- `site-next` build passes.
- sitemap build and validation pass with five URLs.
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

Resolve gallery readiness without generating `/gallery/` prematurely.

### Step 1: Coverage Decision

- choose and document complete legacy coverage or an explicitly curated gallery
- define the minimum Media metadata required for inclusion
- decide whether the unmodeled studio renovation becomes a Project or remains excluded

### Step 2: Media Inventory

- reconcile the 39 legacy content images against current Media records
- classify the 25 unmodeled images by project, capability, duplicate, or excluded status
- capture provenance, truthful alt text, dimensions, and ownership for accepted media

### Step 3: Contract Gate

- update Knowledge records and validation before changing the gallery route status
- keep `/gallery/` blocked until the selected coverage rule passes
- continue deferring image-detail routes until stable media slugs and metadata exist

### Step 4: Verification And Handoff

- run the full suite after every accepted migration batch
- regenerate projections only through their builders
- update `HANDOFF.md` and `architecture/session-state.yaml`

Suggested next-stage commit message:

```text
Define gallery media coverage
```

## Later Work

1. Generate `/gallery/` only after its coverage gate passes.
2. Add canonical image-detail pages only after required Media metadata exists.
3. Homepage value propositions from existing legacy source content.
4. Process steps from existing legacy source content.
5. Articles and testimonials only after real source records are available.
