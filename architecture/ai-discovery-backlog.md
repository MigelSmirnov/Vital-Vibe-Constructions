# AI Discovery Implementation Backlog

Status: proposed

Target: production rollout of `site-next`

Related documents:

- `architecture/ai-native-content.md`
- `architecture/content-and-crawlability.md`
- `architecture/visual-redesign-plan.md`
- `architecture/project-routes.yaml`

## Goal

Make Vital Vibe Construction easy to discover, understand, verify, and cite by conventional search engines, AI search products, retrieval agents, and chat assistants.

The strategy is based on strong public HTML, stable canonical URLs, real project evidence, local-business consistency, machine-readable metadata, and reliable crawler access. AI-specific files are supporting resources, not substitutes for search fundamentals.

## Priority legend

- `P0` — required before or during production migration.
- `P1` — high-impact work immediately after the production foundation is stable.
- `P2` — useful expansion after core indexing and local entity signals are working.
- `P3` — experimental work with uncertain near-term return.

## Phase 1 — Production discovery foundation

### AI-001 — Publish the new canonical route structure

Priority: P0

Tasks:

- [ ] Decide whether `site-next` replaces the current production root or is integrated into the main build.
- [ ] Publish `/projects/`, project detail pages, `/gallery/`, and the first service page on the canonical domain.
- [ ] Confirm that primary content is present in raw HTML without client-side rendering.
- [ ] Confirm that all production URLs use `https://vitalvibeconstruction.com` consistently.
- [ ] Prevent `site-next` preview or temporary URLs from becoming canonical.

Acceptance criteria:

- Every published entity has exactly one canonical production URL.
- Page title, `h1`, summary, key facts, and internal links are visible in raw HTML.
- No production page depends on JavaScript for its primary textual content.

### AI-002 — Define redirects from legacy URLs

Priority: P0

Tasks:

- [ ] Inventory all legacy HTML URLs currently linked or indexed.
- [ ] Map `/projects.html` to `/projects/`.
- [ ] Map legacy gallery URLs to the closest project or gallery destination.
- [ ] Add permanent redirects for replaced service and content URLs.
- [ ] Avoid redirect chains.
- [ ] Document intentional `410 Gone` responses for obsolete pages with no replacement.

Acceptance criteria:

- Every valuable legacy URL resolves through at most one permanent redirect.
- Redirect destinations match user intent rather than pointing everything to the homepage.
- Old placeholder pages are no longer indexable.

### AI-003 — Validate crawler access policy

Priority: P0

Tasks:

- [ ] Review the production `robots.txt`.
- [ ] Allow public HTML, structured-data resources, important images, CSS, and required assets.
- [ ] Ensure Googlebot and Bingbot are not accidentally blocked.
- [ ] Ensure `OAI-SearchBot` is not blocked when ChatGPT Search visibility is desired.
- [ ] Decide and document the separate policy for model-training crawlers such as `GPTBot`.
- [ ] Confirm that CDN, firewall, rate limits, and bot protection do not block intended crawlers.
- [ ] Include the canonical sitemap URL.

Acceptance criteria:

- Public discovery crawlers can retrieve all canonical pages with `200 OK`.
- Private, draft, administrative, and customer-sensitive paths remain blocked or unpublished.
- Search access and training access are treated as separate documented decisions.

### AI-004 — Generate and validate the production sitemap

Priority: P0

Tasks:

- [ ] Generate `sitemap.xml` from canonical public page records.
- [ ] Include homepage, service pages, project pages, gallery, and future article pages.
- [ ] Exclude `robots.txt`, `llms.txt`, external applications, preview routes, and non-HTML utility files.
- [ ] Use accurate `lastmod` values only when the underlying content changed meaningfully.
- [ ] Add CI checks for duplicate, non-canonical, missing, or external URLs.
- [ ] Submit the sitemap in Google Search Console and Bing Webmaster Tools after deployment.

Acceptance criteria:

- Every sitemap URL returns `200 OK`, is canonical, and is indexable.
- No redirecting, duplicate, draft, external, or utility URL appears in the sitemap.

### AI-005 — Keep `llms.txt` synchronized with live content

Priority: P0

Tasks:

- [ ] Generate `llms.txt` from the Knowledge Repository.
- [ ] Include only live canonical resources.
- [ ] Include company identity, service area, services, project pages, gallery, planner, and contact information.
- [ ] Remove stale or preview URLs automatically.
- [ ] Add a meaningful content-update date when reliable generation metadata exists.
- [ ] Validate that claims and pricing match visible HTML.
- [ ] Keep assistant-oriented notes descriptive rather than instruction-heavy.

Acceptance criteria:

