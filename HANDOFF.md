# HANDOFF

Version: 20
Updated: 2026-09-02T06:50:00Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail belongs in commits and architecture artifacts.

## Current Status

`agent/architecture-sandbox` is on a reproducible green architecture baseline with VPS migration and security preparation in place.

Current capabilities:

- generated Spanish, English and Russian homepages with crawlable language switching and hreflang alternates;
- validated Knowledge Repository architecture;
- eight generated public HTML routes in `site-next`;
- complete 39/39 legacy media coverage;
- ranked 15-page SEO/AEO query-to-page matrix;
- VPS + Caddy selected as the production hosting direction;
- deterministic VPS release bundle produced and validated in PR CI;
- atomic server release/rollback scripts;
- explicit VPS security hardening plan;
- production, DNS, GitHub Pages settings and canonical URLs remain unchanged.

The multilingual rollout is intentionally staged. The homepage is available in ES at `/`, EN at `/en/`, and RU at `/ru/`. Project, gallery, service and article routes still require localized content records and route contracts before they can be published as complete language variants.

Key artifacts:

- `architecture/seo-aeo-query-page-matrix.md`
- `architecture/vps-migration-plan.md`
- `architecture/vps-security-plan.md`
- `architecture/production-deployment-plan.md` — GitHub Pages fallback evaluation
- `tools/deploy/build-vps-bundle.mjs`
- `tools/deploy/validate-vps-bundle.mjs`
- `deploy/vps/Caddyfile`
- `deploy/vps/install-release.sh`
- `deploy/vps/rollback-release.sh`
- `.github/workflows/vps-bundle-check.yml`

## Production Hosting Decision

Long-term target: **VPS + Caddy**.

GitHub remains the source-control, validation and artifact-build system. The VPS serves only validated static release bundles.

```text
Knowledge Repository
        -> builders/checks
        -> site-next + sitemap.xml + llms.txt
        -> .deploy-dist
        -> vps-site-bundle.tgz
        -> /srv/vital-vibe/releases/<release-id>/
        -> /srv/vital-vibe/current
        -> Caddy / protected edge
        -> https://vitalvibeconstruction.com
```

The production web tier requires no CMS, database, PHP runtime or Node application server.

## Security Model

The static architecture removes the most common CMS/application attack surfaces, including plugin exploits, database injection paths and browser-accessible admin login brute force.

Remaining material boundaries are:

1. VPS operating system and SSH;
2. Caddy/network exposure;
3. DNS/domain-account integrity;
4. upstream DDoS/origin protection;
5. GitHub/CI deployment credentials after automation is eventually enabled.

Detailed plan:

```text
architecture/vps-security-plan.md
```

### No public admin panel

Do not introduce a hosting/CMS admin panel without a real requirement.

Caddy's configuration API is not a browser admin UI. The Caddyfile now explicitly binds it to:

```text
127.0.0.1:2019
```

Never expose port 2019 through host or provider firewall rules.

### Caddy baseline hardening

`deploy/vps/Caddyfile` now includes:

- `Server` response header removal;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `X-Frame-Options: DENY`;
- restrictive `Permissions-Policy` for camera, microphone and geolocation;
- compression and conservative cache controls;
- HTTP 301 redirects for known historical URLs.

Banner hiding reduces passive fingerprinting only; it is not treated as a primary security control.

Do not enable HSTS before first production HTTPS and rollback behavior are verified.

Do not enforce a CSP blindly. Inventory inline JSON-LD/external resources first and test a report-only policy before enforcement.

### SSH baseline

Preferred:

- non-root admin/deploy account;
- public-key authentication only;
- `PasswordAuthentication no`;
- `PermitRootLogin no`;
- private/VPN management path such as Tailscale/WireGuard where practical;
- provider console/rescue access retained as break-glass recovery.

Fail2ban is optional secondary protection if SSH remains public. It is not a substitute for keys-only authentication and firewall restrictions.

### Firewall baseline

Use provider firewall plus host firewall where available.

Direct-origin mode allows only required HTTP/HTTPS and the approved SSH management path. Caddy admin port 2019 remains loopback-only.

If Cloudflare Tunnel is selected, the preferred final state can expose no public inbound web ports and no public SSH when management also uses a private VPN path.

### Updates and filesystem permissions

Use a supported LTS Linux release and automatic security updates.

