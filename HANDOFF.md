# HANDOFF

Version: 10
Updated: 2026-07-24T00:00:00Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

Gallery media migration is active. The studio renovation is now a first-class Project with eight modeled Media records.

Delivery state:

- branch: `agent/architecture-sandbox`
- pull request: `#1 Build architecture sandbox and knowledge foundation`
- pull request state: ready for review

Latest completed work:

- complete legacy gallery coverage remains mandatory for all 39 content images
- `project-studio-renovation-barcelona` was added from the legacy economic gallery
- all eight `proyecto-1` images now have Media records with source paths, truthful legacy alt text, dimensions, ownership, and before/work/after state
- `/projects/estudio-reformado-barcelona/` is an approved generated project route
- project route coverage now contains four Project detail routes
- gallery coverage validation remains enabled and `/gallery/` remains blocked

Current modeled gallery coverage:

- total legacy content images: 39
- project-owned Media records: 20
- modeled non-project Media records: 2
- unmodeled images remaining: 17

## Current Strategy

- Preserve the legacy website and keep `support.js` read-only.
- Build `site-next` in parallel.
- Treat Knowledge Repository records as the source of truth.
- Treat HTML, `llms.txt`, and `sitemap.xml` as generated projections.
- Use complete legacy media coverage; curated omission is not allowed.
- Keep `/gallery/` blocked until every one of the 39 legacy content images resolves to validated Media.
- Continue deferring image-detail routes.

## Current Routes

- `/projects/`: generated and sitemap eligible
- `/projects/{project-slug}/`: four routes approved for generation and sitemap inclusion
- `/projects/estudio-reformado-barcelona/`: newly approved
- `/gallery/`: blocked on completion of full media migration
- `/projects/{project-slug}/images/{media-slug}/`: deferred

The expected generated sitemap now contains six URLs: homepage, projects index, and four project details.

## Non-Negotiable Constraints

- Do not edit `support.js`.
- Do not evolve the legacy runtime.
- Do not bypass the Knowledge Repository.
- Do not duplicate content between builders and tables.
- Do not add dependencies unless the current platform cannot reasonably solve the problem.
- Keep `content/tables/*.yaml` JSON-compatible until YAML-specific authoring is required.
- Do not generate `/gallery/` while its contract status is blocked.
- Do not generate image-detail routes while their family status is deferred.
- Do not replace complete gallery coverage with a curated subset.
- Do not exclude a real legacy content image without a documented duplicate or non-content reason.

## Current Checks

Run:

```bash
node tools/checks/run.mjs
```

Expected after generators run:

- Knowledge tests pass.
- complete gallery coverage contract validation passes.
- project page build generates the index and four detail pages.
- project page validation passes.
- project route contract validation passes.
- `llms.txt` build and validation pass.
- sitemap build and validation pass with six URLs.
- content audit completes without errors.
- `git diff --check` passes.

The connected GitHub API has not exposed a workflow run for the latest commit yet, so the full suite still needs a recorded CI result.

## Active Stage: Complete Gallery Media Migration

Next batch:

1. Add the six missing `proyecto-2` Media records.
2. Add `estandar/pintura.jpeg`.
3. Add the remaining premium project images.
4. Reconcile `premium/panel-marmol.jpeg` and `premium/apple-home.jpeg` with the capability ownership contract.
5. Verify real dimensions and preserve before/work/after states.
6. Reach 39 accounted images and zero unmodeled images before unlocking `/gallery/`.

Suggested next commit message:

```text
Model remaining legacy gallery media
```

## Later Work

1. Generate `/gallery/` only after all 39 legacy content images pass the coverage gate.
2. Add canonical image-detail pages only after extended Media metadata exists.
3. Homepage value propositions and process steps from real legacy source content.
4. Articles and testimonials only after real source records are available.
