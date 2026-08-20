# HANDOFF

Version: 16
Updated: 2026-08-20T07:16:00Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

`agent/architecture-sandbox` is on a reproducible green baseline and now has a ranked SEO/AEO query-to-page architecture.

Delivery state:

- branch: `agent/architecture-sandbox`
- pull request: `#1 Build architecture sandbox and knowledge foundation`
- pull request state: open and ready for review
- query/page matrix commit: `7b35dd80e40e3007784eaed77d246f89a1cd3d8e`
- matrix artifact: `architecture/seo-aeo-query-page-matrix.md`
- generated projection sync commit: `2d644be010466c5b620ad5c9ac1667f7846296d6`
- GitHub Actions `Project checks` run `#80`: success
- GitHub Actions `Article sandbox` run `#30`: success
- generated projections remain unchanged and reproducible

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
- Do not activate new routes merely because they appear in the SEO/AEO matrix.

## SEO / AEO Matrix

The first ranked matrix contains 15 page opportunities. It intentionally does not invent search-volume numbers. Priority is based on commercial value, current Barcelona search-result intent, first-party evidence readiness, AEO usefulness, and the ability to create genuinely distinct content.

Top priorities:

1. **Existing reformas integrales service** — `/servicios/reformas-integrales-barcelona/`
2. **Renovation price guide** — proposed `/guias/precio-reforma-integral-barcelona/`
3. **Kitchen service** — proposed `/servicios/cocinas-barcelona/`
4. **Bathroom service** — proposed `/servicios/banos-barcelona/`
5. **Electrical service** — proposed `/servicios/electricidad-barcelona/`

Second-wave evidence pages:

- old-building renovation in Barcelona
- uneven-floor / floor-leveling guide
- electrical-renovation guide
- painting service
- painting price/preparation guide
- masonry service

Supporting third-wave content:

- kitchen planning guide
- bathroom waterproofing guide
- how to review a renovation estimate

The existing El Raval project is treated as the primary evidence node rather than as a new route opportunity.

## Why the Ranking Looks This Way

Current Barcelona search results strongly emphasize:

- price per square metre and example apartment sizes;
- complete versus partial kitchen and bathroom renovation;
- scope and duration;
- old-building conditions and hidden installations;
- waterproofing, drainage and ventilation;
- preparation work as a major driver of painting cost.

VVC should not copy competitor numbers, guarantees or claims. The opportunity is to answer the same user questions with better first-party evidence.

## Evidence Advantage

### El Raval

Strongest evidence source for:

- integral renovation;
- 50 m² project cost context;
- old-building constraints;
- uneven floors and lightweight build-up;
- new electrical installation;
- drainage, ventilation and waterproofing;
- masonry / dry lining;
- budget trade-offs;
- phased execution.

### Piso reformado Barcelona

Useful for:

- integral renovation;
- kitchen service;
- before / work / after sequences;
- finished bathroom and circulation-space results where relevant.

### Reforma integral estándar

Useful for:

- integral renovation;
- kitchen;
- electrical preparation;
- painting;
- masonry;
- floor base and parquet evidence.

### Premium contractor work

Useful for:

- painting preparation and spray finish;
- plasterboard / dry lining;
- integrated LED / electrical work;
- premium finish evidence.

## Article Sandbox Promotion Order

1. `sandbox/articles/drafts/coste-reforma-piso-barcelona-2026.md`
   - highest-value editorial candidate;
   - must be converted to Spanish and verified line by line;
   - combines price intent with strong old-building and floor reasoning.

2. `sandbox/articles/drafts/pintura-paredes-barcelona.yaml`
   - mature evidence-first structure;
   - verify current 4–6 / ~6 EUR/m² claims before publication;
   - connect to premium and project media.

3. `sandbox/articles/drafts/reforma-cocina-barcelona.yaml`
   - useful supporting guide;
   - enrich with real project evidence before publication.

## Active Stage: Wave Selection and Production Gate

The query/page matrix is complete. The next work should not be another speculative SEO backlog.

### Wave 0 — Production Gate

Before expecting organic impact:

1. confirm how `site-next` will become the public document root;
2. deploy the current eight-page projection without changing canonical URLs;
3. verify public HTTP 200 behavior, assets, canonical tags, robots, sitemap, structured data and mobile rendering;
4. confirm Search Console discovery/indexing once production is live.

### Wave 1 — First Content Expansion

After the deployment approach is clear, implement in this order unless new first-party evidence changes the ranking:

1. strengthen the existing integral-renovation service if needed;
2. model and publish the Spanish renovation-price guide;
3. add page-owned kitchen service content and route;
4. add page-owned bathroom service content and route;
5. add page-owned electrical service content and route.

No route should be activated until its content is evidence-ready and the route contract is updated deliberately.

## Local / Entity Layer

After or alongside Wave 1:

- add factual `WebSite` identity markup;
- strengthen Organization/local-business identity only with verified publishable facts;
- do not invent a public street address;
- keep schema synchronized with visible content and Knowledge Repository records.

## El Raval Technical Media: Deferred

AI-011 remains open, but missing technical photographs do not block SEO/AEO execution.

When available, add:

1. floor-pour photograph
2. subfloor/plasterboard photograph
3. wall-restoration photograph
4. bathroom-waterproofing photograph
5. corrugated-conduit photograph
6. electrical-panel photograph

Use truthful Media metadata and contextual evidence links; keep image-detail routes deferred.

## Intentionally Deferred SEO Ideas

Do not prioritize:

- one repeated landing page per Barcelona neighborhood;
- self-ranking `mejor empresa` pages;
- guarantee/warranty claims without verified policy;
- financing pages without a confirmed offer;
- permit-management promises without confirmed operational scope;
- structural-safety advice without professional verification;
- exact brand comparison pages based on competitor content;
- EN/RU mirrors before Spanish topical coverage is stronger.

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
- Do not use competitor prices or guarantees as VVC facts.

## Verification

After content, route, builder, generated-output, or structural changes run:

```bash
node tools/checks/run.mjs
```

Then require generated projections to remain clean under the repository reproducibility check.