Release directories are immutable after activation. Caddy receives read-only access to deployed HTML/assets; the deploy user owns release creation and the `current` symlink.

## DDoS / Origin Protection

Caddy and a host firewall cannot stop a volumetric attack that saturates the VPS/provider uplink before traffic reaches the server.

Before cutover choose one explicit edge model:

1. provider-protected direct Caddy — simplest, public origin IP;
2. Cloudflare proxied DNS + restricted origin — strong practical compromise;
3. Cloudflare Tunnel + private SSH — smallest public origin attack surface if Cloudflare dependency is acceptable.

For this static site, option 3 is the strongest practical isolation; option 2 is the simpler strong default.

If origin hiding is desired, do not leak the new VPS IP through temporary DNS records, public test hostnames, mail infrastructure, repository files or documentation.

## Domain / DNS Security

Before migration:

- strong MFA on registrar and DNS provider;
- unique credentials;
- registrar/domain transfer lock;
- review recovery channels;
- DNSSEC where supported and operationally understood;
- export the full pre-cutover DNS zone;
- use scoped least-privilege API tokens only if DNS automation is added later.

Domain/DNS account takeover can bypass every VPS control, so this is a first-class part of the security model.

## VPS Release Bundle

Build:

```bash
node tools/deploy/build-vps-bundle.mjs
node tools/deploy/validate-vps-bundle.mjs
```

The bundle contains the generated site, discovery files, logo/media assets, required temporary legal/runtime compatibility and `DEPLOYMENT_COMMIT`. Legacy root `index.html` is excluded.

`VPS bundle check` packages this as `vps-site-bundle.tgz` and uploads a short-lived CI artifact. The workflow has read-only repository permissions and no SSH/deployment credentials.

The first successful bundle artifact was approximately 47.9 MB and passed canonical checks, generated-file reproducibility, route/asset validation and packaging.

## Release / Rollback

```text
/srv/vital-vibe/
  current -> /srv/vital-vibe/releases/<release-id>
  releases/
    <release-id>/
```

Install:

```bash
deploy/vps/install-release.sh vps-site-bundle.tgz <release-id>
```

Rollback:

```bash
deploy/vps/rollback-release.sh <previous-release-id>
```

Normal application rollback is an atomic symlink switch and does not require a DNS change.

GitHub Pages remains available as a hosting-level rollback until the VPS architecture is proven stable.

## Active Stage

Repository-side VPS and security preparation is complete enough for a real server smoke test.

Next required input is non-secret VPS/DNS information:

- Linux distribution/version;
- public IPv4;
- whether IPv6 is enabled;
- SSH username and port;
- whether Caddy is installed;
- DNS provider;
- current apex and `www` DNS records;
- chosen edge/DDoS mode: direct provider protection, Cloudflare proxy, or Cloudflare Tunnel.

Do not commit or paste private SSH keys, passwords, recovery codes or provider API tokens.

The first production-adjacent deployment remains **manual artifact upload + smoke test before DNS cutover**. Automatic GitHub-to-VPS deployment is deferred until one cutover and rollback are proven.

## SEO / AEO

Top priorities remain:

1. existing `/servicios/reformas-integrales-barcelona/`;
2. proposed `/guias/precio-reforma-integral-barcelona/`;
3. proposed `/servicios/cocinas-barcelona/`;
4. proposed `/servicios/banos-barcelona/`;
5. proposed `/servicios/electricidad-barcelona/`.

Do not activate Wave 1 routes until hosting and cutover are ready.

## Non-Negotiable Constraints

- Do not edit `support.js`.
- Do not evolve legacy entrypoints.
- Do not bypass the Knowledge Repository.
- Do not hand-edit generated output instead of its source/builder.
- Do not activate speculative routes from the SEO/AEO matrix.
- Do not deploy from pull requests.
- Do not add production SSH secrets before a real host exists and its host key can be pinned.
- Do not use `StrictHostKeyChecking=no` in future automation.
- Do not expose Caddy admin API publicly.
- Do not add a CMS/admin panel merely for deployment convenience.
- Do not enable HSTS before the initial HTTPS/rollback path is verified.

## Verification

After content, route, builder, generated-output, structural, deployment or security changes run:

```bash
node tools/checks/run.mjs
node tools/deploy/build-vps-bundle.mjs
node tools/deploy/validate-vps-bundle.mjs
```

Tracked generated projections must remain clean.
