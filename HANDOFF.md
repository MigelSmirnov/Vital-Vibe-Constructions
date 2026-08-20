# HANDOFF

Version: 14
Updated: 2026-08-20T06:32:00Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

`agent/architecture-sandbox` is back on a reproducible green baseline. The current Knowledge Repository records, builders, and tracked generated projections are synchronized.

Delivery state:

- branch: `agent/architecture-sandbox`
- pull request: `#1 Build architecture sandbox and knowledge foundation`
- pull request state: open and ready for review
- generated projection sync commit: `2d644be010466c5b620ad5c9ac1667f7846296d6`
- cleanup baseline: `4bf0067748cfc466cd7e85818c700be832e0c44a`
- GitHub Actions `Project checks` run `#74`: success
- `node tools/checks/run.mjs`: success
- `git diff --exit-code` after generation: success

Latest completed work:

- synchronized `site-next`, `llms.txt`, and `sitemap.xml` with the current Knowledge Repository and builders
- generated El Raval project content now reflects the evidence-rich Project record across the project page, homepage, projects index, gallery, service references, structured data, and AI discovery output
- generated HTML trailing-whitespace normalization is active and no longer leaves tracked diffs
- removed the temporary one-shot regeneration workflow after the canonical generated outputs were committed
- preserved the existing `Project checks` workflow unchanged as the authoritative CI gate

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
- Keep tracked generated projections reproducible: a normal generation run must leave no repository diff.
- Normalize generated local `href` and `src` values to root-relative public URLs.
- Use complete legacy media coverage; curated omission is not allowed.
- Continue deferring image-detail routes.

## Current Routes

- `/projects/`: generated and sitemap eligible
- `/projects/{project-slug}/`: four routes generated and sitemap eligible
- `/gallery/`: generated and sitemap eligible
- `/servicios/reformas-integrales-barcelona/`: generated and sitemap eligible
- `/projects/{project-slug}/images/{media-slug}/`: deferred

The generated sitemap contains eight URLs: homepage, projects index, four project details, gallery, and the integral renovation service page.

## Non-Negotiable Constraints

- Do not edit `support.js`.
- Do not evolve legacy entrypoints.
- Do not bypass the Knowledge Repository.
- Do not hand-edit generated output as a substitute for changing its source or builder.
- Do not duplicate business content between builders and tables.
- Do not add dependencies unless the current platform cannot reasonably solve the problem.
- Keep `content/tables/*.yaml` JSON-compatible until YAML-specific authoring is required.
- Do not generate image-detail routes while their family status is deferred.
- Do not replace complete gallery coverage with a curated subset.
- Preserve truthful alt text, dimensions, and project or service ownership for every gallery image.

## Current Checks

Run:

```bash
node tools/checks/run.mjs
```

Latest verified result:

- environment: GitHub Actions
- workflow: `Project checks` run `#74`
- conclusion: success
- Knowledge Repository tests: 27 passed, 0 failed
- complete gallery coverage: 39 modeled, 0 unmodeled
- root-path normalization and validation: 8 generated HTML files
- project page validation: index and four detail pages
- gallery validation: 39 contract media records
- service page validation: one generated route
- sitemap validation: eight URLs
- content audit: 0 errors and 5 known legacy warnings
- generated-file reproducibility check: pass

## Active Stage: El Raval Evidence Case Study

The evidence-rich case-study implementation and generated projections are validated. AI-011 remains open because the reserved technical-media subjects still need real photographs and contextual Media records.

Current El Raval page includes verified initial condition, objective, engineering challenges, engineering decisions, budget tradeoffs, approximate cost, result, related services, existing project media, and visible placeholders for technical evidence that has not yet been uploaded.

## Next Stage

Replace the pending El Raval technical-media subjects with verified Media records:

1. Upload the floor-pour, subfloor/plasterboard, wall-restoration, bathroom-waterproofing, corrugated-conduit, and electrical-panel photographs.
2. Record truthful alt text, dimensions, state, source path, and project ownership in `content/tables/media.yaml`.
3. Add the new Media IDs to the El Raval Project record in deliberate evidence order.
4. Link technical claims to supporting photographs without creating thin image-detail routes.
5. Regenerate projections and require a clean `git diff --exit-code`.
6. Repeat mobile visual inspection before marking AI-011 complete.
