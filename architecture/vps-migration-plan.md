# VPS Migration Plan

Status: selected production direction, production unchanged
Updated: 2026-08-20
Branch: `agent/architecture-sandbox`

## Decision

Use a VPS as the target production host for `vitalvibeconstruction.com` instead of making GitHub Pages the long-term runtime.

GitHub remains the source-control, validation and release-artifact system. The VPS only serves validated release bundles.

Target flow:

```text
Knowledge Repository
        -> builders/checks
        -> site-next + sitemap.xml + llms.txt
        -> .deploy-dist
        -> vps-site-bundle.tgz
        -> /srv/vital-vibe/releases/<release-id>/
        -> /srv/vital-vibe/current symlink
        -> Caddy
        -> https://vitalvibeconstruction.com
```

Production is not changed by this plan.

## Why VPS

A VPS gives the migration capabilities the static Pages deployment lacks:

- real HTTP 301 redirects for historical URLs;
- explicit cache and security headers;
- deterministic document root;
- atomic release switching and rollback;
- server logs;
- future reverse-proxy capacity without restructuring the public site;
- no requirement to copy generated HTML into repository root.

The site remains static-first. Moving to a VPS does not mean introducing a dynamic CMS or application server.

## Web server

Use Caddy for the first production setup.

Repository template:

```text
deploy/vps/Caddyfile
```

Reasons:

- simple static file serving;
- automatic HTTPS and certificate renewal for configured public domains;
- automatic HTTP -> HTTPS redirect;
- native 301 redirects;
- gzip/zstd encoding;
- straightforward header policy;
- no separate certbot lifecycle.

Do not enable long-lived HSTS during the initial cutover. Add it only after HTTPS and rollback behavior have been verified in production.

## Release layout

Default server layout:

```text
/srv/vital-vibe/
  current -> /srv/vital-vibe/releases/<release-id>
  releases/
    <release-id>/
      index.html
      projects/
      gallery/
      servicios/
      styles.css
      sitemap.xml
      robots.txt
      llms.txt
      DEPLOYMENT_COMMIT
      ...assets
```

Caddy serves:

```text
/srv/vital-vibe/current
```

A release is installed into a new immutable directory first. The live site changes only when the `current` symlink is atomically replaced.

Repository helpers:

```text
deploy/vps/install-release.sh
deploy/vps/rollback-release.sh
```

## Release artifact

CI builds:

```text
vps-site-bundle.tgz
```

from the ephemeral directory:

```text
.deploy-dist/
```

The bundle contains:

- contents of `site-next/` at bundle root;
- generated `sitemap.xml`;
- generated `llms.txt`;
- `robots.txt`;
- `VVC_primary_logo.svg`;
- all currently referenced project/capability asset directories;
- temporary `aviso-legal.dc.html` + `support.js` compatibility;
- `DEPLOYMENT_COMMIT` containing the exact Git commit.

The legacy root `index.html` is never copied into the VPS bundle.

## CI-only preparation

Workflow:

```text
.github/workflows/vps-bundle-check.yml
```

It has read-only repository permissions and performs no deployment.

Steps:

1. run canonical project checks;
2. require tracked generated projections to remain clean;
3. build `.deploy-dist`;
4. validate bundle routes and assets;
5. create `vps-site-bundle.tgz`;
6. upload the bundle as a short-lived GitHub Actions artifact.

Current first successful run:

- workflow: `VPS bundle check`
- run number: `1`
- head commit: `822c508d56ce36c03d7e878bff5785b31f89ef29`
- conclusion: success
- artifact: `vps-site-bundle`
- artifact size: 47,934,769 bytes
- artifact digest: `sha256:bede9381bcc65554d9a143676a66f92bc6f8bf7e82bf439da6e007f60ba8cd04`

## Bundle validation

Validator:

```text
tools/deploy/validate-vps-bundle.mjs
```

It requires:

- generated homepage rather than legacy runtime homepage;
- stylesheet, logo and discovery files;
- all sitemap routes to exist inside the bundle;
- sitemap origin to remain `https://vitalvibeconstruction.com`;
- `robots.txt` to reference the production sitemap;
- every local HTML `href` and `src` to resolve inside the bundle;
- no public `site-next/` path leakage;
- legal/runtime compatibility files to be present while that compatibility mode is enabled.

## Historical redirects

Caddy currently prepares permanent redirects:

