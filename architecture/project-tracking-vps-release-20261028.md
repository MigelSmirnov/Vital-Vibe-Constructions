# Project tracking article VPS release — 2026-10-28

## Result

Production serves release `20261028-e798a74` from source
`e798a74078bd838858fabec57f58cf0dae707a42` (merge of PR #31). It publishes
article VVC-ART-004 "Cómo seguir tu reforma y saber en qué se gasta el dinero"
in ES, EN and RU:

- `/articulos/seguimiento-control-reforma-avance-gastos-cambios/`
- `/en/articles/renovation-tracking-costs-client-area/`
- `/ru/articles/kak-sledit-za-remontom-i-raskhodami/`

## Release evidence

- PR #31 checks, VPS bundle and Visual QA green;
- VPS bundle workflow on `main`: https://github.com/MigelSmirnov/Vital-Vibe-Constructions/actions/runs/40655521204;
- archive SHA-256 (CI artifact and server copy):
  `582f3586a0c671d8f68062d358970ee567f2c8776fce70c530737b0915057df6`;
- archive `DEPLOYMENT_COMMIT` and public `/DEPLOYMENT_COMMIT`:
  `e798a74078bd838858fabec57f58cf0dae707a42`;
- 46 sitemap routes, 50 HTML files; all 46 public route bodies match the
  CI artifact exactly;
- WebP variants of both article images at 480 / 768 / 1440 px
  (receipts 39 / 92 / 240 KB, client area 13 / 27 / 68 KB);
- the three new pages at 390 px: both images decode from WebP, no failed
  requests, no horizontal overflow.

## Activation and rollback

- active symlink: `/srv/vital-vibe/current` ->
  `/srv/vital-vibe/releases/20261028-e798a74`;
- previous release: `20261019-a1e18f7`;
- rollback command: `bash ~/rollback-release.sh 20261019-a1e18f7`;
- `~/install-release.sh` on the server is identical to
  `deploy/vps/install-release.sh` but not executable, so it was run with `bash`;
- DNS, nginx, Caddy, TLS and other VPS services were not changed.
