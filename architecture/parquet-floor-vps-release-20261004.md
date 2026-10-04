# Parquet floor VPS release — 2026-10-04

## Result

The parquet floor article is published and verified on the production VPS.

- PR: `#14`, merged into `main` as `122ecfb5f84b18ed0570fd528fb7e4bc83b94e8e`
- deployed source: `e35b7e437cb83b7c5941e7ffccf978f7b1e141ec`
- release: `20261004-e35b7e4`
- current root: `/srv/vital-vibe/releases/20261004-e35b7e4`
- rollback release: `20260927-765856d`
- archive SHA-256: `94500d160d0a5bedebb5244ae1d59052d01448d62693d30539666d4289508f22`

The deployed source is the exact head verified by the pull-request workflows. The subsequent merge commit has the same Git tree as the deployed source.

## Release evidence

All four workflows succeeded on the deployed source: Project checks, Article sandbox, VPS bundle check and Visual QA. The downloaded GitHub Actions artifact was checked again before upload:

- `DEPLOYMENT_COMMIT` matched the full deployed SHA;
- bundle validation passed with 43 sitemap routes and 47 HTML files;
- the release contains 120 WebP files, including 15 parquet derivatives;
- the archive checksum matched locally and on the VPS;
- the previous live target and commit were recorded before activation.

The repository release helper installed the archive into a new directory and atomically switched `/srv/vital-vibe/current`. No server configuration, DNS or TLS files were changed.

## Production acceptance

- Public `/DEPLOYMENT_COMMIT` matches the deployed source.
- All 43 sitemap HTML responses return 200 and match the release artifact byte for byte.
- The ES, EN and RU parquet article routes contain their H1 and responsive parquet photograph references.
- A representative generated parquet WebP returns 200 as `image/webp`.
- HTTP redirects to canonical HTTPS; `www` redirects to the apex canonical route.
- `https://app.vitalvibeconstruction.com/manual` still returns 200.
- The sampled Caddy log after verification contains no error-level entries or 5xx responses.

The previous release remains installed for immediate symlink rollback with `deploy/vps/rollback-release.sh 20260927-765856d`.