- `llms.txt` never references a missing or non-canonical page.
- Every factual statement is also supported by visible public content.
- The file is regenerated or validated in CI whenever source content changes.

## Phase 2 — Entity and structured-data quality

### AI-006 — Implement local-business identity schema

Priority: P1

Tasks:

- [ ] Select the most accurate Schema.org type or type combination for the business.
- [ ] Generate `LocalBusiness` or the appropriate contractor subtype from validated site records.
- [ ] Include only verified fields: name, canonical URL, logo, phone, email, service area, and public address or opening hours when genuinely available.
- [ ] Add `sameAs` links for authoritative external profiles.
- [ ] Ensure schema values match visible contact and company information.
- [ ] Avoid unsupported reviews, ratings, certifications, awards, addresses, and price ranges.

Acceptance criteria:

- Structured data validates without critical errors.
- Every material schema fact appears visibly on the page or an authoritative linked contact page.
- One consistent organization identity is used across all page schemas.

### AI-007 — Add page-specific structured data

Priority: P1

Tasks:

- [ ] Add `WebSite` and `WebPage` identity where appropriate.
- [ ] Generate `Service` for service detail pages.
- [ ] Generate `BreadcrumbList` for nested pages.
- [ ] Generate project-compatible `CreativeWork`, `Article`, or other appropriate markup only after selecting a semantically correct type.
- [ ] Generate `ImageObject` for important project images with real captions and ownership data.
- [ ] Add `Article` or `BlogPosting` only after real editorial content exists.
- [ ] Reuse canonical URLs and Knowledge Repository entities.

Acceptance criteria:

- Schema does not invent properties unsupported by the domain model.
- Canonical URLs, names, descriptions, images, and dates match the rendered page.
- Generated schema has automated snapshot or validation tests.

### AI-008 — Establish consistent company identity across external profiles

Priority: P1

Tasks:

- [ ] Audit Google Business Profile.
- [ ] Audit Bing Places.
- [ ] Audit Apple Business Connect.
- [ ] Audit public social profiles and relevant construction directories.
- [ ] Standardize business name, canonical domain, telephone, email, service area, and description.
- [ ] Link authoritative profiles through `sameAs` where appropriate.
- [ ] Remove or correct stale duplicate profiles.

Acceptance criteria:

- Core company facts are consistent across the website and primary external profiles.
- Search users can verify the business through more than one authoritative source.

## Phase 3 — Pages designed for answer retrieval

### AI-009 — Add direct-answer introductions to key pages

Priority: P1

Tasks:

- [ ] Add a concise 40–100 word answer-oriented introduction near the start of each important page.
- [ ] State entity type, location, service scope, and key limitations explicitly.
- [ ] Separate stable facts from promotional language.
- [ ] Replace ambiguous links such as “Más información” with descriptive labels.
- [ ] Ensure headings form a meaningful document outline.

Acceptance criteria:

- A crawler can identify the purpose and central answer of the page from the title, `h1`, and first substantive paragraph.
- Important facts do not exist only in cards, images, tabs, accordions, or scripts.

### AI-010 — Expand service pages around real customer questions

Priority: P1

Initial candidates:

- [ ] `/servicios/reformas-integrales-barcelona/`
- [ ] `/servicios/reforma-cocina-barcelona/`
- [ ] `/servicios/reforma-bano-barcelona/`
- [ ] `/servicios/electricidad-reformas-barcelona/`
- [ ] `/servicios/preinstalacion-domotica-barcelona/`

For each page:

- [ ] Define exactly what the service includes and excludes.
- [ ] State the geographic area.
- [ ] Describe the working process.
- [ ] Link real related projects.
- [ ] Include credible pricing guidance only when supported.
- [ ] Include common constraints and decision factors.
- [ ] Add a focused FAQ based on actual customer questions.
- [ ] Avoid near-duplicate location doorway pages.

Acceptance criteria:

- Each page answers a distinct search intent.
- At least one real project or evidence source supports the service page.
- Copy is specific enough that replacing the company name would not leave a generic template.

### AI-011 — Turn project pages into evidence-rich case studies

Priority: P1

Tasks:

- [ ] Add project type and general location.
- [ ] Add area, duration, completion date, and price tier when known and safe to publish.
- [ ] Describe the original condition.
- [ ] Describe the scope of work.
- [ ] Document major technical or design problems and their solutions.
- [ ] List materials and systems only when verified.
- [ ] Link related services.
- [ ] Label before, work-in-progress, and after media visibly.
- [ ] Add a concise transformation summary.
- [ ] Record provenance and ownership for published images.

Acceptance criteria:

