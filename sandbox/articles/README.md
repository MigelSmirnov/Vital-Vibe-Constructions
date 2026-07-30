# Article Sandbox

A private-by-convention draft previewer for developing article content without publishing article routes in `site-next`.

## Boundaries

- This directory is not a public content source of truth.
- Drafts must keep `status: draft`.
- Draft routes must not be added to `architecture/project-routes.yaml`, `sitemap.xml`, or `llms.txt`.
- Draft content must not be copied into `tools/site-next` builders.
- Promotion to public content requires a later Article entity, validated content records, route contracts, builders, and checks.

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
