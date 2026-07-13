# Project and Gallery Route Audit

Generated: 2026-07-13

## Scope

Compared:

- `galeria-economica.dc.html`
- `galeria-estandar.dc.html`
- `galeria-premium.dc.html`
- current `Project` and `Media` Knowledge records
- route requirements in `architecture/content-and-crawlability.md`
- multimodal requirements in `architecture/ai-native-content.md`

No public routes, redirects, legacy runtime files, or sitemap entries were changed during this audit.

## Legacy Page Findings

All three legacy gallery files contain visible H1 and project/gallery content, but none is ready to become a canonical target unchanged:

- no document title
- no meta description
- no canonical link
- no semantic `main` landmark
- no structured data
- no explicit image dimensions
- runtime-dependent `x-dc` root and heavy inline styling

The legacy files remain useful source material. Their `.dc.html` paths are not target canonical routes.

## Source Coverage

| Legacy source | Knowledge project | Source media | Project-owned media records | Other modeled media | Finding |
| --- | --- | ---: | ---: | ---: | --- |
| `galeria-economica.dc.html` | `project-piso-reformado-barcelona` | 16 | 2 | 0 | Source also contains an unmodeled studio project and six additional apartment images. |
| `galeria-estandar.dc.html` | `project-reforma-integral-estandar-barcelona` | 6 | 5 | 0 | Strongest mapping; only `estandar/pintura.jpeg` is not modeled. |
| `galeria-premium.dc.html` | `project-trabajos-contrata-premium` | 17 | 5 | 2 | Ten source images remain unmodeled; two modeled Smart Home images are capability media, not project-owned media. |

Logos and empty runtime image placeholders are excluded from the source media counts.

## Route Readiness

### Ready for generation

- `/projects/`
- `/projects/piso-reformado-barcelona/`
- `/projects/reforma-integral-estandar-barcelona/`
- `/projects/trabajos-contrata-premium/`

All three project records have a truthful title, summary, stable slug, location, service references, and at least two validated project-owned images. Initial detail pages may use only current Knowledge records and must not imply that they reproduce every legacy gallery image.

### Blocked on media migration

- `/gallery/`

A site-wide gallery labeled as complete would currently be misleading because 27 of 39 legacy content images lack project-owned Media records; 25 of those do not have any Media record. Either migrate those records or explicitly define the future page as a curated gallery before generation.

### Deferred

- `/projects/{project-slug}/images/{image-slug}/`

Image detail routes need more than a file and alt text. Captions, extended descriptions, publication context, ownership/copyright policy, and intentional public-page selection are incomplete.

## Page Model Decision

Do not add a generic `Page` entity yet.

The first project routes can derive identity from `Site` and `Project`, while route-specific generation state belongs in the route registry. Introduce `Page` only when page-owned metadata has multiple real consumers or can no longer be derived without duplication.

## Canonical and Sitemap Rules

- canonical paths use the production origin from `Site.canonicalOrigin`
- route paths and canonical URLs must be unique
- every project detail route must resolve to an existing Project record
- generated raw HTML is required before `sitemap_eligible` can become true
- legacy redirect decisions are maintained separately from canonical route records
- planned and blocked routes must not appear in `sitemap.xml`

## Recommended Implementation Order

1. Generate `/projects/` and the three ready project detail pages.
2. Validate raw HTML metadata, headings, internal links, image dimensions, and entity references.
3. Mark only successfully generated routes as sitemap eligible.
4. Update the sitemap builder to consume eligible generated routes.
5. Decide whether `/gallery/` is complete or curated after remaining media migration.
6. Plan image detail pages only after required Media metadata exists.
