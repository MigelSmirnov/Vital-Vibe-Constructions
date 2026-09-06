# site-next Gap Audit

Generated: 2026-07-12

## Scope

Compared:

- legacy homepage `index.html`
- current `site-next/index.html`
- current Knowledge Repository content tables
- architecture requirements in `architecture/content-and-crawlability.md` and `architecture/ai-native-content.md`

This audit does not recommend editing `support.js` or the legacy runtime.

## Current site-next Coverage

Implemented from Knowledge Repository:

- site metadata, hero, and contact copy
- services
- projects
- media-backed project lead images
- external electrical planner
- public contact channels
- Organization JSON-LD with offers and contactPoint

Current `site-next` raw HTML has semantic metadata, a `main` landmark, crawlable navigation links, project cards, service cards, contact links, and image dimensions.

## Major Gaps

### 1. Homepage Value Props

Legacy source:

- Presupuesto sin compromiso
- Precios transparentes
- Hablamos tu idioma
- Garantía de calidad

Current `site-next` has no equivalent value-prop section.

Recommended model:

- `ValueProposition`
- fields: `id`, `title`, `summary`, `position`

Priority: medium. This is visible homepage content but does not unlock new URLs.

### 2. Renovation Types and Pricing

Legacy source:

- Económica: 800 EUR/m2
- Estándar: 1200 EUR/m2
- Premium: 1500 EUR/m2
- approximate-pricing disclaimer in calculator area

Current `site-next` does not expose pricing tiers, while `llms.txt` already mentions starting price.

Recommended model:

- `RenovationTier`
- fields: `id`, `slug`, `title`, `summary`, `price_per_m2`, `currency`, `is_featured`, `disclaimer`

Priority: high. This is business-critical content and should be centralized before calculators or AI-facing resources consume pricing.

### 3. Process Steps

Legacy source:

- Visita y presupuesto
- Planificación
- Ejecución
- Entrega con garantía

Current `site-next` has no process section.

Recommended model:

- `ProcessStep`
- fields: `id`, `title`, `summary`, `position`

Priority: medium. Useful trust content and low implementation risk.

### 4. Smart Home / Domotica Section

Legacy source:

- Smart home preparation with partners
- Our work: cableado, cuadros, KNX pre-installation, climate/light/blinds points, partner coordination
- smart media already partially exists in `content/tables/media.yaml`

Current `site-next` only mentions electrical planning and does not project this section.

Recommended model:

- either extend `Service` with richer body/media references
- or add `CapabilitySection`
- fields: `id`, `slug`, `title`, `summary`, `capabilities`, `service_ids`, `media_ids`, `note`

Priority: high. It connects existing service and media records and clarifies the planner/partner positioning.

### 5. Gallery and Project Detail URLs

Legacy source:

- `galeria-economica.dc.html`
- `galeria-estandar.dc.html`
- `galeria-premium.dc.html`

Architecture target:

- `/projects/`
- `/projects/{project-slug}/`
- `/projects/{project-slug}/images/{image-slug}/`
- `/gallery/`

Current `site-next` shows project cards but has no project detail pages, gallery index, image detail pages, or canonical gallery links.

Recommended next step:

- add route-generation plan before implementing more UI
- keep legacy gallery pages documented as source material, not target URLs

Priority: high for crawlability, but larger than a single entity change.

### 6. Articles and Testimonials

Search found no credible source records for testimonials or articles in the current repo.

Recommendation:

- do not create `Article` or `Testimonial` content yet
- wait for real source records

Priority: blocked by content.

### 7. llms.txt Drift

Current `llms.txt` is manually maintained and not generated from Knowledge Repository.

Issues:

- planner URL differs from `content/tables/external-apps.yaml` (`https://app.vitalvibeconstruction.com/` vs `/manual`)
- services are generic text, not projected from service records
- contact information is not included
- project/case-study links are not included

Recommended model/build step:

- `tools/ai-discovery/build-llms.mjs`
- consume Knowledge Repository
- write `llms.txt`

Priority: high after contact/project records now exist.

### 8. sitemap.xml Drift

Current sitemap includes:

- homepage
- `robots.txt`
- `llms.txt`
- external planner app URL

Architecture says utility files should not be treated as priority indexable HTML landing pages in the main sitemap.

Recommended build step:

- `tools/seo/build-sitemap.mjs`
- consume canonical site config and generated page records
- include only canonical public HTML pages
- exclude `robots.txt`, `llms.txt`, and external app URLs from the main sitemap

Priority: high for SEO correctness.

## Recommended Next Work Items

1. Add `RenovationTier` knowledge entity and table.
2. Project renovation tiers into `site-next` and reuse them for future estimate/calculator work.
3. Add `ProcessStep` knowledge entity and table.
4. Add Knowledge-backed `llms.txt` generation.
5. Add Knowledge-backed `sitemap.xml` generation and remove utility/external URLs from the sitemap.
6. Plan project/gallery detail route generation before expanding project UI further.

## Suggested Immediate Next Step

Start with `RenovationTier`.

Reason:

- source records exist in legacy content
- pricing already appears in `llms.txt`
- the model will support both visible homepage content and future calculator/estimate features
- implementation is small and stays within the Knowledge Repository pattern
