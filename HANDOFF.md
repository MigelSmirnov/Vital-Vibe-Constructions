# HANDOFF

Version: 15
Updated: 2026-08-20T07:10:00Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

`agent/architecture-sandbox` is on a reproducible green baseline. The current Knowledge Repository records, builders, tracked generated projections, and SEO/AEO planning handoff are synchronized.

Delivery state:

- branch: `agent/architecture-sandbox`
- pull request: `#1 Build architecture sandbox and knowledge foundation`
- pull request state: open and ready for review
- current planning head before this note: `9ab16b9c3b75792e1fa2da34f776fec36cd18939`
- generated projection sync commit: `2d644be010466c5b620ad5c9ac1667f7846296d6`
- GitHub Actions `Project checks` run `#78`: success
- `node tools/checks/run.mjs`: success
- `git diff --exit-code` after generation: success

Current generated site:

- homepage
- `/projects/`
- four project detail pages
- `/gallery/`
- `/servicios/reformas-integrales-barcelona/`
- eight sitemap-eligible URLs total
- 39 of 39 legacy content images modeled

## Current Strategy

- Preserve the legacy website and keep `support.js` read-only.
- Build `site-next` in parallel until deployment replaces the legacy public document root.
- Treat Knowledge Repository records as the source of truth.
- Treat HTML, `llms.txt`, and `sitemap.xml` as generated projections.
- Keep tracked generated projections reproducible: a normal generation run must leave no repository diff.
- Normalize generated local `href` and `src` values to root-relative public URLs.
- Use complete legacy media coverage; curated omission is not allowed.
- Keep image-detail routes deferred.
- Prefer evidence-rich, locally specific content over generic SEO copy.
- Do not create page families by cloning a template with only the service keyword changed.

## SEO / AEO Audit Summary

The `site-next` architecture is strong enough to support both conventional search and AI answer systems, but the current content footprint is still small.

Strengths:

- crawlable static HTML with unique titles, descriptions, canonical URLs, headings, and internal links
- one full service landing page with visible breadcrumbs, process, FAQs, related projects, and structured data
- project pages with first-party construction evidence rather than generic marketing text
- El Raval case study exposes concrete facts including location, 50 m² area, phased execution, engineering constraints, decisions, approximate cost, and visible limitations
- complete gallery ownership and truthful media metadata
- reproducible `sitemap.xml` and `llms.txt`
- Knowledge Repository structure makes future page expansion systematic rather than ad hoc

Primary gaps:

1. `site-next` must become the public production document root before its SEO/AEO improvements can materially affect discovery.
2. Only `Reformas integrales` currently has a full public service route. Kitchens, bathrooms, electrical, painting, and masonry are still only short service records/cards.
3. The site lacks a deliberate query-to-page architecture covering commercial, project-evidence, and informational intent.
4. Entity/local-business structured data can be strengthened after confirming only factual business details that may be published.
5. Existing project media should be moved closer to the technical statements they support when useful; new El Raval technical photographs remain desirable but are not required to continue SEO/AEO planning.
6. The current Spanish site should be made strong first; English/Russian crawlable variants and hreflang remain later work.
7. Useful editorial content exists in the article sandbox but is not yet part of the public Knowledge Repository or route model.

## SEO / AEO Working Principles

- Optimize for answerable real questions, not keyword density.
- Every commercial page should explain scope, constraints, process, evidence, pricing context where truthful, and next action.
- Every project case study should contain facts that distinguish the project from a reusable marketing template.
- Important technical claims should be paired with existing or future visual evidence when practical.
- Structured data must mirror visible content and must not introduce facts that are absent from the page.
- `llms.txt` is a supporting discovery projection, not a substitute for strong crawlable HTML.
- FAQs should exist because they answer real customer questions, not because of an expected search-result enhancement.
- New articles should answer questions that naturally lead users toward service or project pages.
- Do not infer addresses, certifications, customer identities, material brands, project dates, or technical properties that are not verified.

## Active Stage: SEO / AEO Content Architecture

Technical-media completion for El Raval is deferred until the six reserved photographs are available. AI-011 remains open but is not blocking the next stage.

The active goal is to define the minimum high-value public page set for Barcelona before adding more builders or public routes.

### Next Artifact: Query / Page Matrix

Create a prioritized SEO/AEO matrix that maps real user intent to public page candidates.

The matrix should cover at least:

- commercial service intent
- local Barcelona intent
- project / case-study evidence intent
- pricing and budgeting questions
- old-building renovation problems
- electrical planning and renovation questions
- kitchen and bathroom renovation questions
- flooring, leveling, waterproofing, drainage, painting, and masonry questions where first-party experience exists

For each candidate page record:

- primary query / user question
- intent class
- proposed canonical route
- target entity or content type
- evidence currently available in the Knowledge Repository
- missing evidence or facts
- related existing project(s)
- related service(s)
- recommended schema only when useful and truthful
- internal-link sources and destinations
- business value
- SEO/AEO priority
- publication readiness

The first matrix should rank roughly 10–15 highest-value page opportunities rather than create a large speculative backlog.

## Planned Execution After the Matrix

1. **Production gate** — confirm the deployment approach for serving `site-next` as the public document root, then verify canonical routes, assets, sitemap, robots, and HTTP behavior over production HTTPS.
2. **Service expansion** — select the highest-value service pages from the matrix, expected to include some or all of kitchens, bathrooms, electrical, painting, and masonry. Add page-owned content only when enough real information exists.
3. **Entity/local layer** — define a factual site/business entity model and strengthen Organization/WebSite/local-business structured data without inventing a public address or unsupported business attributes.
4. **Evidence placement** — use existing project photographs contextually inside technical case-study sections where they already support visible claims; add the six reserved El Raval photographs later when available.
5. **Editorial layer** — promote the strongest article-sandbox topics into modeled public content after defining article entities/routes and evidence requirements. High-value topics include renovation cost, old Barcelona housing stock, floor leveling, electrical renovation planning, bathrooms, and other first-party construction problems.
6. **Internal linking** — connect informational pages to relevant service and project evidence pages, and connect service pages back to documented projects and supporting guides.
7. **Multilingual stage** — only after Spanish coverage is strong, design crawlable EN/RU routes and hreflang rather than client-only translations.
8. **Measurement** — once production deployment exists, use Search Console and business-profile data to revise priorities based on real impressions, queries, indexing, and conversions rather than guesses.

## El Raval Technical Media: Deferred

When the photographs become available, resume AI-011 with:

1. floor-pour photograph
2. subfloor/plasterboard photograph
3. wall-restoration photograph
4. bathroom-waterproofing photograph
5. corrugated-conduit photograph
6. electrical-panel photograph

Record truthful alt text, dimensions, state, source path, and project ownership; link the supporting technical claims; keep image-detail routes deferred; regenerate and require a clean diff; visually review the page before completing AI-011.

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
- Do not publish generic mass-produced landing pages without page-specific evidence and useful content.

## Verification

After content, route, builder, generated-output, or structural changes run:

```bash
node tools/checks/run.mjs
```

Then require generated projections to remain clean under the repository reproducibility check.
