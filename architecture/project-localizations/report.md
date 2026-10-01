# Project translations — 2026-09-17

Production f25d27b exposed Spanish-only project detail pages from English and Russian home cards. `/ru/projects/estudio-reformado-barcelona/` returned 404. The active local deploy checkout is `/tmp/vital-vibe-vps-fb31a282`, not the older `/home/smirnov/Vital-Vibe-Constructions` checkout.

Added complete EN/RU projections for the four existing Project records and their catalog (10 new URLs). The three projects featured on the homepage now link to the selected language. Each project and catalog has reciprocal language navigation, canonical and hreflang metadata, localized JSON-LD, navigation, evidence sections, image descriptions and captions. The bathroom project retains its AI-retouch disclosure, labour-only cost and Badalona-only location. Source facts, image IDs/order/dimensions and Spanish project URLs are preserved.

The existing Spanish builder remains the content projection source. Translation records live in `content/tables/project-localizations.yaml`, loaded and validated by Knowledge Repository. The localization pass translates only text-bearing tokens, never arbitrary substrings or image paths. Unknown source copy or incomplete EN/RU entries fail the build instead of falling back to Spanish. This extends the existing homepage localization pattern without a new dependency or client-side translation runtime. Route-contract localized families supplement the existing default-language families; validators enforce exactly one ES/EN/RU sibling for every base project and index.

The release reuses existing Standard/Premium responsive derivatives on all languages, preserving image delivery. Sitemap grows from 25 to 35 canonical URLs. Existing article, gallery, service and home layout remain outside this change.

Validation before deployment: canonical checks passed (37 tests, all project translations and links, gallery 39/39, 12 article pages, audit 0 errors / 5 existing warnings). VPS bundle validation passed (35 canonical routes, 39 HTML documents). Local browser checks passed for all 15 pages at 390, 768 and 1440 pixels (45 cases), including homepage-to-project, ES/EN/RU switches and return-to-catalog journeys.

Mobile checking exposed an overflowing long Russian bathroom heading; project/index headings now wrap long words. Project stylesheet URLs include a source-content hash so existing cached CSS cannot hide the correction.

## Published release

- Source commit: `ebd51356a925e84984bdfa2f520979fd11a44362`.
- Release: `/srv/vital-vibe/releases/20260917-ebd5135`; `current` was atomically switched after the old release marker was checked.
- Uploaded archive SHA-256: `671fb0812000daf3ce99503b8f98e9605fad9700feaac179a58762042a1a0315`, matched locally and on VPS before activation.
- Public HTTPS marker matches the source commit. All 35 sitemap routes return 200, contain self canonical and one H1; declared languages match.
- All 45 project page/viewport checks also passed against production. No broken images, JavaScript errors, HTTP failures or horizontal overflow; optimized Standard/Premium image selection and actual navigation journeys passed.
- Release comparison: 10 new translated pages, 10 changed existing files, 193 identical files. The stylesheet change only allows long project/index headings to wrap. See `release-diff.json`, `local-browser.json`, `public-browser.json`, and `public-http.json`.
- Rollback: retain `/srv/vital-vibe/releases/20260913-f25d27b`; use `deploy/vps/rollback-release.sh 20260913-f25d27b` on the VPS if needed.
- DNS, nginx/Caddy settings and other applications were not changed.

The website source checkout is a separate repository. A discovery note was added to the Factory workspace at `docs/VITAL_VIBE_WEBSITE_DEPLOYMENT_HANDOFF.md` so future sessions can find the deployment without asking the owner for SSH details.
