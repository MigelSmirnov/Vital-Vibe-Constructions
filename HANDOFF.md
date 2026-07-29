# HANDOFF

Version: 13
Updated: 2026-07-29T00:00:00Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

`site-next` now includes the first full Knowledge Repository-backed SEO service page at `/servicios/reformas-integrales-barcelona/`. All eight generated HTML pages use root-relative public paths.

Delivery state:

- branch: `agent/architecture-sandbox`
- pull request: `#1 Build architecture sandbox and knowledge foundation`
- pull request state: ready for review
- base commit used for local verification: `a3d27ad11223ecef0bcd0c013f40de4a7579b626`
- local `node tools/checks/run.mjs`: success

Latest completed work:

- Service supports page-owned SEO title, meta description, H1, introduction, body, included service references, process steps, and FAQ
- the integral renovation page derives three related projects and their lead images from existing Project and Media records
- the page includes visible breadcrumbs, scope, process, project cards, six FAQ items, and contact CTA
- JSON-LD contains WebPage, Service, BreadcrumbList, and FAQPage data matching visible content
- the homepage `Reformas integrales` card links to the generated service route
- route, sitemap, llms.txt, root-path, content-reference, schema, FAQ, metadata, and CTA validation are active
- local HTTP checks returned 200 for the page, CSS, logo, three project images, and three project routes
- headless Firefox inspection passed at 1440×2200 and 390×8000 with readable H1, visible CTA and navigation, loaded images, and no visible horizontal overflow

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
- Normalize generated local `href` and `src` values to root-relative public URLs.
- Use complete legacy media coverage; curated omission is not allowed.
- Continue deferring image-detail routes.

## Current Routes

- `/projects/`: generated and sitemap eligible
- `/projects/{project-slug}/`: four routes generated and sitemap eligible
- `/gallery/`: generated and sitemap eligible
- `/servicios/reformas-integrales-barcelona/`: generated and sitemap eligible
- `/projects/{project-slug}/images/{media-slug}/`: deferred

The current generated sitemap contains eight URLs: homepage, projects index, four project details, gallery, and the integral renovation service page.

## Non-Negotiable Constraints

- Do not edit `support.js`.
- Do not evolve the legacy runtime.
- Do not bypass the Knowledge Repository.
- Do not duplicate content between builders and tables.
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

- environment: local
- conclusion: success
- Knowledge Repository tests: 27 passed, 0 failed
- complete gallery coverage: 39 modeled, 0 unmodeled
- root-path normalization and validation: 8 generated HTML files
- project page validation: index and four detail pages
- gallery validation: 39 contract media records
- service page validation: one generated route
- sitemap validation: eight URLs
- content audit: 0 errors and 5 known legacy warnings
- whitespace validation: pass

## Active Stage: First Service SEO Page

Completed:

1. Extend Service with validated page-owned content fields.
2. Register and generate `/servicios/reformas-integrales-barcelona/`.
3. Derive related services, projects, media, routes, and contacts from repository records.
4. Add matching WebPage, Service, BreadcrumbList, and FAQPage schemas.
5. Link the homepage service card and regenerate discovery projections.
6. Validate locally through project checks, HTTP requests, and desktop/mobile Firefox screenshots.

Suggested next commit message:

```text
Verify integral renovation service page deployment
```

## Later Work

1. Confirm the host serves `site-next` as the document root.
2. Verify the service page, root-relative assets, and routes over production HTTPS.
3. Repeat desktop and mobile inspection against the deployed page.
4. Add more service routes only after their confirmed page-owned content is available.
5. Add canonical image-detail pages only after extended Media metadata and route contracts are ready.
