# Production Deployment Plan

Status: proposed, production unchanged
Updated: 2026-08-20
Branch: `agent/architecture-sandbox`

## Goal

Publish the validated `site-next` projection at `https://vitalvibeconstruction.com/` without moving generated HTML into the repository root, without evolving the legacy runtime, and without losing shared assets or existing compatibility URLs.

## Current deployment evidence

The current repository is structured for classic GitHub Pages branch publishing:

- `main` contains the legacy `index.html` in the repository root.
- `main` contains `CNAME` with `vitalvibeconstruction.com`.
- `main` has no repository-owned Pages deployment workflow under `.github/workflows`.
- the legacy README explicitly instructs GitHub Pages publication from a branch using either repository `/root` or `/docs`.
- the root legacy entrypoint depends on `support.js` and shared image directories.

The connected GitHub tool does not expose the repository's `Settings -> Pages` publishing-source value directly. The repository evidence strongly indicates branch-source publishing, but the exact Pages setting must be visually confirmed before cutover.

## GitHub Pages constraint

For branch-source publishing, GitHub Pages supports only the repository root (`/`) or `/docs` as the source directory. `site-next` cannot be selected directly as an arbitrary branch subdirectory.

A custom GitHub Actions Pages workflow can instead upload an explicitly assembled static artifact and deploy that artifact as the site.

## Recommended target architecture

Use **GitHub Actions artifact deployment** for production.

Do not:

- copy `site-next/index.html` into the repository root as a source-of-truth file;
- hand-maintain root copies of generated project/service pages;
- change `generated_site_root` from `site-next` only to satisfy GitHub Pages;
- publish directly from `agent/architecture-sandbox` as the permanent production source.

Instead, build a temporary deployment directory from validated repository inputs and upload only that directory as the Pages artifact.

Suggested ephemeral output directory:

```text
.pages-dist/
```

This directory must not become a content source of truth and should not be tracked.

## Production artifact composition

### 1. Generated public projection

Copy the **contents** of `site-next/` into the artifact root, not the `site-next` directory itself.

Result:

```text
.pages-dist/index.html
.pages-dist/styles.css
.pages-dist/projects/index.html
.pages-dist/projects/{project-slug}/index.html
.pages-dist/gallery/index.html
.pages-dist/servicios/reformas-integrales-barcelona/index.html
```

This preserves the canonical routes already encoded in generated HTML.

### 2. Generated discovery files

Copy the current validated root projections:

```text
sitemap.xml
llms.txt
robots.txt
```

The deployed sitemap must remain the generated eight-URL sitemap from the current route contract.

### 3. Shared static assets

Copy assets referenced by root-relative generated URLs:

```text
VVC_primary_logo.svg
proyecto-1/
proyecto-2/
estandar/
premium/
smart/
```

Any future asset directory referenced by a Knowledge Repository Media record must be added through the bundle builder rather than copied manually during deployment.

### 4. Custom-domain marker

Include the repository `CNAME` file in the artifact for consistency, but do not treat that file as the source of truth for the Pages custom-domain setting.

Before production cutover, verify in GitHub `Settings -> Pages` that the custom domain is still configured as:

```text
vitalvibeconstruction.com
```

### 5. Legacy compatibility files

For the first cutover, preserve the remaining legacy static entrypoints that do not conflict with new canonical routes:

```text
aviso-legal.dc.html
galeria-economica.dc.html
galeria-estandar.dc.html
galeria-premium.dc.html
support.js
```

These files should remain outside the new sitemap and should not become inputs to `site-next` builders. Their purpose during cutover is compatibility and legal continuity, not continued product development.

Do **not** copy the legacy root `index.html`; `site-next/index.html` must own `/` in the deployment artifact.

## Historical URL compatibility

Older crawl evidence and repository history show historical URLs including:

```text
/projects.html
/proyecto-1.html
/proyecto-2.html
```

These files are no longer present in current `main`, so their live status must be checked immediately before cutover.

If any currently resolve or have Search Console impressions/backlinks, create explicit compatibility documents that point users and crawlers to the new canonical routes:

```text
/projects.html   -> /projects/
/proyecto-1.html -> /projects/estudio-reformado-barcelona/
/proyecto-2.html -> /projects/piso-reformado-barcelona/
```

GitHub Pages does not provide arbitrary server-side 301 rules for a plain static artifact. If compatibility documents are required, prefer a minimal HTML redirect document containing:

- canonical URL to the new route;
- immediate meta refresh;
- visible crawlable fallback link;
- optional `location.replace()` enhancement.

