# Article Sandbox

A private-by-convention draft previewer for developing article content without publishing article routes in `site-next`.

## Boundaries

- This directory is not a public content source of truth.
- Drafts must keep `status: draft`.
- Draft routes must not be added to `architecture/project-routes.yaml`, `sitemap.xml`, or `llms.txt`.
- Draft content must not be copied into `tools/site-next` builders.
- Promotion to public content requires a later Article entity, validated content records, route contracts, builders, and checks.

## Technical-document preview

The preview renders article drafts as a lightweight engineering document system rather than a generic blog layout:

- cover sheet with document number, revision, date, language and sheet count;
- drawing-style coordinate frame and reusable title block;
- numbered sections grouped into content sheets;
- technical notes, figures and specification-style lists;
- final notes/FAQ sheet;
- sheet-to-sheet navigation.

Stable document numbers and sheet labels live in `drafts/index.json` as sandbox presentation metadata, so reordering drafts does not renumber existing documents. A draft may still override presentation fields locally while it is being edited; none of this metadata is a public content source of truth.

This visual system is deliberately confined to the sandbox until the public Article entity and article route family exist.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/sandbox/articles/
```

The previewer uses `fetch`, so opening `index.html` through `file://` is not supported.

## Add a draft

1. Copy an existing file in `sandbox/articles/drafts/`.
2. Keep the file JSON-compatible even though it uses the `.yaml` extension.
3. Give it a unique `id` and `slug`.
4. Keep `status` equal to `draft`.
5. Add the file to `sandbox/articles/drafts/index.json`.

Required fields:

- `id`
- `slug`
- `status`
- `language`
- `title`
- `seo_title`
- `meta_description`
- `h1`
- `introduction`
- `sections`

Supported body blocks:

- `paragraph`
- `list`
- `quote`
- `image`

The JSON editor stores changes in browser `localStorage`. It does not write changes back to GitHub.

## Promotion path

The intended future flow is:

```text
sandbox article draft
  -> editorial and factual approval
  -> Article record in the Knowledge Repository
  -> validated article route contract
  -> generated site-next article page
  -> sitemap and llms.txt eligibility
```

## Reading sample

The bathroom case (`VVC-ART-003`) is available at `reading/traslado-lavabo-toallero-cuatro-dias/` and from the sandbox's draft panel. Its source is `drafts/traslado-lavabo-toallero.yaml`. It uses all five original work photographs plus the existing homepage result image, whose previous AI retouch is disclosed in the caption. The case records four working days and EUR 1,100 for labour including rubbish removal. Location, work date, material cost, VAT and the precise hygienic-shower scope remain editorial unknowns.

All six image blocks refer to the indexed assets imported in commit `587b298`. No new media records or duplicate images are needed. This is a noindex article draft, not a new public Project or Article route.

The painting article is the first lighter reading-layout sample. The manifest opts it in with `reading_preview: true`; FAQ items marked `internal: true` remain editorial-only and do not appear in this reader.

Build with `node tools/articles/build-reading-preview.mjs` after draft validation. Open `sandbox/articles/reading/pintura-paredes-precio-preparacion-barcelona/` through a static server. The source stylesheet is `sandbox/articles/reading.css`.

The sample has a compact technical header, continuous reading column, numbered sections, a technical note and native FAQ disclosures. Mobile contents start collapsed; all text and navigation remain available without JavaScript. The original sheet-based preview is retained.

This remains a noindex draft, outside `site-next`, sitemap, llms.txt and production bundles. Only the separate owner-private review Site receives a copy for visual review. Prices and wording have not received new factual approval.