```text
/projects.html                -> /projects/
/proyecto-1.html              -> /projects/estudio-reformado-barcelona/
/proyecto-2.html              -> /projects/piso-reformado-barcelona/
/galeria-economica.dc.html    -> /gallery/
/galeria-estandar.dc.html     -> /gallery/
/galeria-premium.dc.html      -> /gallery/
```

Before cutover, confirm the project mappings against Search Console/history. Do not silently change these mappings after production launch.

## VPS prerequisites

Before any DNS change, prepare a Linux VPS with:

- a non-root deploy/admin account;
- SSH key authentication;
- firewall allowing SSH plus TCP 80 and 443;
- Caddy installed as a managed service;
- `/srv/vital-vibe/releases` owned or writable by the deployment account;
- Caddy able to read `/srv/vital-vibe/current`;
- enough disk for multiple ~50 MB releases plus future growth;
- correct server time/NTP.

Keep the site static. No database, Node runtime or package installation is required on the production server to serve a release.

## Pre-DNS smoke test

Before pointing the public domain to the VPS:

1. upload a CI-produced `vps-site-bundle.tgz`;
2. install it as a release without changing DNS;
3. verify `current` points to that release;
4. serve the directory temporarily on a non-public/test port or with a local host mapping;
5. check homepage, eight canonical routes, images, CSS, sitemap and robots;
6. validate the Caddyfile with the installed Caddy binary;
7. do not rely on public ACME TLS until DNS points to the VPS.

## DNS cutover

### Before cutover

1. record the complete current DNS zone relevant to the apex and `www`;
2. record the current GitHub Pages custom-domain state;
3. reduce DNS TTL for the records that will change, preferably ahead of the migration window;
4. confirm the VPS public IPv4 address and IPv6 only if IPv6 is actually configured end-to-end;
5. confirm ports 80 and 443 reach Caddy;
6. keep GitHub Pages intact as the rollback target.

### Cutover

1. point the apex A record to the VPS IPv4 address;
2. add/change AAAA only if VPS IPv6 is confirmed working;
3. configure `www` only after its desired redirect policy and DNS are confirmed;
4. start/reload Caddy with `deploy/vps/Caddyfile`;
5. allow Caddy to obtain the public certificate;
6. verify HTTPS before considering the migration complete.

Caddy automatic HTTPS requires the public DNS name to resolve to the server and ports 80/443 to be reachable.

## Production verification

Immediately verify:

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

Verify additionally:

- HTTP redirects to HTTPS;
- historical redirects return HTTP 301 and land on the intended canonical route;
- canonical URLs remain on `https://vitalvibeconstruction.com`;
- all assets load;
- mobile rendering has no horizontal overflow;
- `DEPLOYMENT_COMMIT` matches the intended release;
- Caddy logs contain no systematic 404/5xx patterns.

## Rollback

### Application rollback

If the current release is bad but the VPS itself is healthy:

```text
deploy/vps/rollback-release.sh <previous-release-id>
```

This atomically changes the `current` symlink back to an existing release. No DNS change is required.

### Hosting rollback

If the VPS/cutover itself fails:

1. restore the recorded pre-migration DNS records pointing to GitHub Pages;
2. verify the legacy site returns;
3. leave the failed VPS deployment available for debugging but remove it from public DNS;
4. do not rewrite canonical URLs during the rollback window.

The old GitHub Pages site must not be dismantled until the VPS has been stable and Search Console/404 behavior has been reviewed.

## Future CI deployment

Do not add automatic SSH deployment until a real VPS exists and host identity is known.

When enabled later, production deployment should use:

- a protected GitHub `production` environment;
- explicit/manual approval if available;
- a dedicated deploy user with limited filesystem permissions;
- pinned SSH host key (`known_hosts`), never `StrictHostKeyChecking=no`;
- a deployment key scoped to this server/account;
- artifact upload followed by `install-release.sh`;
- no build tools required on the VPS;
- deployment only from reviewed `main` commits.

Initial production cutover should preferably be a manual artifact upload so DNS, TLS and rollback can be observed directly before automation is introduced.

## Relationship to the GitHub Pages plan

`architecture/production-deployment-plan.md` documents the previously evaluated GitHub Pages artifact approach. It remains a valid fallback hosting option, but VPS is now the selected production direction.

Do not implement `actions/deploy-pages` while VPS remains the selected target.

## Next step

Provision or identify the VPS and collect only the non-secret deployment facts needed for configuration:

- Linux distribution/version;
- public IPv4;
- whether IPv6 is enabled;
- SSH username and port;
- whether Caddy is already installed;
- current DNS provider/records relevant to apex and `www`.

Secrets such as private SSH keys must not be committed to the repository.