- Each project page contains facts an assistant can cite beyond generic marketing copy.
- Unknown information remains omitted or explicitly unknown rather than inferred.
- Private addresses and customer-sensitive details are not published.

### AI-012 — Publish a small set of authoritative guides

Priority: P1

Initial guide candidates:

- [ ] `Cuánto cuesta una reforma integral en Barcelona`
- [ ] `Cuánto dura una reforma integral de piso`
- [ ] `Cómo planificar enchufes e iluminación antes de reformar`
- [ ] `Qué preparar para una futura instalación domótica o KNX`
- [ ] `Qué incluye un presupuesto de reforma integral`

Tasks:

- [ ] Base each guide on real company knowledge and current source records.
- [ ] Include direct answers, ranges, variables, examples, and limitations.
- [ ] Identify organizational authorship and review responsibility.
- [ ] Add publication and meaningful modification dates.
- [ ] Link related services, projects, planner features, and contact paths.
- [ ] Avoid publishing high-volume low-value AI-generated articles.

Acceptance criteria:

- Every guide contributes information not already available in generic service copy.
- Claims, price ranges, and timelines have an identified internal source or review owner.
- Guides remain maintainable and are updated when commercial facts change.

## Phase 4 — Multimodal and image discovery

### AI-013 — Complete project image metadata

Priority: P1

Tasks:

- [ ] Validate alt text for every important project image.
- [ ] Add visible captions where the image contributes evidence.
- [ ] Add extended descriptions for complex transformations.
- [ ] Record project, room type, work category, state, dimensions, format, and ownership.
- [ ] Replace filenames or generic captions as the only source of meaning.
- [ ] Review images for private information before publication.

Acceptance criteria:

- Important images can be understood from surrounding text without relying on computer vision.
- Before/after state and transformation are explicitly identified.
- Image metadata does not overclaim what is visible or known.

### AI-014 — Decide the scope of canonical image-detail pages

Priority: P2

Tasks:

- [ ] Identify images that deserve standalone canonical pages.
- [ ] Avoid generating thin pages for every minor gallery asset.
- [ ] Define minimum content requirements for an image page.
- [ ] Include image, caption, extended context, project link, related service, dimensions, and provenance.
- [ ] Add image pages to sitemap and `llms.txt` only when they meet quality requirements.

Acceptance criteria:

- Every image-detail page provides meaningful searchable context beyond the parent gallery.
- Thin, duplicate, or decorative image pages are not generated.

## Phase 5 — International and local discovery

### AI-015 — Define multilingual URL and metadata strategy

Priority: P2

Tasks:

- [ ] Decide whether the production site will support Spanish, English, Russian, or Catalan.
- [ ] Use stable language-specific URL structures.
- [ ] Add reciprocal `hreflang` annotations.
- [ ] Use self-canonical URLs for each translated page.
- [ ] Translate page purpose, facts, metadata, navigation, and structured data consistently.
- [ ] Avoid mixed-language pages and low-quality automatic translations.
- [ ] Define whether `llms.txt` remains single-language or links language-specific resource groups.

Acceptance criteria:

- Each language page is complete and independently useful.
- Search engines can identify language and regional alternatives without canonical conflicts.

### AI-016 — Strengthen Barcelona-specific entity signals

Priority: P1

Tasks:

- [ ] Make the service area visible and consistent.
- [ ] Publish an accurate contact or service-area page.
- [ ] Link to verified map and business profiles.
- [ ] Add genuine neighborhood or municipality references only when supported by completed work or service operations.
- [ ] Avoid mass-generated district pages.
- [ ] Add local project context without exposing customer addresses.

Acceptance criteria:

- The relationship between the company and Barcelona is supported by visible pages, projects, contact data, and external profiles.
- Local claims are factual and not created solely for keyword coverage.

## Phase 6 — Measurement and validation

### AI-017 — Add automated discovery validation

Priority: P0

Tasks:

- [ ] Validate canonical URLs and production origin.
- [ ] Validate sitemap entries.
- [ ] Validate `llms.txt` links.
- [ ] Validate robots policy against expected public routes.
- [ ] Validate presence of title, `h1`, summary, canonical, and primary content in raw HTML.
- [ ] Validate structured-data consistency with domain records.
- [ ] Detect draft or private entities leaking into public outputs.
- [ ] Detect duplicate titles, descriptions, canonical URLs, and generated pages.

Acceptance criteria:

- Discovery checks run in CI and fail on broken canonical resources or leaked drafts.
- Reports identify the source record and generated page responsible for each failure.

### AI-018 — Configure search-platform monitoring

Priority: P1

Tasks:

