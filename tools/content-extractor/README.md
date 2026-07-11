# Content Extractor

Dependency-free Node.js tool for inventorying the legacy website before and during the architectural migration.

It reads the current HTML source and writes:

- `legacy-content.json` — normalized machine-readable inventory;
- `legacy-content-report.md` — human-readable crawlability and content report.

## Requirements

- Node.js 18 or newer.
- No npm installation is required.

## Run

From the repository root:

```bash
node tools/content-extractor/extract.mjs
```

Default input:

```text
index.html
```

Default output directory:

```text
artifacts/content-audit/
```

Custom paths:

```bash
node tools/content-extractor/extract.mjs path/to/page.html path/to/output-directory
```

## Strict CI mode

By default, findings are reported without failing the command. To return a non-zero exit code when error-level findings exist:

```bash
CONTENT_AUDIT_FAIL_ON_ERROR=1 node tools/content-extractor/extract.mjs
```

## Extracted information

The JSON snapshot includes:

- page title, description, canonical and social metadata;
- heading hierarchy;
- semantic landmarks and sections;
- links and external destinations;
- images, alt text, dimensions and loading attributes;
- scripts and inline-script sizes;
- JSON-LD blocks and parse errors;
- inline-style usage;
- custom elements such as `x-dc`;
- raw source metrics;
- structured audit findings.

## Current audit rules

The first version detects:

- missing title, description and canonical URL;
- missing or multiple H1 headings;
- skipped heading levels;
- images without `alt`;
- images without explicit dimensions;
- links without accessible names;
- links without crawlable `href` values;
- missing semantic `main` and `nav` landmarks;
- heavy inline-style usage;
- dependency on the legacy `x-dc` root;
- missing or invalid JSON-LD;
- unusually large inline scripts.

## Scope and limitations

This tool is intentionally conservative.

It does not:

- execute JavaScript;
- reproduce the browser DOM after runtime rendering;
- rewrite the source HTML;
- generate final React components;
- infer business entities automatically;
- replace visual or accessibility testing.

The current website contains a custom `x-dc` document and generated runtime. The extractor audits the source representation so that crawler-visible content can be compared before and after migration.

The parser uses tolerant source scanning rather than a full HTML DOM dependency. This keeps the tool portable and suitable for early repository use. If the project later adopts a build tool with an HTML parser already available, the extraction internals may be replaced without changing the JSON report contract.

## Intended long-term use

During migration:

1. generate a baseline snapshot from the current `index.html`;
2. extract content into domain models and modules;
3. generate the new static or server-rendered HTML;
4. run the tool against the new output;
5. compare headings, links, images and important text coverage.

After migration, the tool can remain as a lightweight CI audit for crawler visibility and content regressions.
