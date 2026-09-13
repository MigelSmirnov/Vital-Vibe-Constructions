# VPS preparation and pre-DNS acceptance — 2026-09-13

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
