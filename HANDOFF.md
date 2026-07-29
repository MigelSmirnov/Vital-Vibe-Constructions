# HANDOFF

Version: 12
Updated: 2026-07-29T00:00:00Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

`site-next` is generated with root-relative public paths and is ready for root-domain hosting verification. All seven generated HTML pages use paths that do not depend on page depth.

Delivery state:

- branch: `agent/architecture-sandbox`
- pull request: `#1 Build architecture sandbox and knowledge foundation`
- pull request state: ready for review
- base commit used for local verification: `92696090524cb6e12607c6a14334deb7f6b47349`
- local `node tools/checks/run.mjs`: success

Latest completed work:

- local generated links and assets are normalized after all `site-next` builders run
- CSS uses `/styles.css`
- the brand logo uses `/VVC_primary_logo.svg`
- content images use root paths such as `/proyecto-2/b8.jpeg`
- project links use `/projects/{project-slug}/`
- nested-page contact links use `/#contacto`; same-page homepage anchors remain unchanged
- canonical, Open Graph, HTTPS, mailto, tel, and WhatsApp URLs remain unchanged
- the root-path validator rejects relative local URLs and accidental double-slash URLs
- project and gallery validators assert exact root-relative media paths
- `/gallery/`, `llms.txt`, and `sitemap.xml` are regenerated from their existing contracts

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
- `/projects/{project-slug}/images/{media-slug}/`: deferred

The current generated sitemap contains seven URLs: homepage, projects index, four project details, and gallery.

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
- Knowledge Repository tests: 22 passed, 0 failed
- complete gallery coverage: 39 modeled, 0 unmodeled
- root-path normalization and validation: 7 generated HTML files
- project page validation: index and four detail pages
- gallery validation: 39 contract media records
- sitemap validation: seven URLs
- content audit: 0 errors and 5 known legacy warnings
- whitespace validation: pass

## Active Stage: Root-Domain Publication Preparation

Completed:

1. Generate homepage, projects, project details, and gallery.
2. Normalize local generated HTML URLs after all page builders.
3. Reject relative local paths and accidental `//` paths.
4. Validate project and gallery media with exact root-relative URLs.
5. Regenerate discovery projections and run the full project checks.

Suggested next commit message:

```text
Verify root-domain deployment
```

## Later Work

1. Confirm the host serves `site-next` as the document root.
2. Verify root-relative assets and routes return HTTP 200 in the deployment environment.
3. Inspect desktop and mobile rendering before switching public traffic.
4. Add canonical image-detail pages only after extended Media metadata and route contracts are ready.
