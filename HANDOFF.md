# HANDOFF

Version: 43
Updated: 2026-09-13T10:10:00Z

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

The human-approved visual baseline, accessibility/token layer, homepage high-impact responsive images, Standard project, bounded Premium project and homepage hero/LCP responsive delivery are green. Production and DNS remain unchanged.

Reference states:

- visual baseline: run #15 / `b34f72fd7902235cd24206f9a56ea9e243e89c92`;
- accessibility: run #23 / `b23f0b9046e359f181f4065cc76665310f9d6188`;
- first homepage image slice: run #30 / `073a29dc01213c9b12c929fa26630d456984d554`;
- Smart Home image slice: run #34 / `d43d45294efe9169c26361712a2a9b008c231204`;
- Standard project responsive slice: run #45 / `a47740d5876490df7fa64b970c51449d85a0c8c2`;
- hero/LCP baseline measurement: run #63 / `2d04103065dc1c9c50f469024f8836511d503833`;
- Premium + responsive hero acceptance: run #64 / `bfbcb7bd7dde15d2f69a663c3c7160f861ec81af`;
- responsive derivative build including hero: run #9 / `bfbcb7bd7dde15d2f69a663c3c7160f861ec81af`.

## Responsive-image system

`tools/media/build-home-responsive.sh` auto-orients source photos with ImageMagick before stripping metadata and encoding WebP with `cwebp` q=82 / method 6. CI installs `imagemagick` + `webp` because some legacy JPEGs store intended orientation in EXIF metadata.

`tools/deploy/build-vps-bundle.mjs` generates responsive assets into `.deploy-dist/assets/responsive/`. Homepage/project delivery changes are release-only. `tools/media/patch-home-hero-responsive.mjs` wraps the ES/EN/RU homepage hero in a layout-neutral `<picture>` while retaining the original JPEG `<img>` fallback and `fetchpriority="high"`. Standard/Premium project patchers follow the same fallback-preserving pattern.

Original `<img src>` paths, intrinsic dimensions, Media IDs and alt text remain unchanged. `<picture>` is layout-neutral (`display: contents`) so existing CSS object-fit/crop rules remain authoritative. Generated `site-next` source is not hand-edited for these delivery changes.

`tools/visual/responsive-images.mjs` verifies the previously optimized homepage/Standard resources. `tools/visual/standard-project.mjs` and `tools/visual/premium-project.mjs` provide dedicated project checks. `tools/visual/hero-lcp.mjs` measures the homepage LCP element, selected hero resource/bytes, responsive markup, preload/fetchpriority state and reference screenshots under a repeatable network-only profile.

### Standard project slice

`/projects/reforma-integral-estandar-barcelona/` displays six large source photographs totaling **13,644,080 B**. All six have 480w / 768w / 1200w WebP candidates. Run #45 confirmed combined selected 1× bytes of **80,566 B**, **93,344 B** and **214,548 B** at 390 / 768 / 1440. The EXIF-orientation bug found by human screenshot review was fixed before acceptance, and the final dedicated check reported zero failed requests, zero broken images and zero horizontal overflow.

### Premium project slice

`/projects/trabajos-contrata-premium/` has a bounded top-ten high-transfer slice: `pladur-instalacion`, `pladur-obra`, `prep-techo-1..4`, and `techo-1..4`. Those ten originals total **26,312,747 B**.

Run #64 completed the previously pending dedicated browser verification. Chromium selected/requested combined 1× payloads of **177,286 B**, **177,286 B** and **382,392 B** at 390 / 768 / 1440, with 0 failed requests, 0 broken images and 0 horizontal overflow. The 1200w candidate set remains available for larger/higher-density use and totals 789,948 B.

### Homepage hero / LCP

The hero baseline was measured before changing delivery. Under a cold-cache, DPR 1, network-only profile (150 ms latency, 1.6 Mbps down, 750 kbps up, no CPU throttling), run #63 observed `.hero-image` as LCP in all 3 viewports. The same `/assets/home/kitchen-living.jpg` file (**264,764 B**) was sent everywhere, with synthetic LCP values of **1,892 / 3,044 / 3,240 ms** at 390 / 768 / 1440.

The accepted experiment adds EXIF-aware 480w / 768w / 1152w WebP candidates while retaining the JPEG fallback, existing object-fit/object-position crop and `fetchpriority="high"`. No preload was added.

Derivative run #9 produced:

- 480w: **28,102 B**;
- 768w: **55,556 B**;
- 1152w: **95,278 B**.

Run #64 selected 480w / 480w / 768w at the reference widths, transferring **28,102 / 28,102 / 55,556 B**. Under the same synthetic profile, LCP measured **632 / 640 / 892 ms**. Compared with run #63, that is an 89.4% / 89.4% / 79.0% hero-byte reduction and a 66.6% / 79.0% / 72.5% synthetic LCP reduction. These timing percentages are controlled comparison data, not field Core Web Vitals.

Human review of the run #64 hero screenshots at 390, 768 and 1440 shows the existing composition/crop intact. Full Visual QA remained green. Do not add preload unless a separate timing experiment demonstrates a benefit.

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

Rank the 39 gallery photographs by source size and actual page/transfer impact before deciding which subset deserves responsive variants. Do not generate 39×N variants blindly. The shared reduced-motion `scroll-behavior: smooth` advisory can be cleaned up independently as a small accessibility follow-up. Solar-collector material remains deferred by owner.
