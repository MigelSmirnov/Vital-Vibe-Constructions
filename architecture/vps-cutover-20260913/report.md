# VPS preparation and pre-DNS acceptance — 2026-09-13

## Final production state — 2026-09-13

**Website cutover completed.** Public `https://vitalvibeconstruction.com/DEPLOYMENT_COMMIT` returns `fb31a282e0204bc37d3ced1982675fef0332573f` with normal certificate verification and ordinary DNS. The immutable archive/checksum and release ID below are unchanged.

Owner changed DNS in DonDominio: replaced the four GitHub Pages apex A records with `152.228.139.236`, and www CNAME with `vitalvibeconstruction.com.`. Both authoritative servers confirmed the final state. No apex AAAA was added. App, all other subdomains and MX/TXT were preserved except the two owner-added ACME TXT challenges. Three owner screenshots of the original zone are retained in the private VPS backup directory (not published in Git).

Production TLS terminates at existing nginx, proxying the dedicated Caddy container. All pre-existing nginx files were compared with the backup and remained identical. Certificate expiration is 2026-12-12. Certbot reconfigure passed a simulated renewal with `--webroot -w /var/lib/letsencrypt --preferred-challenges http --run-deploy-hooks`; renewal config now has `authenticator = webroot` and `pref_challs = http-01`. The active twice-daily Certbot timer and dedicated certificate-scoped nginx reload hook provide automatic renewal. Manual DNS challenges are no longer needed. An initial reconfigure attempt retained DNS preference and failed; explicitly selecting HTTP corrected it before final acceptance.

Public acceptance: 23 sitemap routes plus seven support/assets paths returned 200; nine historical redirects matched exact 301 targets; HTTP→HTTPS and www→apex preserved paths. Public Chromium checks passed for seven targets at three widths (21 pages) and nine solar language/viewport control cases, without broken images, JS errors or horizontal overflow. All three languages are covered. Full painting and renovation-cost section/photo counts were rechecked on the public site. See `production-smoke.json`, `production-browser.json` and `dns-production.txt`.

Caddy's sampled logs showed no 5xx or error messages. 404s were .env probes and the existing missing favicon; no site content modification was made to the pinned artifact. Planner `/manual` remained byte-identical. GitHub Pages source `main:/`, custom domain, build type and HTTPS-enforced setting were rechecked and unchanged; main and PR #6 remain untouched.

Rollback: restore the four original apex A addresses and www CNAME recorded below to return traffic to unchanged GitHub Pages. There is no older Vital Vibe VPS release to switch to. Retain release `20260913-fb31a282`, its source archive and nginx backup. No rollback was required during cutover.

Remaining operational work: the owner may delete the two temporary ACME TXT records. Shared SSH password authentication/root-key policy, provider firewall/DDoS controls, registrar safeguards and external uptime monitoring were not completed/verified here. Public migration acceptance does **not** assert that the entire security-plan checklist is closed. No shared-server access changes or reboot were performed. The nginx edge emits a Server header, so the direct-Caddy banner-removal behavior does not apply to the final edge; HTTPS hides the version.

## Historical HTTPS preparation (superseded by final state)


Owner confirmed manual DonDominio operation. Owner added the requested ACME TXT records; certificate issuance succeeded for apex and www, expiration 2026-12-12. A dedicated `/etc/nginx/sites-available/vital-vibe.conf` was installed, linked, validated and reloaded; no existing virtual host was rewritten. TLS terminates at the existing nginx edge and proxies to private Caddy, preserving other sites. Nginx sends its own Server header (HTTPS hides version); automatic Caddy ACME is not used in this topology.

Forced-IP HTTPS checks with normal certificate validation passed for 23 sitemap routes, seven support/assets paths and nine historical redirects. HTTP→HTTPS and www→apex work. Planner `/manual` remained byte-identical. `https-smoke.json` records HTTP coverage. `https-browser.json` records 21 successful HTTPS browser page checks (seven targets at three widths) and nine successful iframe control checks; no broken images, JS errors or horizontal overflow. Owner must still save the DNS zone and switch apex/www routing; public A/CNAME records are unchanged.

Initial Certbot authentication is manual DNS and does not auto-renew yet. `/etc/letsencrypt/renewal-hooks/deploy/vvc-nginx-reload` is installed and scoped to this certificate; `certbot.timer` is enabled. After both public names resolve to the VPS, run `sudo certbot reconfigure --cert-name vitalvibeconstruction.com --webroot -w /var/lib/letsencrypt --non-interactive --run-deploy-hooks` and verify successful renewal configuration. Do not leave manual renewal as the finished production state.

## Initial preparation record (historical)

Public migration is **not complete**. The pinned site is installed and verified on the VPS, behind a loopback-only Caddy listener. The public apex and www remain on GitHub Pages. No DNS record, GitHub Pages setting, main branch or existing nginx virtual host was changed.

## Release provenance

- Source: `release/vps-migration`, exact SHA `fb31a282e0204bc37d3ced1982675fef0332573f`.
- Build began from a separate clean detached checkout; both ancestry checks from task 003 passed.
- Toolchain: Node 20.20.2 (official tarball checksum checked), ImageMagick 6.9.12-98, cwebp 1.3.2, Git/Bash/tar. Build tools were unpacked under `/tmp/vvc-build-tools`; no server build toolchain was installed.
- Archive: `vps-site-bundle.tgz`, SHA-256 `e49180c37ec3dfe96390eb4162813e4f5ed02797234919e200cf768aee1d63a6`.
- `DEPLOYMENT_COMMIT` matches the source SHA in local bundle and server release. Archive hash was checked after upload.
- Only fresh `.deploy-dist` contents were archived. All 227 tar entries were checked for traversal, links and prohibited source directories. 69 WebP derivatives were generated. Tracked generated projections stayed unchanged.