- [ ] Verify the domain in Google Search Console.
- [ ] Verify the domain in Bing Webmaster Tools.
- [ ] Submit the production sitemap.
- [ ] Monitor indexing, canonical selection, crawl errors, rich-result issues, and search queries.
- [ ] Record deployment dates so indexing changes can be interpreted.
- [ ] Review server logs for crawler failures when available.

Acceptance criteria:

- Indexing problems can be detected without manually searching individual URLs.
- Sitemap and canonical issues have an operational owner and review cadence.

### AI-019 — Measure AI and assistant referrals

Priority: P2

Tasks:

- [ ] Configure analytics to preserve referral sources.
- [ ] Create reporting for known assistant and AI-search referrers where available.
- [ ] Track landing page, inquiry action, WhatsApp click, phone click, email click, and planner launch.
- [ ] Separate brand queries from non-brand discovery where search-platform data allows it.
- [ ] Avoid treating uncited or unverifiable “AI ranking” tools as authoritative.

Acceptance criteria:

- The team can identify which pages generate useful visits and inquiries from search and assistant surfaces.
- Success is measured through qualified actions, not only impressions.

### AI-020 — Run recurring factual consistency audits

Priority: P1

Tasks:

- [ ] Compare visible HTML, Knowledge Repository, JSON-LD, sitemap, `llms.txt`, and external profiles.
- [ ] Verify phone, email, service area, planner URL, pricing, project facts, and company description.
- [ ] Review modification dates and remove misleading freshness signals.
- [ ] Detect discontinued services or outdated prices.
- [ ] Document the reviewer and audit date.

Acceptance criteria:

- Contradictory public facts are detected before deployment or during scheduled audits.
- Every commercially sensitive fact has one source of truth.

## Phase 7 — Optional agent interfaces

### AI-021 — Evaluate `llms-full.txt`

Priority: P3

Proceed only when:

- [ ] The public content library is large enough that a curated expanded representation provides value.
- [ ] Content can be generated from the same repository without duplication or drift.
- [ ] The output does not expose drafts or private data.

Acceptance criteria:

- The file adds useful context beyond `llms.txt` and HTML rather than duplicating pages mechanically.

### AI-022 — Evaluate a public content API

Priority: P3

Proceed only when a real consumer exists.

Possible read-only resources:

- [ ] organization identity;
- [ ] services;
- [ ] projects;
- [ ] media metadata;
- [ ] articles;
- [ ] canonical URLs.

Acceptance criteria:

- The API uses the same validated domain entities as HTML generation.
- It has a documented consumer, versioning policy, privacy review, and maintenance owner.

### AI-023 — Evaluate MCP or agent actions

Priority: P3

Potential future uses:

- project and service discovery;
- electrical planner handoff;
- structured inquiry preparation;
- public FAQ retrieval.

Do not proceed until:

- [ ] the public website is stable;
- [ ] the content API boundary is mature;
- [ ] authentication and privacy requirements are understood;
- [ ] a real user or partner workflow justifies the interface.

## Recommended execution order

1. AI-001 Publish the canonical route structure.
2. AI-002 Define legacy redirects.
3. AI-003 Validate crawler access.
4. AI-004 Generate the production sitemap.
5. AI-005 Synchronize `llms.txt`.
6. AI-017 Add CI discovery validation.
7. AI-006 and AI-007 complete structured data.
8. AI-011 enrich project case studies.
9. AI-010 expand service pages.
10. AI-008 and AI-016 strengthen local entity consistency.
11. AI-012 publish a small guide set.
12. AI-013 improve multimodal metadata.
13. AI-018 and AI-019 establish measurement.
14. Reassess P2 and P3 items using real indexing and inquiry data.

## First implementation slice

The first slice should deliver a complete vertical path rather than isolated metadata:

- [ ] Publish `/projects/` and one strong project detail page.
- [ ] Add canonical, breadcrumb, organization, page, and image structured data.
- [ ] Include the project in sitemap and generated `llms.txt`.
- [ ] Validate raw HTML, links, image metadata, and crawler access in CI.
- [ ] Add any required legacy redirect.
- [ ] Submit the sitemap after production deployment.

This slice proves that one Knowledge Repository entity can generate a human-readable page, machine-readable metadata, discovery indexes, and validated canonical links without drift.

## Definition of done

The AI-discovery foundation is considered production-ready when:

- canonical content is live on the primary domain;
- important pages are crawlable and render meaningful raw HTML;
- legacy URLs resolve intentionally;
- sitemap and `llms.txt` are generated from validated content;
- structured data matches visible facts;
- project and service pages contain specific evidence;
- local-business identity is consistent across primary profiles;
- private and draft content cannot enter public outputs;
- CI detects broken links, canonical drift, and factual inconsistencies;
- search indexing and qualified referrals can be measured.