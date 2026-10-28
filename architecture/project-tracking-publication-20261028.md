# Project tracking article publication preparation — 2026-10-28

Owner authorised moving draft VVC-ART-004 (PR #10, `agent/project-tracking-article`) into the public article tables and asked for an English version. The Spanish and Russian texts keep the owner's draft wording and section order; the Russian draft gains the section heading the Spanish draft already had. The English version is a full translation, not a summary.

Changes against the draft:

- The draft's inline URL to the parquet article became a `source_list` block, because article paragraphs do not render links. Each language links to its own parquet article route.
- The draft's second image was a phone screenshot of the Facebook post: status bar, reactions and a commenter's name and photo, plus browser machine-translation errors in the portal UI ("para el el", "Pagodemstravo"). It is replaced by a direct capture of the demo client area (`Proyecto Demo Facebook`) from the production portal on 2026-10-28, cropped to the working area. The portal UI is Russian; its labels were set to Spanish in the browser before capture. Project data was not changed. All three languages show the same Spanish image, because article translations must keep the same media references.
- The receipts photo is the draft's original with one change: the handwritten delivery note's stamp (an individual supplier's name, NIE, address and phone) is blurred. Nothing else is retouched.

Checks: `node tools/checks/run.mjs` passes, content audit 0 errors / 5 existing warnings; sitemap 46 routes (43 + 3). The local VPS bundle build cannot run here (no ImageMagick `convert` or `cwebp`); responsive WebP generation and the bundle checks run in CI. A local static preview of the three generated pages loaded both images with no horizontal overflow at 390 px and 1280 px. No VPS activation has occurred.

Provenance:

```json
{
  "article": "article-project-tracking",
  "document_number": "VVC-ART-004",
  "languages": ["es", "en", "ru"],
  "draft_pull_request": 10,
  "photos": [
    {
      "file": "assets/project-tracking/receipts.jpg",
      "source": "sandbox/articles/assets/seguimiento-control-reforma/tickets-compras.jpg @ f0c83e0",
      "change": "supplier stamp blurred",
      "bytes": 600553,
      "sha256": "cce76ac213fbf56460c2b11cd0f66af01fe6fb592e14dcbcce9a4362f9b4762c"
    },
    {
      "file": "assets/project-tracking/client-area-demo.jpg",
      "source": "production client portal, demo project, captured 2026-10-28",
      "bytes": 369618,
      "sha256": "bbeba1c219f033199758a6664cb0c9807aeb9e07b8eb512f776d4cd2f33844f6"
    }
  ],
  "audit_errors": 0,
  "existing_warnings": 5,
  "sitemap_routes": 46,
  "production_changed": false
}
```
