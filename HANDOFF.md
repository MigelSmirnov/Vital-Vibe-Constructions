# HANDOFF

Version: 11
Updated: 2026-07-25T00:00:00Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

Complete legacy gallery media migration is finished and validated. All 39 content images listed by the coverage contract now resolve to Media records.

Delivery state:

- branch: `agent/architecture-sandbox`
- pull request: `#1 Build architecture sandbox and knowledge foundation`
- pull request state: ready for review
- latest verified commit before this handoff update: `f489c5c808788fad848d2f46ebe8bcdfb645c032`
- GitHub Actions `Project checks` run 33: success

Latest completed work:

- all eight `proyecto-1` images are modeled for the studio renovation project
- all eight `proyecto-2` images are modeled for the apartment renovation project
- all six standard gallery images are modeled, including `estandar/pintura.jpeg`
- all premium project images are modeled with truthful state and ownership metadata
- `premium/panel-marmol.jpeg` and `premium/apple-home.jpeg` are modeled as service-owned capability media
- complete gallery coverage now has zero unmodeled legacy content images
- repository structure contracts and the full project check suite are green

Current modeled gallery coverage:

- total legacy content images: 39
- project-owned Media records: 37
- modeled non-project Media records: 2
- unmodeled images remaining: 0

## Current Strategy

- Preserve the legacy website and keep `support.js` read-only.
- Build `site-next` in parallel.
- Treat Knowledge Repository records as the source of truth.
- Treat HTML, `llms.txt`, and `sitemap.xml` as generated projections.
- Use complete legacy media coverage; curated omission is not allowed.
- Implement `/gallery/` only through a builder, validator, and route-contract change.
- Continue deferring image-detail routes.

## Current Routes

- `/projects/`: generated and sitemap eligible
- `/projects/{project-slug}/`: four routes generated and sitemap eligible
- `/gallery/`: coverage gate passed, but route implementation is still pending
- `/projects/{project-slug}/images/{media-slug}/`: deferred

The current generated sitemap contains six URLs: homepage, projects index, and four project details. The gallery URL must be added only after its generated HTML validates.

## Non-Negotiable Constraints

- Do not edit `support.js`.
- Do not evolve the legacy runtime.
- Do not bypass the Knowledge Repository.
- Do not duplicate content between builders and tables.
- Do not add dependencies unless the current platform cannot reasonably solve the problem.
- Keep `content/tables/*.yaml` JSON-compatible until YAML-specific authoring is required.
- Do not mark `/gallery/` generated or sitemap eligible before its output exists and validates.
- Do not generate image-detail routes while their family status is deferred.
- Do not replace complete gallery coverage with a curated subset.
- Preserve truthful alt text, dimensions, and project or service ownership for every gallery image.

## Current Checks

Run:

```bash
node tools/checks/run.mjs
```

Latest verified result:

- GitHub Actions workflow: `Project checks`
- run number: 33
- conclusion: success
- Knowledge Repository tests: 13 passed
- complete gallery coverage: 39 modeled, 0 unmodeled
- project page build: index and four detail pages
- sitemap validation: six URLs
- content audit: 0 errors and 5 known legacy warnings
- whitespace validation: pass

## Active Stage: Gallery Route Preparation

Next batch:

1. Define gallery grouping and ordering from existing Project, Media, and service relationships.
2. Add unique gallery metadata and visible introductory content from validated records.
3. Add a `site-next` gallery builder and validator.
4. Generate `site-next/gallery/index.html` with raw semantic HTML, truthful alt text, dimensions, and crawlable project links.
5. Change `/gallery/` to generated and sitemap eligible only after validation passes.
6. Regenerate and validate `llms.txt` and `sitemap.xml`.
7. Verify all 39 image paths and inspect desktop and mobile output.

Suggested next commit message:

```text
Generate validated project gallery
```

## Later Work

1. Add canonical image-detail pages only after extended Media metadata and route contracts are ready.
2. Add homepage value propositions and process steps from real legacy source content.
3. Add articles and testimonials only after real source records are available.
