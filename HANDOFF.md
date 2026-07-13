# HANDOFF

Version: 5
Updated: 2026-07-13T19:20:41Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

The Knowledge-backed sitemap stage is complete.

Delivery state:

- branch: `agent/architecture-sandbox`
- draft pull request: `#1 Build architecture sandbox and knowledge foundation`
- local and remote branches were synchronized before this stage

Latest completed work:

- `sitemap.xml` is generated and validated from Knowledge Repository site data
- project checks run locally and through pull request CI
- the legacy content audit is reproducible across local and GitHub runs
- `site-next` project cards have stable desktop and mobile media dimensions

Important detail artifacts:

- `artifacts/site-next-gap-audit/report.md`
- `artifacts/content-audit/legacy-content-report.md`

## Current Strategy

- Preserve the legacy website.
- Build `site-next` in parallel.
- Treat legacy runtime (`support.js` + `x-dc`) as read-only.
- Treat Knowledge Repository records as the source of truth.
- Treat HTML, `llms.txt`, and `sitemap.xml` as generated projections of validated knowledge records.
- Keep pull request checks deterministic and leave the worktree clean after regeneration.

## Stage Completed

The completed stage made `sitemap.xml` a generated projection of the canonical site record:

- `tools/seo/build-sitemap.mjs` writes the sitemap
- `tools/seo/validate-sitemap.mjs` validates canonical origin, required homepage, duplicates, and excluded URLs
- the initial sitemap contains only `https://vitalvibeconstruction.com/`
- utility files and external application URLs are excluded
- `tools/checks/run.mjs` builds and validates the sitemap
- `.github/workflows/project-checks.yml` runs project checks for pull requests into `main`
- content audit generation preserves `generatedAt` when report content is unchanged
- local and GitHub content audit workflows use `tools/content-extractor/run.mjs`

Browser verification completed with Playwright Chromium:

- legacy homepage: 1440x900 and 390x844
- `site-next`: 1440x900 and 390x844
- legacy rendering remained intact
- `site-next` project card stretching found during verification was corrected in the generator

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
- `llms.txt` build and validation pass.
- `site-next` build passes.
- sitemap build and validation pass.
- content audit completes with `0 errors / 5 warnings`.
- `git diff --check` passes.
- a second generation run does not change tracked output.

Known remaining legacy audit warnings:

- `heading-level-skip`
- `missing-main`
- `heavy-inline-styles`
- `runtime-dependent-root`
- `large-inline-script`

## Next Stage

Goal:

Add a Knowledge-backed Smart Home / Domotica capability section to `site-next` using existing service and media records.

### Step 1: Content Model

Add an explicit capability section record rather than embedding copy in the page builder.

Expected ownership:

- content table with title, summary, capability items, note, `service_ids`, and `media_ids`
- Knowledge entity and repository accessors
- reference validation for services and media

### Step 2: Projection

Project the capability section into raw `site-next` HTML:

- explain electrical preparation and partner coordination truthfully
- reuse existing Smart Home media records
- preserve the external electrical planner as a related application, not the capability itself
- keep all primary text and links crawlable without client-side JavaScript

### Step 3: Validation

- add focused Knowledge Repository tests
- run `node tools/checks/run.mjs`
- verify desktop and mobile rendering
- confirm legacy output remains unchanged

### Step 4: Handoff And Commit

Update:

- `HANDOFF.md`
- `architecture/session-state.yaml`

Suggested commit message:

```text
Add smart home capability knowledge
```

## Later Work

1. Project/gallery detail route planning and canonical page generation.
2. Homepage value propositions from existing legacy source content.
3. Process steps from existing legacy source content.
4. Articles and testimonials only after real source records are available.
