# HANDOFF

Version: 18
Updated: 2026-08-20T09:56:00+02:00

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail belongs in commits and architecture artifacts.

## Current Status

`agent/architecture-sandbox` is on a reproducible green baseline with:

- validated Knowledge Repository architecture;
- eight generated public HTML routes in `site-next`;
- complete 39/39 legacy media coverage;
- ranked 15-page SEO/AEO query-to-page matrix;
- VPS selected as the production hosting direction;
- a deterministic, validated VPS release bundle produced in pull-request CI;
- no production, DNS, GitHub Pages or canonical URL changes yet.

Key artifacts:

- `architecture/seo-aeo-query-page-matrix.md`
- `architecture/vps-migration-plan.md`
- `architecture/production-deployment-plan.md` — evaluated GitHub Pages fallback
- `tools/deploy/build-vps-bundle.mjs`
- `tools/deploy/validate-vps-bundle.mjs`
- `deploy/vps/Caddyfile`
- `deploy/vps/install-release.sh`
- `deploy/vps/rollback-release.sh`
- `.github/workflows/vps-bundle-check.yml`

## Production Hosting Decision

Long-term target: **VPS + Caddy**, not GitHub Pages.

GitHub remains responsible for source control, tests and release artifacts. The VPS serves only validated static release bundles.

Target flow:

```text
Knowledge Repository
        -> builders/checks
        -> site-next + sitemap.xml + llms.txt
        -> .deploy-dist
        -> vps-site-bundle.tgz
        -> /srv/vital-vibe/releases/<release-id>/
        -> /srv/vital-vibe/current
        -> Caddy
        -> https://vitalvibeconstruction.com
```

Do not copy generated `site-next` files into repository root as source files.

## Why VPS

The VPS direction is preferred because it provides:

- real HTTP 301 redirects for historical URLs;
- explicit cache/security headers;
- server logs;
- deterministic document root;
- atomic release/rollback through a symlink;
- future reverse-proxy capacity;
- no dependence on GitHub Pages source-directory limitations.

The site remains static-first. No CMS, database or Node runtime is required on the production server to serve a release.

## Caddy

Server template:

```text
deploy/vps/Caddyfile
```

It currently provides:

- static file serving from `/srv/vital-vibe/current` by default;
- zstd/gzip encoding;
- conservative no-cache policy for HTML/default responses;
- one-day cache for static assets with non-hashed filenames;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- permanent redirects for historical project/gallery URLs.

Caddy automatic HTTPS is the intended TLS mechanism after DNS points to the VPS and ports 80/443 are reachable.

Do **not** enable long-lived HSTS before the first production cutover is verified.

## VPS Release Bundle

Builder:

```bash
node tools/deploy/build-vps-bundle.mjs
```

Output:

```text
.deploy-dist/
```

The bundle contains:

- generated `site-next` contents at deployment root;
- generated `sitemap.xml` and `llms.txt`;
- `robots.txt`;
- logo and current project/capability media directories;
- temporary legal/runtime compatibility (`aviso-legal.dc.html`, `support.js`);
- `DEPLOYMENT_COMMIT` with the exact source commit.

The legacy root `index.html` is explicitly excluded.

Validator:

```bash
node tools/deploy/validate-vps-bundle.mjs
```

It checks:

- the homepage is the generated `site-next` homepage, not the legacy runtime;
- every sitemap route exists in the bundle;
- every local HTML `href`/`src` resolves;
- canonical/sitemap origin remains `https://vitalvibeconstruction.com`;
- robots points to the production sitemap;
- no public `site-next/` path leaks;
- required discovery/legal/runtime compatibility files exist.

## CI Result

Workflow:

```text
VPS bundle check
```

First run on commit `822c508d56ce36c03d7e878bff5785b31f89ef29`:

- conclusion: success;
- canonical project checks: success;
- tracked generated-file diff: clean;
- VPS bundle build: success;
- VPS bundle validation: success;
- tar packaging: success;
- artifact upload: success;
- artifact name: `vps-site-bundle`;
- artifact size: 47,934,769 bytes;
- artifact digest: `sha256:bede9381bcc65554d9a143676a66f92bc6f8bf7e82bf439da6e007f60ba8cd04`.

