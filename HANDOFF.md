# HANDOFF

Version: 41
Updated: 2026-09-13T08:31:00Z

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

The human-approved visual baseline, accessibility/token layer, homepage responsive-image slices and first project-detail performance slice are green. Production and DNS remain unchanged.

Reference states:

- visual baseline: run #15 / `b34f72fd7902235cd24206f9a56ea9e243e89c92`;
- accessibility: run #23 / `b23f0b9046e359f181f4065cc76665310f9d6188`;
- first homepage image slice: run #30 / `073a29dc01213c9b12c929fa26630d456984d554`;
- Smart Home image slice: run #34 / `d43d45294efe9169c26361712a2a9b008c231204`;
- standard project responsive slice: run #45 / `a47740d5876490df7fa64b970c51449d85a0c8c2`.

## Responsive-image system

`tools/media/build-home-responsive.sh` now auto-orients source photos with ImageMagick before stripping metadata and encoding WebP with `cwebp` q=82 / method 6. CI installs `imagemagick` + `webp`. This is required because some legacy JPEGs store their intended display orientation in EXIF metadata.

`tools/deploy/build-vps-bundle.mjs` generates responsive assets into `.deploy-dist/assets/responsive/`. Homepage delivery is patched into ES/EN/RU release copies. `tools/media/patch-standard-project-responsive.mjs` applies the same release-only `<picture>` / width-`srcset` / `sizes` pattern to the standard renovation project detail and its project-index card.

Original `<img src>` paths, intrinsic dimensions, Media IDs and alt text remain unchanged. `<picture>` is layout-neutral (`display: contents`) so existing CSS object-fit/crop rules remain authoritative. Generated `site-next` source is not hand-edited for these delivery changes.

`tools/visual/responsive-images.mjs` verifies Chromium `currentSrc`, confirms the selected file was actually requested, and confirms it exists in the release bundle. `tools/visual/standard-project.mjs` adds full-page screenshots and failed-request/broken-image/overflow checks at 390×844, 768×1024 and 1440×1000.

### Homepage slices

The seven already optimized homepage image requests retain their previous browser-verified delivery. The auto-orientation safeguard slightly changes encoded byte counts versus the earlier direct-cwebp measurements, but does not change source identities or layout.

### Standard project slice

`/projects/reforma-integral-estandar-barcelona/` displays six large source photographs totaling **13,644,080 B**:

- cocina 1,832,524 B;
- obra 3,566,671 B;
- suelo-base 2,283,159 B;
- parquet 2,333,650 B;
- pintura 2,038,332 B;
- pasillo 1,589,744 B.

All six now have 480w / 768w / 1200w WebP candidates. Run #45 confirmed Chromium selected/requested responsive sources with combined selected 1× bytes:

- 390×844: **80,566 B**;
- 768×1024: **93,344 B**;
- 1440×1000: **214,548 B**.

This is a bounded six-request comparison, not total page weight or a higher-DPR claim.

The initial conversion pass revealed an EXIF-orientation bug that structural QA alone did not catch: several WebPs appeared rotated. Human screenshot review caught it before acceptance. The builder now performs `-auto-orient`; final mobile and desktop review shows the lead kitchen and process photos upright with existing crops intact.

Run #45 also passed the normal Visual QA, accessibility QA and responsive-resource verifier. Dedicated standard-project screenshots reported 0 failed requests, 0 broken images and 0 horizontal overflow at all three reference widths.

## Visual/accessibility reference

Completed UI fixes remain:

1. grouped 39-image gallery;
2. El Raval public pending-photo status removed;
3. mobile project cards stacked;
4. Smart Home mobile density reduced without content removal;
5. Article desktop centered in a 1040 px editorial frame.

Semantic contract: `--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--border`.

One non-blocking advisory remains: gallery and El Raval still compute `scroll-behavior: smooth` under reduced-motion. Clean it up when the shared secondary stylesheet is next edited.

## Solar collector material — deferred

Historical branch `agent/add-solar-collector-animation` contains the Russian solar-collector article and interactive animation. Do not merge that diverged branch wholesale. The owner asked to return later; port the files surgically into the current architecture/accessibility system when resumed.

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

Production target remains VPS + Caddy. Responsive-image generation is now an explicit packaging dependency: relevant CI workflows install ImageMagick and the WebP tools. Production, DNS and original hosting were not changed.

## Immediate next action

Rank the premium project-detail photographs by source size and visible usage and optimize the highest-impact subset as another bounded slice. Keep the homepage hero/LCP as a separate measured decision. Do not mass-generate variants for all 39 gallery images until their real transfer benefit is ranked.
