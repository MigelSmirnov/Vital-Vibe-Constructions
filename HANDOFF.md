# HANDOFF

Version: 45
Updated: 2026-09-13T11:56:00Z

## Session rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This is a living handoff. Historical detail belongs in commits and architecture artifacts.

## Start here

1. Read `AGENTS.md` and its required architecture contracts in order.
2. Continue from `task/README.md`; responsive-image history is tracked in `task/002-responsive-images.md`.
3. Work on `agent/architecture-sandbox`; do not use `main` as a working branch.
4. Do not hand-edit generated `site-next` output instead of changing builders/reproducible release steps.
5. Run `node tools/checks/run.mjs` after content, route, builder or generated-output changes.

## Current stage

The human-approved visual baseline, semantic/accessibility layer, homepage responsive images, Standard/Premium project slices, homepage hero/LCP delivery, bounded gallery high-transfer reuse and shared reduced-motion follow-up are green. Production and DNS remain unchanged.

Reference states:

- visual baseline: run #15 / `b34f72fd7902235cd24206f9a56ea9e243e89c92`;
- accessibility baseline: run #23 / `b23f0b9046e359f181f4065cc76665310f9d6188`;
- Standard project responsive slice: run #45 / `a47740d5876490df7fa64b970c51449d85a0c8c2`;
- hero/LCP baseline: run #63 / `2d04103065dc1c9c50f469024f8836511d503833`;
- Premium + responsive hero acceptance: run #64 / `bfbcb7bd7dde15d2f69a663c3c7160f861ec81af`;
- gallery top-16 responsive reuse: run #66 / `2c38471b8cd31af0c02137c40df6e16f479e4cac`;
- docs/state control after gallery: run #67 / `75517e4276cafe96b50fb2caae72a428f263b8a6`;
- reduced-motion cleanup: run #68 / `c583479bfbd639856143212c52876e949b5ccf40`.

## Responsive-image system

`tools/media/build-home-responsive.sh` auto-orients source photos with ImageMagick before stripping metadata and encoding WebP with `cwebp` q=82 / method 6. CI installs `imagemagick` + `webp` because some legacy JPEGs store intended orientation in EXIF metadata.

`tools/deploy/build-vps-bundle.mjs` generates responsive assets into `.deploy-dist/assets/responsive/`. Delivery changes are release-only and preserve original `<img src>` fallbacks, intrinsic dimensions, Media IDs and alt text. `<picture>` is layout-neutral (`display: contents`) so existing crop rules remain authoritative.

Current release helpers/verifiers include homepage hero, Standard project, Premium project and gallery top-16 reuse. The gallery keeps all 39 contract images; only the six Standard + ten heavy Premium images reuse responsive project derivatives. The remaining 23 stay original until a new measured reason justifies more work.

### Key measured results

- Standard six: **13,644,080 B** originals → **80,566 / 93,344 / 214,548 B** selected at 390 / 768 / 1440 in run #45.
- Premium top ten: **26,312,747 B** originals → **177,286 / 177,286 / 382,392 B** in run #64.
- Hero: **264,764 B** JPEG baseline → **28,102 / 28,102 / 55,556 B** selected after responsive delivery. Controlled synthetic LCP changed **1,892/3,044/3,240 ms → 632/640/892 ms**. These are comparative synthetic timings, not field CWV.
- Gallery bounded top 16: **39,956,827 B** original source payload → **257,852 B** selected in each 1× reference viewport during the full-scroll verification in run #66. This is not complete page weight; 23 other images remain original/lazy-loaded.

## Reduced motion

The remaining advisory came from shared secondary CSS computing `scroll-behavior: smooth` even when the browser requested `prefers-reduced-motion: reduce`.

`tools/media/patch-reduced-motion.mjs` now appends a deterministic release-only override to `.deploy-dist/styles.css`:

`@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }`

`tools/visual/reduced-motion.mjs` is a blocking check in `tools/visual/run.sh`. It verifies `/gallery/` and `/projects/estudio-reformado-barcelona/` under a real reduced-motion browser context and fails unless computed scroll behavior is `auto`.

Run #68 completed successfully, so the previous gallery/El Raval smooth-scroll advisory is closed. Normal-motion smooth scrolling remains unchanged.

## Visual/accessibility reference

Completed UI fixes remain: grouped 39-image gallery; El Raval pending-photo status removed; mobile project cards stacked; Smart Home mobile density reduced; Article desktop centered in a 1040 px editorial frame.

Semantic contract: `--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--border`.

## Solar collector material — deferred

Historical branch `agent/add-solar-collector-animation` contains the solar-collector article and interactive animation. Do not merge that diverged branch wholesale. The owner asked to return later; port files surgically into the current architecture/accessibility system when resumed.

## Published content state

- Homepages: ES `/`, EN `/en/`, RU `/ru/`.
- Bathroom Article: ES `/articulos/traslado-lavabo-toallero/`, EN `/en/articles/moving-a-bathroom-basin/`, RU `/ru/articles/perenos-rakoviny/`.
- Bathroom public location is **Badalona only**.
- Four working days and EUR 1,100 labour including rubbish removal are confirmed; do not present that as total cost including materials.
- Preserve the final bathroom image AI-retouch disclosure.
- El Raval remains one property with 16 photographs.
- Gallery coverage remains 39/39.

## Architecture boundaries

Knowledge Repository remains public content source of truth. `support.js`/legacy entrypoints stay read-only. Routes activate only through `architecture/project-routes.yaml`. Generated public files must remain reproducible. Keep `task/` and development notes out of the release bundle.

## Production / VPS

Production target remains VPS + Caddy. Production, DNS and original hosting were not changed. VPS cutover remains a separate owner-directed stage.

## Immediate next action

No current quality/performance blocker is open in this bounded pass. Await owner direction before starting a new stage. Solar-collector content remains deferred, hero preload remains optional only with separate timing evidence, and the remaining 23 gallery images should not be mass-optimized without new measurements.
