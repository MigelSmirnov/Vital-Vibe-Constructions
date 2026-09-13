# HANDOFF

Version: 42
Updated: 2026-09-13T09:15:00Z

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

The human-approved visual baseline, accessibility/token layer, homepage responsive-image slices and standard-project responsive slice are green. A bounded Premium project slice is implemented and derivative CI is green; its dedicated full browser matrix is still waiting for GitHub Actions runner availability. Production and DNS remain unchanged.

Reference states:

- visual baseline: run #15 / `b34f72fd7902235cd24206f9a56ea9e243e89c92`;
- accessibility: run #23 / `b23f0b9046e359f181f4065cc76665310f9d6188`;
- first homepage image slice: run #30 / `073a29dc01213c9b12c929fa26630d456984d554`;
- Smart Home image slice: run #34 / `d43d45294efe9169c26361712a2a9b008c231204`;
- standard project responsive slice: run #45 / `a47740d5876490df7fa64b970c51449d85a0c8c2`;
- Premium derivative build: run #8 / `99f12f4565c329ae3ad78e1f35593deeb328dab5`;
- Premium general Visual QA after release integration: run #59 / `be99a1354136948c5b5a69da0d77c1ed8ba0729e`.

## Responsive-image system

`tools/media/build-home-responsive.sh` auto-orients source photos with ImageMagick before stripping metadata and encoding WebP with `cwebp` q=82 / method 6. CI installs `imagemagick` + `webp` because some legacy JPEGs store intended orientation in EXIF metadata.

`tools/deploy/build-vps-bundle.mjs` generates responsive assets into `.deploy-dist/assets/responsive/`. Homepage delivery is patched into ES/EN/RU release copies. Project patchers apply the same release-only `<picture>` / width-`srcset` / `sizes` pattern to selected project details.

Original `<img src>` paths, intrinsic dimensions, Media IDs and alt text remain unchanged. `<picture>` is layout-neutral (`display: contents`) so existing CSS object-fit/crop rules remain authoritative. Generated `site-next` source is not hand-edited for these delivery changes.

`tools/visual/responsive-images.mjs` verifies homepage Chromium `currentSrc`, request selection and file presence. `tools/visual/standard-project.mjs` and `tools/visual/premium-project.mjs` provide dedicated project checks at 390×844, 768×1024 and 1440×1000.

### Standard project slice

`/projects/reforma-integral-estandar-barcelona/` displays six large source photographs totaling **13,644,080 B**. All six have 480w / 768w / 1200w WebP candidates. Run #45 confirmed combined selected 1× bytes of **80,566 B**, **93,344 B** and **214,548 B** at the three reference widths. The EXIF-orientation bug found by human screenshot review was fixed before acceptance, and the final dedicated check reported zero failed requests, zero broken images and zero horizontal overflow.

### Premium project slice

`/projects/trabajos-contrata-premium/` has a bounded top-ten high-transfer slice: `pladur-instalacion`, `pladur-obra`, `prep-techo-1..4`, and `techo-1..4`. Those ten originals total **26,312,747 B**.

The deterministic derivative totals are **177,286 B** for all ten 480w candidates, **382,392 B** for all ten 768w candidates and **789,948 B** for all ten 1200w candidates. `Responsive image derivatives` run #8 succeeded, and manual derivative review shows the selected photographs upright after the EXIF-aware pipeline.

`tools/media/patch-premium-project-responsive.mjs` integrates only those ten images into the release copy while retaining original fallbacks. `tools/visual/premium-project.mjs` checks real browser-selected/requested resources, missing files, failed requests, broken images, overflow and full-page screenshots.

General Visual QA run #59 succeeded after Premium release integration. The dedicated Premium verifier was added to `tools/visual/run.sh` immediately afterward. Its first complete run (#60) remains queued in GitHub Actions, while the next push (#61) ended in `startup_failure` before any job existed. Do not record final Premium browser-selected byte totals until a run containing `premium-project.mjs` completes successfully.

## Visual/accessibility reference

Completed UI fixes remain: grouped 39-image gallery; El Raval pending-photo status removed; mobile project cards stacked; Smart Home mobile density reduced; Article desktop centered in a 1040 px editorial frame.

Semantic contract: `--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--border`.

One non-blocking advisory remains: gallery and El Raval still compute `scroll-behavior: smooth` under reduced-motion. Clean it up when the shared secondary stylesheet is next edited.

## Solar collector material — deferred

Historical branch `agent/add-solar-collector-animation` contains the solar-collector article and interactive animation. Do not merge that diverged branch wholesale. Port the files surgically into the current architecture/accessibility system when resumed.

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

Production target remains VPS + Caddy. Responsive-image generation is an explicit packaging dependency: relevant CI workflows install ImageMagick and WebP tools. Production, DNS and original hosting were not changed.

## Immediate next action

Finish the dedicated Premium browser matrix when GitHub Actions supplies a runner. If green, record actual selected/requested bytes and accept the Premium slice. Then measure the homepage hero/LCP separately before changing its format, preload or fetch strategy. Do not mass-generate variants for all 39 gallery images until their real transfer benefit is ranked.
