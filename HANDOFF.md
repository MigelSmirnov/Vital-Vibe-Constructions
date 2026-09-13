# HANDOFF

Version: 40
Updated: 2026-09-13T08:05:00Z

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

The first human-approved visual baseline, accessibility/token layer and two bounded responsive-image homepage slices are green. Production and DNS remain unchanged.

Reference states:

- visual baseline: run #15 / `b34f72fd7902235cd24206f9a56ea9e243e89c92`;
- accessibility: run #23 / `b23f0b9046e359f181f4065cc76665310f9d6188`;
- first image slice: run #30 / `073a29dc01213c9b12c929fa26630d456984d554`;
- Smart Home image slice: run #34 / `d43d45294efe9169c26361712a2a9b008c231204`.

## Responsive-image system

`tools/media/build-home-responsive.sh` uses `cwebp` with fixed q=82 / method 6. `.github/workflows/home-image-derivatives.yml` verifies derivative generation, while the release builder generates the actual files into `.deploy-dist/assets/responsive/`.

`tools/deploy/build-vps-bundle.mjs` injects release-only `<picture>` markup into ES/EN/RU homepages. Original `<img src>` paths, intrinsic dimensions, Media IDs, alt text and CSS crops remain unchanged. The picture wrapper uses `display: contents` so existing layout/crop rules remain authoritative.

`tools/visual/responsive-images.mjs` uses Chromium to verify the optimized source was selected, requested and present in the release bundle.

### Slice 1

Optimized:

- bathroom feature PNG: 2,135,087 B original;
- standard-kitchen JPEG: 1,832,524 B original.

In the 1× reference matrix Chromium chose 480w for both on 390/768, and at 1440 chose 768w bathroom + 480w kitchen.

### Slice 2 — Smart Home

Optimized the five images actually used by the Smart Home capability block:

- lead `smart/gira.jpeg`;
- `premium/panel-marmol.jpeg`;
- `premium/gira.jpeg`;
- `premium/apple-home.jpeg`;
- `smart/escenas.jpeg`.

Their original URL payload totals 1,752,633 B. In the tested 1× layouts Chromium selected a 640w lead (18,654 B) and four 320w partner examples (12,674 / 4,920 / 6,106 / 8,010 B), totaling 50,364 B for this image set — roughly 97% less than the five originals. This is a bounded request comparison, not total page weight.

Visual QA run #34 passed standard visual checks, accessibility checks and responsive-resource selection across ES/EN/RU at 390, 768 and 1440 widths. Manual review of the 390 screenshot found the approved Smart Home layout/crops intact.

Across the seven optimized homepage image requests from slices 1+2, the original files total about 5.72 MB. The selected 1× resources total about 80 KB at 390/768 and 114 KB at 1440. The hero and other page images are not included in those numbers.

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

Production target remains VPS + Caddy. Release/Visual CI now installs the Ubuntu `webp` encoder explicitly because derivative generation is part of packaging. Production, DNS and original hosting were not changed.

## Immediate next action

Rank project-detail images by real transfer size and visible usage and optimize only the highest-impact few. Keep the hero/LCP as a separate measured decision and avoid generating variants for all 39 gallery images until their actual benefit is established.
