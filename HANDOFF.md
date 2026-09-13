# HANDOFF

Version: 38
Updated: 2026-09-13T07:47:00Z

## Session rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This is a living handoff. Historical detail belongs in commits and architecture artifacts.

## Start here

1. Read `AGENTS.md` and its required architecture contracts in order.
2. Continue from `task/README.md`; the active bounded task is `task/002-responsive-images.md`.
3. Work on `agent/architecture-sandbox`; do not use `main` as a working branch.
4. Do not hand-edit generated `site-next` output instead of changing the builder/source.
5. Run `node tools/checks/run.mjs` after content, route, builder or generated-output changes.

## Current stage

The first human-approved visual baseline and the semantic-token/accessibility layer are established. Work has moved to **responsive-image/performance optimization without changing approved crops or Media identities**.

The Visual QA command remains `bash tools/visual/run.sh` and covers 390×844, 768×1024 and 1440×1000 across ES/EN/RU homepages, the Article in all three languages, gallery and El Raval. It checks loading, broken images, overflow, language switching, semantic tokens, explicit control target-size, real Tab focus and reduced-motion.

The approved visual baseline is run #15 / `b34f72fd7902235cd24206f9a56ea9e243e89c92`. Accessibility run #23 / `b23f0b9046e359f181f4065cc76665310f9d6188` passed with zero blocking findings. Production and DNS remain unchanged.

## Responsive image slice

A first bounded derivative pipeline is now implemented but **not yet wired into public HTML**.

- New builder: `tools/media/build-home-responsive.sh`.
- New CI: `.github/workflows/home-image-derivatives.yml` with read-only repository permissions.
- GitHub Actions run #1 on `663f412f38fd830bb0fe722fb0914642aa85b26c` completed successfully.
- The first targets are the two highest-value homepage files from the prior static review:
  - `assets/home/bathroom-retouched.png` — 2,135,087 bytes, 1086×1448;
  - `estandar/cocina.jpeg` — 1,832,524 bytes, 4032×3024.
- Originals remain canonical fallbacks and are not recompressed in place.
- WebP derivatives are generated at fixed widths with `cwebp q=82`, method 6.

Measured derivative sizes:

```text
bathroom 480   22,896 B
bathroom 768   56,418 B
bathroom 1086 130,290 B
kitchen  480    7,058 B
kitchen  768   14,168 B
kitchen 1200   27,268 B
```

The file-size opportunity is large, but no performance claim should be made until `<picture>/srcset/sizes` is integrated and Chromium confirms which resource is actually selected. The next implementation step is to wire only these two sources, then rerun the approved screenshot/accessibility matrix before expanding the pipeline to Smart Home, project pages or the 39-image gallery.

## Visual/accessibility reference

The previous visual fixes remain:

1. grouped 39-image gallery;
2. El Raval public pending-photo status removed;
3. mobile project cards stacked;
4. Smart Home mobile density reduced without content removal;
5. Article desktop centered in a 1040 px editorial frame.

The semantic color contract remains:

```text
--bg
--surface
--text
--muted
--accent
--border
```

One non-blocking accessibility advisory remains: gallery and El Raval still compute `scroll-behavior: smooth` under reduced-motion. Clean this up when the shared secondary stylesheet is next edited.

## Solar collector material — deferred

A separate historical branch `agent/add-solar-collector-animation` contains the prepared Russian solar-collector article and interactive animation. The branch is old/diverged and must not be merged wholesale. The owner asked to return to it later; when resumed, treat those two files as source material and port them surgically into the current architecture/accessibility system.

## Published content state

- Homepages: ES `/`, EN `/en/`, RU `/ru/`.
- Bathroom Article: ES `/articulos/traslado-lavabo-toallero/`, EN `/en/articles/moving-a-bathroom-basin/`, RU `/ru/articles/perenos-rakoviny/`.
- Bathroom public location is **Badalona only**.
- Four working days and EUR 1,100 labour including rubbish removal are confirmed; do not present that amount as total renovation cost including materials.
- Preserve the existing disclosure that the final bathroom image was AI-retouched.
- El Raval is one property represented by `project-studio-renovation-barcelona` and 16 photographs.
- Gallery coverage remains complete at 39 images.

## Architecture boundaries

Source priority remains:

```text
architecture/invariants.yaml
architecture/constants.yaml
architecture/app-architecture.yaml
architecture/session-state.yaml
architecture/project-routes.yaml
architecture/gallery-media-coverage.yaml
HANDOFF.md
README.md
```

Key rules:

- Knowledge Repository is the public content source of truth.
- `support.js` and legacy entrypoints remain read-only.
- Routes activate only through `architecture/project-routes.yaml`.
- Generated files must be reproducible from committed inputs.
- Do not introduce dependencies without a platform justification.
- Keep `task/` and development notes out of the public bundle.

## Production / VPS

Production hosting direction remains **VPS + Caddy**, with GitHub as source-control/build/validation and static release artifacts served by Caddy.

Production, DNS and original hosting were not changed in this performance session. Before any cutover follow `architecture/vps-migration-plan.md`, `architecture/vps-security-plan.md` and `architecture/production-deployment-plan.md`.

## Immediate next action

Wire the two generated WebP image families into homepage source markup using `<picture>` + width `srcset` + explicit `sizes`, retain the existing original `<img src>` fallback/intrinsic dimensions, and rerun Visual QA. Only after the crop/layout baseline remains equivalent should the same pattern be expanded to more images.