## Verified results

- Canonical checks: 35/35 tests; gallery coverage 39/39; 12 published localized article pages; audit 0 errors and 5 pre-existing warnings.
- Bundle validator: 23 sitemap routes, 29 HTML files.
- Real VPS Caddy: all 23 sitemap URLs plus robots, llms, CSS, logo, legal page and commit marker returned 200; all nine configured historical redirects returned 301 with exact targets. Source/task/git probes returned 404.
- Chromium: 23 sitemap pages at widths 390, 768 and 1440, 69 checks total. No broken images, page JavaScript errors or horizontal overflow. Lazy images were awaited before assertions.
- Solar v3: same-origin iframe loaded with each of `lang=es/en/ru`; single/diagonal switch and pause/resume controls passed at all three widths. Lazy iframe was scrolled into view before assertions.
- Painting: 10 sections and two photographs; renovation-cost article: 11 sections and six photographs. Each localized catalog has four cards.
- Caddy sends SAMEORIGIN, nosniff, referrer/permissions policies, no Server header and no HSTS. Actual asset response is `public, max-age=86400`; documents use `no-cache`; gzip and WebP MIME delivery verified.
- Screenshots were inspected for desktop home and mobile solar article. This is fresh browser acceptance, not a claim of a new owner-approved baseline or new field performance measurements.

`browser-qa.json` records page and solar checks. `content-http.json` includes the total gallery `<img>` count of 40 (including its logo); the canonical content-coverage validator checks the required 39 photographs.

## Installed server state

- VPS accessed using `ubuntu`, existing SSH key and strict known-host verification; Ubuntu 24.04.4 LTS, synchronized time, about 55 GB free at inspection.
- `/srv/vital-vibe/current` -> `/srv/vital-vibe/releases/20260913-fb31a282`.
- Repository `install-release.sh` installed the archive only after staging acceptance. Directories 0755, files 0644, owned by deploy user.
- Docker container `vvc-site`, Caddy image pinned to existing digest `caddy@sha256:af32e97399febea808609119bb21544d0265c58a02836576e32a2d082c262c17` (existing 2.8 image). No image upgrade is claimed.
- Runtime UID/GID 65534; read-only rootfs/release mount; no-new-privileges; only NET_BIND_SERVICE retained because the existing binary carries that capability; tmpfs for runtime state.
- Listener `127.0.0.1:8890`, admin `127.0.0.1:2019`, verified with `ss`.
- Restart policy `unless-stopped`; Docker logs limited to 10 MB × 3 files.
- Runtime config: `/home/ubuntu/vvc-migration-fb31a282/Caddyfile`, copied here as `Caddyfile.loopback`. Relative to the pinned template it adds explicit loopback binding, bounded-container access logging and disjoint document/asset cache matchers. The latter resolves a real header precedence conflict found through Caddy. Site artifact unchanged.
- Existing nginx continues owning public 80/443. Existing virtual-host checksums were preserved. Planner `/manual` returned 200 and its HTML was byte-identical before/after.

## Backup and rollback

Private server directory `/home/ubuntu/vvc-migration-fb31a282/` contains the archive, helper scripts, staging copy and DNS/Pages evidence. `backup/nginx-before.tgz` preserves `/etc/nginx`, with mode 0600 in a mode-0700 directory; do not publish that backup.

No previous Vital Vibe VPS release existed, so no prior symlink release is available. Hosting rollback is the still-live GitHub Pages site, source `main:/`, custom domain and HTTPS settings unchanged.

Recorded authoritative apex A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; no apex AAAA returned. www CNAME: `migelsmirnov.github.io.`. TTL observed: 60 seconds. See `dns-before.txt` and `github-pages-before.json`. These DNS queries are **not a full authenticated zone export**. MX/TXT and app records were neither changed nor included in any planned mutation.

To inspect the prepared release from an authorized workstation:

```bash
ssh -N -L 8890:127.0.0.1:8890 ubuntu@152.228.139.236
# Open http://127.0.0.1:8890 in the local browser.
```

## Remaining blockers and continuation

1. No DonDominio session/API configuration was found. Obtain the existing access method, export the full zone, verify registrar safeguards and record the exact planned apex/www mutation. Do not treat the public DNS query snapshot as a complete zone backup.
2. Direct Caddy on 80/443 would conflict with existing nginx sites. `nginx-vital-vibe.conf.pending` is a proposed apex/www TLS front end to private Caddy, **not enabled**. It requires a certificate and production validation. TLS would then be managed by existing Certbot/nginx, rather than Caddy ACME; nginx also emits its own Server header. Reconcile these differences with the migration/security plan before activation. Preserve all existing site configurations and app DNS.
3. Actual SSH configuration still reports `passwordauthentication yes` and `permitrootlogin without-password`. Automatic security updates are enabled, but a reboot is pending. Host firewall is active and allows existing services; provider firewall/DDoS protection, recovery access and registrar MFA were not verified. No shared-server hardening or reboot was performed.
4. After the above are resolved, enable/test the apex edge, perform the authorized DNS switch, issue/verify public TLS, verify HTTP→HTTPS and www→apex, rerun production route/image/language/iframe checks, and update HANDOFF/session-state. Keep Pages intact.

Do not report `fb31a282` as publicly published until the main domain serves its `DEPLOYMENT_COMMIT` over verified HTTPS.
