# HANDOFF

Version: 39
Updated: 2026-09-13T07:56:00Z

## Session rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This is a living handoff. Historical detail belongs in commits and architecture artifacts.

## Start here

1. Read `AGENTS.md` and its required architecture contracts in order.
2. Continue from `task/README.md`; the active performance record is `task/002-responsive-images.md`.
3. Work on `agent/architecture-sandbox`; do not use `main` as a working branch.
4. Do not hand-edit generated `site-next` output instead of changing the builder/source.
5. Run `node tools/checks/run.mjs` after content, route, builder or generated-output changes.

## Current stage

The first human-approved visual baseline, accessibility/token layer and first bounded responsive-image slice are green.

The approved visual baseline remains run #15 / `b34f72fd7902235cd24206f9a56ea9e243e89c92`. Accessibility run #23 / `b23f0b9046e359f181f4065cc76665310f9d6188` passed with zero blocking findings. Production and DNS remain unchanged.

## Responsive images — first slice complete

The first performance slice optimizes two large homepage assets while keeping originals and Media identities unchanged:

- `assets/home/bathroom-retouched.png` — 2,135,087 B original;
- `estandar/cocina.jpeg` — 1,832,524 B original.

`tools/media/build-home-responsive.sh` generates deterministic WebP width variants with `cwebp` (`q=82`, method 6). `Homepage image derivatives` run #1 on `663f412f38fd830bb0fe722fb0914642aa85b26c` was green.

The release builder now places the generated variants under `.deploy-dist/assets/responsive/` and adds `<picture>`/width-`srcset`/`sizes` only to the generated ES/EN/RU homepage copies. Original `<img src>` and intrinsic dimensions remain the fallback. The tracked source projection is not replaced with generated binary derivatives.

Visual QA run #30 on `073a29dc01213c9b12c929fa26630d456984d554` completed successfully after integration. The new `tools/visual/responsive-images.mjs` confirmed that Chromium selected and requested the responsive WebP sources for all three home languages at 390, 768 and 1440 widths. Standard Visual QA and accessibility QA also remained green.

Observed selected files:

```text
390:  bathroom 480w 22,896 B; kitchen 480w 7,058 B
768:  bathroom 480w 22,896 B; kitchen 480w 7,058 B
1440: bathroom 768w 56,418 B; kitchen 480w 7,058 B
```

Manual review of the 390 and 1440 screenshots showed no visible crop/layout regression from the approved baseline.

The larger 1086w bathroom and 1200w kitchen candidates remain available for higher DPR/layout requirements; Chromium correctly did not choose them in the tested 1× viewport matrix.

## Visual/accessibility reference

The completed visual fixes remain:

1. grouped 39-image gallery;
2. El Raval public pending-photo status removed;
3. mobile project cards stacked;
4. Smart Home mobile density reduced without content removal;
5. Article desktop centered in a 1040 px editorial frame.

The semantic color contract remains `--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--border`.

One non-blocking advisory remains: gallery and El Raval still compute `scroll-behavior: smooth` under reduced-motion. Clean this up when the shared secondary stylesheet is next edited.

## Solar collector material — deferred

A separate historical branch `agent/add-solar-collector-animation` contains the prepared Russian solar-collector article and interactive animation. Do not merge that old/diverged branch wholesale. The owner asked to return to it later; port those files surgically into the current architecture/accessibility system when resumed.

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

Production hosting direction remains **VPS + Caddy**. Release build environments now require the Ubuntu `webp` encoder because responsive derivatives are generated deterministically during packaging; CI installs it explicitly.

Production, DNS and original hosting were not changed in this performance session.

## Immediate next action

Rank the remaining high-transfer images by actual page usage and extend responsive sources selectively to Smart Home/project details. Keep the hero/LCP image as a separate measured optimization decision, and do not mass-expand the 39-image gallery until the high-impact slices are proven worthwhile.
