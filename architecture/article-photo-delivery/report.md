# Painting and floor photograph delivery — 2026-09-13

The owner reported noticeably slow drawing/loading of the photographs added after the earlier image optimization. These two articles still used full JPEG files without responsive sources: two painting photographs total 847,570 bytes and six floor photographs total 1,226,532 bytes.

Added a bounded production-only image step, `tools/media/build-article-responsive.mjs`, to the existing VPS bundle builder. It reads the two selected Articles and their Media records through the Knowledge Repository, creates EXIF-oriented q82/m6 WebP at 480, 768 and up to 1440 pixels (never wider than the original), and wraps the corresponding article and catalog images in layout-neutral pictures. Eight originals, Media IDs, alt text, captions, dimensions and lazy-loading policy are retained. No image is cropped, retouched or enlarged. URLs include a source/encoder hash so old cached derivatives cannot mask updates. No new dependencies.

All ES/EN/RU article variants and their catalog cards are covered. Sizes declarations follow the actual article column and catalog card widths. Larger variants are selected on high-density displays. First-photo eager/preload changes were not introduced: byte reduction addresses delivery while lower images remain lazy.

## Measured browser selection

Values below are the summed bytes of the actual selected image files, not whole-page weights or measured page-load times. Cold browser contexts verified that WebP is selected without also requesting the JPEG fallback.

| Article photos | Original JPEG | 390/768 px, DPR 1 | 1440 px, DPR 1 | 1440 px, DPR 2 |
| --- | ---: | ---: | ---: | ---: |
| Painting (2) | 847,570 | 24,900 | 81,000 | 278,490 |
| Floor (6) | 1,226,532 | 119,464 | 233,868 | 419,732 |
| Combined (8) | 2,074,102 | 144,364 | 314,868 | 698,222 |

Approximately 93% fewer image bytes on the tested phone/tablet DPR1 viewports and 85% fewer on desktop DPR1. These are transfer-size reductions, not promises of instant loading on every network. The crack and skirting-gap examples were visually compared with their originals; their relevant details and orientation remain visible.

## Validation and deployment

`tools/visual/article-images.mjs` is included in visual QA. It checks six article pages plus three catalogs at three viewport widths and desktop DPR2: 36 cases. It verifies WebP selection, no fallback double-download, no upscaling, sufficient selected resolution for the rendered size/DPR, unchanged photo proportions, reduced payload, no horizontal overflow and no page JavaScript errors.

All 36 cases passed locally and all 36 passed on public HTTPS. Evidence: `local-browser.json`, `public-browser.json`, `release-diff.json` and `derivatives.json`. Planner `/manual` remained byte-identical to the pre-change baseline.

Canonical checks: 35 tests, audit 0 errors / 5 existing warnings. Bundle validator: 23 sitemap routes / 29 HTML files. Archive comparison with the previous release found exactly 24 new WebP files, nine changed photo-bearing HTML pages and DEPLOYMENT_COMMIT; every other public file is byte-identical, including the solar iframe fix, CSS and all other media. Public routes and nine redirects passed after activation.

Source SHA: `2695336c8117234206bc4a3e19009ae517f7094f`.
Archive SHA-256: `e081bca9155398e72fb0a06ea61c5ca510f22902646513a0f38194e4bc55ca6b`.
Release: `/srv/vital-vibe/releases/20260913-2695336`.
Previous release retained for rollback: `20260913-13f0f47`.

The new archive was built from a clean committed checkout, checksum-verified after upload, and activated through the existing atomic installer. DNS, nginx/Caddy configuration, certificate settings and the planner were unchanged. HANDOFF/session-state record final verification.
