# HANDOFF

Version: 31
Updated: 2026-09-08T20:59:26Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail belongs in commits and architecture artifacts.

## Bathroom location privacy — 2026-09-08

- Owner agreed to use only Badalona in the site. Removed street and house number from active content records, draft text/metadata, media notes and current handoff records, then rebuilt all generated pages and the release bundle. Stable project/media IDs and URL remain unchanged.
- Verified draft validation, full checks and VPS bundle; no exact address remains in active tracked text or the bundle. Git history was not rewritten, and hosting was not redeployed.
- Integrated the agreed Russian editorial direction into the Spanish reading source: narrative title, mirror outlet height/two additional tile rows, concrete demolition heading and four-days/big-bag ending. The matching technical clarification is also in the Project record. All six photos remain; the repetitive FAQ was removed from this draft.
- The user requested a viewable article. Refresh the existing owner-private review Site from the validated release plus reading pages; public hosting remains separate.

## Bathroom project linked from the homepage — 2026-09-08

- Owner requested the same homepage-to-project flow as El Raval. The existing large bathroom feature now links through its photo, title and CTA to `/projects/traslado-lavabo-toallero-badalona/`; it is excluded from the adjacent compact list to avoid a duplicate card.
- Added `project-bathroom-ponent-badalona` with confirmed location Badalona, four working days, work scope and all six existing Media IDs. Their project ownership now resolves through the Knowledge Repository. The public location is limited to the municipality at the owner’s request.
- Added `labour_cost_eur` as a separate validated amount, displayed as labour on the homepage and project page; EUR 1,100 is not treated as an estimated total with materials. Preserved the cost note including rubbish removal and the final image's AI-retouch disclosure.
- The route contract owns the new Project page; the project index, sitemap and llms.txt are rebuilt. The separate article draft remains noindex. The legacy gallery still covers all 39 contract photos.
- Verified 30 Knowledge tests, full checks, VPS bundle, four unique homepage projects per language, six project images and eight sitemap routes. No browser visual QA or hosting redeployment was performed.

## Bathroom article with photographs — 2026-09-08

- The owner imported the prepared media package through Termux and pushed commit `587b298`. Synced that commit before authoring; all original photographs and Media IDs are preserved.
- Added the Spanish case draft `traslado-lavabo-toallero` (`VVC-ART-003`) and generated `sandbox/articles/reading/traslado-lavabo-toallero-cuatro-dias/index.html` using the existing reading builder and stylesheet. The sandbox panel links to it.
- Six sections cover the task, utilities, wall support, tiling, result and cost. All five work photographs plus the existing finished image are included. The finished image's prior AI retouch is disclosed in its caption.
- Four working days and EUR 1,100 for labour with rubbish removal come from the owner's account. The owner confirmed the location as Badalona. Work date, materials, VAT and the precise hygienic-shower scope remain editorial unknowns; no compliance or pressure-test results are inferred from photographs.
- Verified three drafts, image identity/dimensions/alt text, reading anchors/noindex, 29 Knowledge tests, full checks and VPS bundle. Existing public projections remain unchanged. No public Article route was activated and no Site was redeployed. Browser visual QA was not performed.
- Next: review the case text/layout with the owner, then handle public Article promotion through the existing content and route contracts. Two Termux stashes remain on the owner's device; neither was applied or dropped.

## Article reading sample — 2026-09-08

- Selected the more complete Spanish painting draft (nine sections) for the approved lighter technical article direction. Added a generated sandbox-only reading sample with readable continuous text, compact technical metadata, numbered sections, a note, responsive contents and native FAQ disclosures.
- Kept the original project-sheet preview for comparison. Internal publication-status FAQ is marked editorial-only; article body and prices are unchanged drafts pending editorial/factual approval.
- Source: `tools/articles/build-reading-preview.mjs`, `sandbox/articles/reading.css`; opt-in lives in the draft manifest. Article sandbox CI checks reproducibility.
- Verified both drafts, generated sample headings/anchors/styles/noindex, all 29 Knowledge tests and full checks. Public generated outputs, routes and discovery files stayed unchanged. Browser visual QA remains unavailable; sample is copied only to the private review Site.

## One El Raval property — 2026-09-08

- The owner confirmed that the kitchen and toilet-door homepage cards show the same property. Consolidated the two legacy project records under `project-studio-renovation-barcelona`, preserving the detailed El Raval case study and all 16 image records; kitchen photo leads the case.
- Homepage, project index, service references, gallery ownership and discovery files now describe three projects. All 39 legacy gallery images remain covered.
- The former `/projects/piso-reformado-barcelona/` address is now a generated noindex redirect page; its permanent redirect is also prepared in the VPS Caddy configuration. The route contract owns this alias and validation checks it. Original public hosting remains unchanged.
- Verified all 29 Knowledge tests, full checks, seven sitemap routes, bundle validation, three cards in each homepage language and 16 unique photos in the merged project. Browser QA remains unavailable; owner-private review copy is updated separately.

