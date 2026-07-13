# HANDOFF

Version: 7
Updated: 2026-07-13T20:00:36Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

The project and gallery route diagnostic stage is complete.

Delivery state:

- branch: `agent/architecture-sandbox`
- pull request: `#1 Build architecture sandbox and knowledge foundation`
- pull request state: ready for review

Latest completed work:

- legacy gallery sources are mapped to current `Project` and `Media` records
- `architecture/project-routes.yaml` defines canonical route families and planned instances
- `tools/routes/validate-project-routes.mjs` enforces route, entity, output, and sitemap invariants
- planned routes remain absent from `sitemap.xml` until generated HTML exists
- a generic `Page` entity remains deferred because route metadata is currently derivable from `Site` and `Project`

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

The completed diagnostic stage established four route families:

- `/projects/`: ready for generation
- `/projects/{project-slug}/`: three routes ready for generation
- `/gallery/`: blocked on media migration or an explicit curated-gallery decision
- `/projects/{project-slug}/images/{media-slug}/`: deferred

Legacy source coverage:

- economic gallery: 2 of 16 images have project-owned Media records; one studio project is unmodeled
- standard gallery: 5 of 6 images have project-owned Media records
- premium gallery: 5 of 17 images have project-owned Media records; two more are modeled as capability media
- overall: 27 of 39 legacy content images lack project ownership and 25 lack any Media record

The three current project detail routes are ready because each Project has truthful identity, summary, services, location, and at least two validated project-owned images. Initial pages must not imply full legacy gallery coverage.

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
- project route contract validation passes.
- `llms.txt` build and validation pass.
- `site-next` build passes.
- sitemap build and validation pass.
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

Generate the approved project index and three project detail pages from Knowledge Repository records.

### Step 1: Static Generation

- generate `site-next/projects/index.html`
- generate `site-next/projects/{project-slug}/index.html` for all three current Project records
- use current Project, Media, Service, and Site records only
- preserve image dimensions, semantic headings, visible internal links, and raw HTML content

### Step 2: Page Validation

- require unique title, description, canonical URL, and one H1 per page
- require project images and service references to resolve through Knowledge
- verify index-to-detail and detail-to-index links
- verify generated output paths match the route contract

### Step 3: Contract And Sitemap Activation

- set `generated_html_path` only after files exist
- set `sitemap_eligible` only after page validation passes
- update the sitemap builder to consume eligible route records
- keep `/gallery/` and image-detail routes excluded

### Step 4: Browser Verification

- verify project index and every detail page on desktop and mobile
- verify all project media return HTTP 200
- confirm the legacy homepage remains unchanged

### Step 5: Handoff And Commit

Update:

- `HANDOFF.md`
- `architecture/session-state.yaml`

Suggested commit message:

```text
Generate project pages from knowledge
```

## Later Work

1. Decide between complete and curated `/gallery/` after media migration.
2. Add canonical image-detail pages only after required Media metadata exists.
3. Homepage value propositions from existing legacy source content.
4. Process steps from existing legacy source content.
5. Articles and testimonials only after real source records are available.
