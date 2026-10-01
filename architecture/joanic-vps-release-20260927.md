# Joanic VPS release — 2026-09-27

## Subsequent card layout correction

The owner reported a malformed preview after the initial release. The previous checks missed the internal grid error: a source element inside display:contents occupied a grid cell. PR #12 fixes this, preserves the photo aspect ratio, enlarges desktop previews and versions homepage CSS. Production now serves `765856d7e113d83dd4d6e2c8f0a559e86a6e9df8` / `20260927-765856d`. Archive SHA-256: `d2b78bead4637091b71bfd459531f7d22379e2555b0aa86ea7cb811a4925c732` (`/home/ubuntu/vital-vibe-vps-card-fix.tgz`).

The new regression fails on the old release and passes all 15 ES/EN/RU × five-width cases locally and publicly. Mobile/desktop screenshots inspected; 43 canonical tests, 40-route/44-HTML bundle validation and decoding of 105 WebP files pass. All 40 public HTML responses and versioned CSS match the artifact. Immediate rollback target: `20260927-a1b83ad`, retained with its known layout defect. The rest of this document records the initial content deployment.

Published on https://vitalvibeconstruction.com following the owner's request to inspect GitHub changes and deploy from the local machine.

## Provenance

- Source: pinned `a1b83ad864b90ba5f055a6a59df1412179d14f7f`, PR #9 merge in `release/vps-migration`.
- Clean detached build; both required ancestry checks passed, and the actual previous production commit is an ancestor of this release.
- Release: `/srv/vital-vibe/releases/20260927-a1b83ad`.
- Archive: `vital-vibe-vps-a1b83ad.tgz`, SHA-256 `b34232c2ba3f4240f9bc133b0ecdec21833ed3586113c2a953cf4e6af8da3799`.
- Fresh local build using checksum-verified Node 20.20.2, ImageMagick 6.9.12.98 and cwebp 1.3.2; tools extracted under `/tmp`, without a system package change.
- This newly built archive supersedes the preparation archive checksum; no byte identity with that earlier archive is claimed.
- Production archive and embedded source SHA verified before activation with the existing `install-release.sh`.

## Acceptance

- Canonical checks: 43 tests pass, audit 0 errors / 5 existing warnings; tracked generated outputs unchanged.
- Deployment bundle: 40 sitemap routes, 44 HTML files, all 105 WebP files decoded successfully.
- Existing project browser verifier: 54 page/viewport checks pass locally and 54 on public HTTPS, with image, language navigation and overflow assertions.
- Joanic journeys: nine local and nine public combinations (ES/EN/RU × 390/768/1440 px). Service 06 opens, project card is inside the accordion, lower global project list has no Joanic duplicate, localized detail route loads four working WebP photos, and the localized painting article is reachable. No page-level horizontal overflow or page JS errors in these journeys.
- All 40 public canonical routes return 200 and their HTML matches the fresh bundle exactly. Public deployment marker, robots, sitemap and llms match as well.
- Mobile RU accordion and full project screenshots captured; this is functional deployment acceptance, not a new owner-approved visual baseline.
- Live Caddy configuration validates. HTTP→HTTPS and www→apex return 301 preserving `/ru/`.
- Main, DNS, TLS and nginx/Caddy configuration unchanged. Unmerged draft article PR #10 is not part of this release.

## Rollback and evidence

Actual previous target was `/srv/vital-vibe/releases/20260921-83dcb9f`, commit `83dcb9f4e77ce65346f7df33060f4a47377b38d1`. It remains available. If rollback is required, on the VPS run `bash /home/ubuntu/rollback-release.sh 20260921-83dcb9f` and verify the public deployment marker.

Archive and release helpers are at `/home/ubuntu/` on the VPS. Local build, logs, browser script, screenshots and JSON results are in `/tmp/vital-vibe-deploy-1mER0T/`; these local diagnostics are temporary and are not public website assets. No rollback was needed.