Do not activate these compatibility documents without first confirming that the old URL mapping is correct.

## Build and validation flow

The deploy workflow should separate **build/validate** from **deploy**.

### Build job

1. checkout the default branch commit to be deployed;
2. set up the repository's validated Node environment;
3. run:

```bash
node tools/checks/run.mjs
```

4. require tracked generated files to remain clean;
5. assemble `.pages-dist/` from the approved file sets above;
6. validate the artifact locally;
7. upload `.pages-dist/` with `actions/upload-pages-artifact`.

### Deploy job

Deploy only after the build job succeeds.

Requirements from GitHub Pages custom-workflow documentation:

- `pages: write` permission;
- `id-token: write` permission;
- `github-pages` environment;
- `actions/deploy-pages` deployment step;
- deploy from the default branch production workflow, not from pull requests.

## Bundle-specific validation requirements

Add a deployment-bundle validator before enabling production deployment.

It should fail if any of the following is missing:

- `/index.html`;
- `/styles.css`;
- `/VVC_primary_logo.svg`;
- `/robots.txt`;
- `/sitemap.xml`;
- `/llms.txt`;
- all eight sitemap route outputs;
- all image files referenced by generated HTML;
- the configured compatibility/legal files.

It should also verify:

- no generated HTML still references `site-next/` in a public URL;
- all local generated `href` and `src` values resolve inside the deployment bundle or are approved external URLs;
- `sitemap.xml` URLs match generated canonical routes;
- `robots.txt` points to the production sitemap;
- generated canonical origins remain `https://vitalvibeconstruction.com`;
- no legacy `index.html` overwrites the generated homepage.

## Cutover sequence

### Phase A — prepare without touching production

1. Add a deterministic Pages bundle builder.
2. Add bundle validation.
3. Run the bundle build in PR CI without deployment.
4. Inspect the generated bundle contents and route inventory.
5. Confirm GitHub Pages current settings manually.
6. Confirm current custom-domain state and HTTPS enforcement.
7. Check historical URLs before deciding compatibility redirects.

### Phase B — merge production-capable code

1. Keep `Project checks` green.
2. Merge the reviewed architecture branch into `main` only when the branch is otherwise ready.
3. Do not change canonical URLs during the deployment cutover.

### Phase C — switch Pages source

In GitHub:

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

Keep the existing custom domain.

Trigger the production workflow from `main`.

### Phase D — production verification

Immediately verify over production HTTPS:

```text
/
/projects/
/projects/piso-reformado-barcelona/
/projects/estudio-reformado-barcelona/
/projects/reforma-integral-estandar-barcelona/
/projects/trabajos-contrata-premium/
/gallery/
/servicios/reformas-integrales-barcelona/
/styles.css
/VVC_primary_logo.svg
/robots.txt
/sitemap.xml
/llms.txt
```

For HTML routes verify:

- HTTP 200;
- correct H1;
- correct canonical URL;
- stylesheet and images load;
- navigation works without JavaScript;
- no horizontal overflow on mobile;
- no legacy homepage is being served at `/`.

Also verify preserved legal/legacy compatibility files where retained.

### Phase E — discovery verification

After the new site is confirmed stable:

1. submit or re-check `sitemap.xml` in Google Search Console;
2. inspect indexing for all eight canonical routes;
3. monitor old URL coverage/404s;
4. inspect canonical selection;
5. begin measuring queries and impressions before adding the next route wave.

## Rollback strategy

The migration is intentionally reversible.

Because the legacy root files remain in the repository and are not evolved during the parallel migration, rollback is:

1. change Pages source back to branch publishing;
2. select `main` and `/root` if that is confirmed as the existing source;
3. verify the legacy homepage returns;
4. investigate the artifact deployment failure without rewriting the legacy site.

Do not delete legacy entrypoints until the Actions deployment has been stable and historical URL behavior has been reviewed.

## Decision

Recommended production target:

```text
Knowledge Repository
        -> builders/checks
        -> site-next + sitemap.xml + llms.txt
        -> deterministic .pages-dist bundle
        -> GitHub Pages artifact
        -> vitalvibeconstruction.com
```

This keeps repository architecture and hosting concerns separate: `site-next` remains the reproducible generated projection, while `.pages-dist` is only a deployment package.

## Next implementation step

Implement **bundle assembly + bundle validation only**, with no `deploy-pages` step yet.

Once that CI-only bundle passes review, confirm `Settings -> Pages` and then add the production deployment job as a separate, explicit cutover change.
