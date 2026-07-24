# HANDOFF

Version: 9
Updated: 2026-07-24T00:00:00Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

The project page generation stage is complete. Gallery media migration is now active.

Delivery state:

- branch: `agent/architecture-sandbox`
- pull request: `#1 Build architecture sandbox and knowledge foundation`
- pull request state: ready for review

Latest completed decision:

- gallery coverage is complete legacy coverage, not a curated subset
- all 39 legacy content images must be represented by validated Media records
- the legacy studio renovation must become a first-class Project
- no project image may be omitted merely to simplify gallery generation
- logos, empty runtime placeholders, and true duplicate references do not count as gallery content

Existing completed work:

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
- Use complete legacy media coverage for the future gallery.

## Stage Completed

The completed generation stage activated two route families:

- `/projects/`: generated and sitemap eligible
- `/projects/{project-slug}/`: three routes generated and sitemap eligible
- `/gallery/`: blocked on completion of full media migration
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
- Do not replace complete gallery coverage with a curated subset.
- Do not exclude a real legacy content image without a documented duplicate or non-content reason.

## Current Checks

Run:

```bash
node tools/checks/run.mjs
```

Expected result before the next migration batch:

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

## Active Stage: Complete Gallery Media Migration

Goal:

Model every one of the 39 legacy content images and keep `/gallery/` blocked until complete coverage validates.

### Coverage Decision

- coverage mode: complete legacy coverage
- required content image count: 39
- curated coverage: rejected
- unmodeled studio renovation: must become a Project
- accepted exclusions: logos, empty runtime placeholders, and duplicate references to the same source asset

### Media Inventory

- reconcile all 39 legacy content images against current Media records
- create the studio Project before assigning its eight `proyecto-1` images
- assign every remaining apartment, standard, and premium image to the correct Project or capability section
- preserve before, work-in-progress, and after states where the legacy source provides them
- capture source path, truthful alt text, dimensions, ownership, provenance, and project/capability relationship
- document duplicate source references without creating duplicate Media entities

### Contract Gate

- add validation that complete coverage accounts for all 39 legacy content images
- fail validation for an unclassified source image
- fail validation when a gallery Media record lacks required metadata
- keep `/gallery/` blocked until complete coverage passes
- continue deferring image-detail routes until stable media slugs and extended metadata exist

### Verification And Handoff

- migrate records in reviewable batches
- run the full suite after every accepted batch
- regenerate projections only through their builders
- update `HANDOFF.md` and `architecture/session-state.yaml`

Suggested next commit message:

```text
Model complete legacy media inventory
```

## Later Work

1. Generate `/gallery/` only after all 39 legacy content images pass the coverage gate.
2. Add canonical image-detail pages only after required Media metadata exists.
3. Homepage value propositions from existing legacy source content.
4. Process steps from existing legacy source content.
5. Articles and testimonials only after real source records are available.
