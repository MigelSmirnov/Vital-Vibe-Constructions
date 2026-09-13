# 002 — responsive image optimization

Status: first bounded homepage slice is integrated into the validated release bundle and browser-verified; Chromium selects WebP derivatives with no visual/accessibility regression.

## Goal

Reduce transferred image bytes without changing approved crops, Media IDs, alt text or the visual baseline.

## First bounded slice

The first slice targets the two highest-value homepage images identified in the existing performance review:

- `assets/home/bathroom-retouched.png` — original 2,135,087 bytes, 1086×1448;
- `estandar/cocina.jpeg` — original 1,832,524 bytes, 4032×3024.

Original files remain canonical fallbacks. No source image is replaced or recompressed in place.

## Reproducible derivatives

`tools/media/build-home-responsive.sh` uses the Ubuntu `cwebp` package with fixed settings (`q=82`, method 6) and produces width-based derivatives.

`Homepage image derivatives` GitHub Actions run #1 on commit `663f412f38fd830bb0fe722fb0914642aa85b26c` completed successfully.

Measured outputs:

| Asset | Width | Bytes |
| --- | ---: | ---: |
| bathroom | 480 | 22,896 |
| bathroom | 768 | 56,418 |
| bathroom | 1086 | 130,290 |
| standard kitchen | 480 | 7,058 |
| standard kitchen | 768 | 14,168 |
| standard kitchen | 1200 | 27,268 |

The full-size WebP bathroom derivative is about 94% smaller than the PNG original; the 1200 px standard-kitchen derivative is about 98% smaller than its 4032 px JPEG source. These are file-size comparisons, not a claim that every request saves exactly that percentage.

## Release integration

`tools/deploy/build-vps-bundle.mjs` now builds the derivatives into `.deploy-dist/assets/responsive/` and patches only the generated release copies of the three homepages (`/`, `/en/`, `/ru/`) with `<picture>` + WebP width `srcset` + explicit `sizes`.

The existing original `<img src>` values and intrinsic width/height remain as fallback. Media records and source identities do not change, and the hero/LCP image is deliberately left out of this first slice.

The release workflow and Visual QA install the `webp` encoder explicitly. The derivative working directories remain ignored development artifacts.

## Browser verification — run #30

`Visual QA` run #30 on commit `073a29dc01213c9b12c929fa26630d456984d554` completed successfully.

Across ES / EN / RU and 390 / 768 / 1440 widths:

- standard Visual QA remained green;
- accessibility QA remained green;
- Chromium selected and actually requested WebP derivatives for both optimized images;
- original fallback paths remained present in the markup;
- release-selected assets existed in `.deploy-dist`.

Observed browser selections were intentionally smaller than the largest generated candidates:

| Viewport | Bathroom selected | Standard kitchen selected |
| --- | --- | --- |
| 390 | 480w — 22,896 B | 480w — 7,058 B |
| 768 | 480w — 22,896 B | 480w — 7,058 B |
| 1440 | 768w — 56,418 B | 480w — 7,058 B |

The 1086w/1200w files remain available for layouts or DPR/device conditions that require them.

Human review of the new 390 and 1440 screenshots found the approved crop/layout intact; no picture-wrapper regression was visible.

## Ready when

- [x] Derivative generation is deterministic and CI-reproducible.
- [x] Originals remain untouched.
- [x] First derivative sizes are recorded.
- [x] Responsive sources are wired into the generated release homepage markup.
- [x] Browser QA confirms no crop/layout regression at 390, 768 and 1440 widths.
- [x] Browser audit confirms the optimized sources are actually selected and requested by Chromium.

## Next

Expand the same pattern selectively, starting with the largest Smart Home/project-detail images. Do not generate 39×N gallery variants in one jump; rank by transferred bytes and visible usage, then keep each slice bounded and re-run the approved visual/accessibility matrix.
