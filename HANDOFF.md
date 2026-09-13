# HANDOFF

Version: 44
Updated: 2026-09-13T11:43:00Z

## Session rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This is a living handoff. Historical detail belongs in commits and architecture artifacts.

## Start here

1. Read `AGENTS.md` and its required architecture contracts in order.
2. Continue from `task/README.md`; responsive-image work is tracked in `task/002-responsive-images.md`.
3. Work on `agent/architecture-sandbox`; do not use `main` as a working branch.
4. Do not hand-edit generated `site-next` output instead of changing the builder/source.
5. Run `node tools/checks/run.mjs` after content, route, builder or generated-output changes.

## Current stage

The human-approved visual baseline, accessibility/token layer, homepage responsive images, Standard/Premium project slices, homepage hero/LCP delivery and bounded gallery high-transfer reuse are green. Production and DNS remain unchanged.

Reference states:

- visual baseline: run #15 / `b34f72fd7902235cd24206f9a56ea9e243e89c92`;
- accessibility: run #23 / `b23f0b9046e359f181f4065cc76665310f9d6188`;
- first homepage image slice: run #30 / `073a29dc01213c9b12c929fa26630d456984d554`;
- Smart Home image slice: run #34 / `d43d45294efe9169c26361712a2a9b008c231204`;
- Standard project responsive slice: run #45 / `a47740d5876490df7fa64b970c51449d85a0c8c2`;
- hero/LCP baseline measurement: run #63 / `2d04103065dc1c9c50f469024f8836511d503833`;
- Premium + responsive hero acceptance: run #64 / `bfbcb7bd7dde15d2f69a663c3c7160f861ec81af`;
- gallery top-16 responsive reuse: run #66 / `2c38471b8cd31af0c02137c40df6e16f479e4cac`.

## Responsive-image system

`tools/media/build-home-responsive.sh` auto-orients source photos with ImageMagick before stripping metadata and encoding WebP with `cwebp` q=82 / method 6. CI installs `imagemagick` + `webp` because some legacy JPEGs store intended orientation in EXIF metadata.

`tools/deploy/build-vps-bundle.mjs` generates responsive assets into `.deploy-dist/assets/responsive/`. Delivery changes are release-only and preserve original `<img src>` fallbacks, intrinsic dimensions, Media IDs and alt text. `<picture>` is layout-neutral (`display: contents`) so existing crop rules remain authoritative.

Patchers/verifiers now include:

- homepage hero: `tools/media/patch-home-hero-responsive.mjs` + `tools/visual/hero-lcp.mjs`;
- Standard project: `tools/media/patch-standard-project-core.mjs` + `tools/visual/standard-project.mjs`;
- Premium project: `tools/media/patch-premium-project-responsive.mjs` + `tools/visual/premium-project.mjs`;
- gallery reuse: `tools/media/patch-gallery-responsive.mjs` + `tools/visual/gallery-responsive.mjs`;
- general optimized-resource check: `tools/visual/responsive-images.mjs`.

### Standard project

Six originals total **13,644,080 B**. Run #45 selected **80,566 / 93,344 / 214,548 B** at 390 / 768 / 1440. The legacy EXIF-orientation bug was caught by human screenshot review and fixed with `-auto-orient` before acceptance.

### Premium project

The bounded top ten originals total **26,312,747 B**. Run #64 selected/requested **177,286 / 177,286 / 382,392 B** at 390 / 768 / 1440 with 0 failed requests, 0 broken images and 0 overflow.

### Homepage hero / LCP

Baseline run #63 observed `.hero-image` as LCP in all 3 reference viewports and delivered one **264,764 B** JPEG everywhere. Under the same network-only synthetic profile, baseline LCP was **1,892 / 3,044 / 3,240 ms**.

The accepted responsive hero retains the JPEG fallback, crop and `fetchpriority="high"`, adds 480w / 768w / 1152w WebP and no preload. Run #64 selected **28,102 / 28,102 / 55,556 B** and measured **632 / 640 / 892 ms** under that same controlled profile. These timings are comparison data, not field CWV. Human review showed no visible crop regression.

### Gallery highest-transfer subset

The gallery contract remains **39/39**. Ranking by source size showed that the six Standard images plus the ten already-optimized Premium images are the dominant 16 sources, totaling **39,956,827 B** in originals.

Instead of generating 39×N new files, `patch-gallery-responsive.mjs` reuses their existing project derivatives. Run #66 confirmed all 16 selected/requested WebP at 390 / 768 / 1440. The combined selected payload is **257,852 B** at each reference viewport, with 0 failed requests, 0 broken images and 0 overflow. This is a bounded 16-request comparison, not complete page weight; the remaining 23 gallery images stay original and lazy-loaded.

Human review of run #66 gallery screenshots at 390, 768 and 1440 shows the two-/three-column card layout, orientation and crops intact.

## Visual/accessibility reference

Completed UI fixes remain: grouped 39-image gallery; El Raval pending-photo status removed; mobile project cards stacked; Smart Home mobile density reduced; Article desktop centered in a 1040 px editorial frame.

Semantic contract: `--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--border`.

One non-blocking advisory remains: gallery and El Raval still compute `scroll-behavior: smooth` under reduced motion. This is now the immediate small cleanup target.

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

Production target remains VPS + Caddy. Responsive-image generation is an explicit packaging dependency. Production, DNS and original hosting were not changed.

## Immediate next action

Fix the shared secondary `scroll-behavior: smooth` behavior under `prefers-reduced-motion: reduce`, then repeat accessibility + visual QA. Do not mass-generate gallery variants for the remaining 23 images without a new measured reason. Solar-collector material remains deferred until the owner resumes it.
