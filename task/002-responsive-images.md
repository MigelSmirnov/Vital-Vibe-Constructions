# 002 — responsive image optimization

Status: homepage high-impact images and the first bounded project-detail slice are integrated and browser-verified. Responsive WebP delivery preserves original files, Media IDs, alt text, intrinsic dimensions and approved crops.

## Goal

Reduce transferred image bytes without changing approved crops, Media IDs, alt text or the visual baseline.

## Slice 1 — bathroom + standard kitchen on homepage

Targets:

- `assets/home/bathroom-retouched.png` — original 2,135,087 bytes, 1086×1448;
- `estandar/cocina.jpeg` — original 1,832,524 bytes, 4032×3024.

Visual QA run #30 on `073a29dc01213c9b12c929fa26630d456984d554` verified browser selection, fallback retention, visual QA and accessibility QA.

## Slice 2 — Smart Home

The Smart Home homepage section uses one lead image plus four partner examples. Their original URL payload totals 1,752,633 bytes:

- `smart/gira.jpeg` — 369,061 B;
- `premium/panel-marmol.jpeg` — 399,734 B;
- `premium/gira.jpeg` — 369,061 B;
- `premium/apple-home.jpeg` — 234,172 B;
- `smart/escenas.jpeg` — 380,605 B.

Each has 320w / 640w / 960w WebP candidates. Visual QA run #34 on `d43d45294efe9169c26361712a2a9b008c231204` verified selection/request behavior and no visual/accessibility regression.

## Slice 3 — standard project detail

The first project-detail slice targets `/projects/reforma-integral-estandar-barcelona/`, because its six source photographs are all large and are shown together on one page:

| Source | Original bytes |
| --- | ---: |
| `estandar/cocina.jpeg` | 1,832,524 |
| `estandar/obra.jpeg` | 3,566,671 |
| `estandar/suelo-base.jpeg` | 2,283,159 |
| `estandar/parquet.jpeg` | 2,333,650 |
| `estandar/pintura.jpeg` | 2,038,332 |
| `estandar/pasillo.jpeg` | 1,589,744 |
| **Total** | **13,644,080** |

Each now receives 480w / 768w / 1200w WebP candidates. The kitchen derivative is also reused on `/projects/` and on the homepage.

### EXIF orientation safeguard

The first project-detail browser pass exposed an important visual regression: several source JPEGs store their viewing orientation in EXIF metadata, while a direct `cwebp -resize` conversion produced rotated WebPs. The automated structural checks were green, but the human screenshot review caught the defect.

The derivative builder now runs every source through ImageMagick `-auto-orient` before stripping metadata and encoding WebP. CI installs both ImageMagick and `webp`. This keeps the rendered orientation equivalent to the browser-rendered originals instead of relying on metadata that is removed during derivative generation.

### Final browser selection — run #45

Visual QA run #45 on `a47740d5876490df7fa64b970c51449d85a0c8c2` completed successfully. Chromium selected and actually requested these combined project-detail payloads at 1×:

| Viewport | Selected WebP bytes for all 6 project photos |
| --- | ---: |
| 390×844 | 80,566 B |
| 768×1024 | 93,344 B |
| 1440×1000 | 214,548 B |

Compared with the six original files totaling 13,644,080 B, that is roughly 99.4%, 99.3% and 98.4% less transferred bytes for this bounded six-request comparison. It is not a claim about complete page weight, cache behavior or higher-DPR devices.

A dedicated project screenshot check now also runs at 390×844, 768×1024 and 1440×1000. The final pass reported zero failed requests, zero broken images and zero horizontal overflow. Human review of mobile and desktop screenshots confirmed that the kitchen and process images are upright and that the existing object-fit crops/layout remain visually intact.

## Release integration

`tools/media/build-home-responsive.sh` creates deterministic width-based derivatives. The current pipeline auto-orients sources with ImageMagick, strips metadata and encodes WebP with `cwebp` q=82 / method 6.

`tools/deploy/build-vps-bundle.mjs` generates derivatives into `.deploy-dist/assets/responsive/`. Homepage markup remains release-only patched as before; `tools/media/patch-standard-project-responsive.mjs` applies the same `<picture>` + `srcset` + `sizes` pattern to the standard project detail and its project-index card.

Original `<img src>` paths and intrinsic width/height remain as fallbacks. `<picture>` is layout-neutral (`display: contents`). Source `site-next` generated HTML is not hand-edited for these release-only delivery changes.

`tools/visual/responsive-images.mjs` verifies selected `currentSrc`, confirms the selected resource was actually requested, and confirms the file exists in the release bundle. `tools/visual/standard-project.mjs` adds full-page project screenshots and basic rendering checks.

The hero/LCP image remains deliberately outside these slices until it is measured separately.

## Ready when

- [x] Derivative generation is deterministic and CI-reproducible.
- [x] Originals remain untouched and Media IDs stable.
- [x] Homepage bathroom + standard-kitchen responsive sources are browser-verified.
- [x] Smart Home responsive sources are browser-verified.
- [x] Standard project detail uses responsive sources for all six displayed photographs.
- [x] EXIF-dependent source orientation is preserved in generated derivatives.
- [x] Standard project has dedicated screenshots at 390 / 768 / 1440 widths with no render failures or horizontal overflow.
- [x] Visual/accessibility QA remains green.
- [x] Browser audit confirms selected resources are actually requested by Chromium.
- [ ] Premium project images are ranked and optimized in another bounded slice.
- [ ] Hero/LCP is measured separately before changing its delivery strategy.

## Next

Rank the premium project-detail photographs by source size and visible usage and optimize the highest-impact subset. Keep the 39-image gallery as a separate later decision rather than generating 39×N variants in one step. Measure the homepage hero/LCP independently before changing its format or preload/fetch strategy.