The workflow has no SSH secrets and no deployment step.

## Release / Rollback Model

Server layout:

```text
/srv/vital-vibe/
  current -> /srv/vital-vibe/releases/<release-id>
  releases/
    <release-id>/
```

Install a release with:

```bash
deploy/vps/install-release.sh vps-site-bundle.tgz <release-id>
```

Rollback with:

```bash
deploy/vps/rollback-release.sh <previous-release-id>
```

Both switch the `current` symlink atomically. A normal application rollback therefore requires no DNS change.

## Historical Redirects

Current Caddy template prepares HTTP 301 redirects:

- `/projects.html` -> `/projects/`
- `/proyecto-1.html` -> `/projects/estudio-reformado-barcelona/`
- `/proyecto-2.html` -> `/projects/piso-reformado-barcelona/`
- old tier gallery `.dc.html` URLs -> `/gallery/`

Before production cutover, verify old project mappings against current live behavior / Search Console if available.

## DNS Cutover Strategy

Do not change DNS until the VPS is provisioned and smoke-tested.

Before cutover:

1. record current apex and `www` DNS records;
2. record current GitHub Pages custom-domain state;
3. lower relevant DNS TTL ahead of migration if possible;
4. confirm VPS IPv4 and IPv6 status;
5. confirm firewall/ports 80 and 443;
6. install a validated release and test it before public DNS changes;
7. keep GitHub Pages intact as hosting rollback.

At cutover:

1. point apex A record to the VPS IPv4;
2. only add/change AAAA if IPv6 is verified end-to-end;
3. configure `www` only after its DNS/redirect policy is confirmed;
4. start/reload Caddy;
5. wait for public TLS provisioning;
6. verify all canonical routes and historical 301 redirects over HTTPS.

If VPS cutover itself fails, restore the recorded GitHub Pages DNS records. Do not rewrite canonical URLs during rollback.

## SEO / AEO Matrix

Top content priorities remain unchanged:

1. existing `/servicios/reformas-integrales-barcelona/`;
2. proposed `/guias/precio-reforma-integral-barcelona/`;
3. proposed `/servicios/cocinas-barcelona/`;
4. proposed `/servicios/banos-barcelona/`;
5. proposed `/servicios/electricidad-barcelona/`.

Do not start Wave 1 public route expansion until hosting/cutover mechanics are clear enough to deploy safely.

## Active Stage

The repository-side VPS migration preparation is complete enough for a real server smoke test.

Next required input is **non-secret VPS information**:

- Linux distribution/version;
- public IPv4;
- whether IPv6 is enabled;
- SSH username and port;
- whether Caddy is already installed;
- DNS provider and current records relevant to apex and `www`.

Do not commit private SSH keys, passwords or provider API tokens.

Once a VPS exists, first production-adjacent operation should be a **manual artifact upload + smoke test**, not automatic GitHub-to-VPS deployment. Add protected automated deployment only after the first cutover/rollback path is proven.

## Deferred

El Raval technical photographs remain deferred and non-blocking for deployment/SEO work.

GitHub Pages Actions remains a documented fallback only. Do not add `actions/deploy-pages` while VPS is the selected target.

## Non-Negotiable Constraints

- Do not edit `support.js`.
- Do not evolve legacy entrypoints.
- Do not bypass the Knowledge Repository.
- Do not hand-edit generated output as a substitute for its source/builder.
- Do not duplicate business content between builders and tables.
- Do not activate speculative routes from the SEO/AEO matrix.
- Do not deploy from pull requests.
- Do not add production SSH secrets before a real host exists and its host key can be pinned.
- Do not use `StrictHostKeyChecking=no` in future deploy automation.

## Verification

After content, route, builder, generated-output, structural or deployment changes run:

```bash
node tools/checks/run.mjs
node tools/deploy/build-vps-bundle.mjs
node tools/deploy/validate-vps-bundle.mjs
```

Tracked generated projections must remain clean.