## Project card alignment — 2026-09-08

- Fixed the uneven homepage project-card widths shown in the user's mobile screenshot. The homepage flex column inherited `align-items: start` from the shared grid style; explicitly stretching its children gives every card the same width and aligns their image/text boundaries.
- Changed only the scoped homepage source CSS and rebuilt the generated stylesheet. ES/EN/RU share this fix; secondary-page styles are unchanged.
- Full checks and all 29 Knowledge tests passed; the VPS bundle validated. Browser visual QA remains unavailable in this environment.
- A separate owner-private Sites copy supports user visual review; the original production site and main branch are unchanged.

## Local preview attempt — 2026-09-08

- Inspected commit `d0b95d78899c49c504131e5fe2f4fb043034011a` in a local checkout at the user's request.
- Re-ran all project checks: 29/29 Knowledge tests, zero content errors, five existing audit warnings; generated tracked files remained unchanged.
- Built and validated the VPS bundle: eight sitemap routes and eleven HTML files.
- Browser QA remains incomplete: the supervised session-preview service is unavailable in this environment (missing daemon mailbox). No desktop/mobile rendering or interaction result is claimed.
- Removed the temporary preview dependency/configuration experiment. Application source and production are unchanged. This note is local; no GitHub commit or push was performed.
- Static review: homepage image references total about 6.36 MB; the bathroom PNG (2.14 MB) and one project thumbnail source (1.83 MB) are the largest. Below-fold images use lazy loading. Image optimization and visual review remain pending.

## Homepage Design — 2026-09-08

The active user task is now homepage design. The first slice follows the supplied graphite/gold reference: split hero with the supplied kitchen image, compact header with ES/EN/RU switching and native menu, six service disclosures, a retouched bathroom feature next to the four existing projects, and coordinated pricing/contact/footer styling.

- Author homepage styles/interactions in `tools/site-next/home.css` and `home.js`; the builder copies them into `site-next`. Existing detail pages do not load these files.
- Hero copy/dimensions/caption live in the Site record. `site.featuredMediaId` resolves through the Knowledge Repository.
- Kitchen is an interior concept, not attributed to a completed project. Bathroom is service-owned media with no invented project/location. Source notes are in `assets/home/README.md`.
- All three homepages were rebuilt; article drafts stay sandbox-only. Production has not been deployed.
- Verified locally: 29 Knowledge tests, full checks, ES/EN/RU heading/navigation/anchor/image checks, source/output CSS and JS equality, and VPS bundle validation. Content audit retains the same five baseline warnings and zero errors. Browser visual QA was not performed.
- Next: review layout and crops with the user, then refine the design. VPS tasks below remain a separate pending track.

## Current Status

`agent/architecture-sandbox` is on a reproducible green architecture baseline with VPS migration and security preparation in place.

Current capabilities:

- generated Spanish, English and Russian homepages with crawlable language switching and hreflang alternates;
- validated Knowledge Repository architecture;
- eight generated public HTML routes in `site-next`;
- complete 39/39 legacy media coverage;
- ranked 15-page SEO/AEO query-to-page matrix;
- engineering-style article sandbox with stable draft document numbers, drawing-sheet framing, title blocks, sheet navigation and FAQ notes;
- VPS + Caddy selected as the production hosting direction;
- deterministic VPS release bundle produced and validated in PR CI;
- atomic server release/rollback scripts;
- explicit VPS security hardening plan;
- production, DNS, GitHub Pages settings and canonical URLs remain unchanged.

The article technical-document system is intentionally sandbox-only. It renders existing draft records from `sandbox/articles/drafts/` and does not add Article entities, public article routes, sitemap entries or `llms.txt` entries. `VVC-ART-001` and `VVC-ART-002` are stable presentation identifiers stored in the draft manifest rather than derived from ordering.

The multilingual rollout is intentionally staged. The homepage is available in ES at `/`, EN at `/en/`, and RU at `/ru/`. Project, gallery, service and article routes still require localized content records and route contracts before they can be published as complete language variants.

Key artifacts:

- `sandbox/articles/README.md`
- `sandbox/articles/drafts/index.json`
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

For article-sandbox-only changes run or rely on `.github/workflows/article-sandbox.yml`:

```bash
node tools/articles/validate-drafts.mjs
```

After content, route, builder, generated-output, structural, deployment or security changes run:

```bash
node tools/checks/run.mjs
node tools/deploy/build-vps-bundle.mjs
node tools/deploy/validate-vps-bundle.mjs
```

Tracked generated projections must remain clean.
