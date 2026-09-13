# 002 — responsive image optimization

Status: reproducible derivative builder is green in GitHub Actions; first two heavy homepage assets have measured WebP derivatives, integration into site markup is pending.

## Goal

Reduce transferred image bytes without changing approved crops, Media IDs, alt text or the visual baseline.

## First bounded slice

The first slice targets the two highest-value homepage images identified in the existing performance review:

- `assets/home/bathroom-retouched.png` — original 2,135,087 bytes, 1086×1448;
- `estandar/cocina.jpeg` — original 1,832,524 bytes, 4032×3024.

Original files remain canonical fallbacks. No source image is replaced or recompressed in place.

## Reproducible derivatives

`tools/media/build-home-responsive.sh` uses the Ubuntu `cwebp` package with fixed settings (`q=82`, method 6) and produces width-based derivatives outside the public bundle by default.

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

The full-size WebP bathroom derivative is about 94% smaller than the PNG original; the 1200 px standard-kitchen derivative is about 98% smaller than its 4032 px JPEG source. These are file-size comparisons only, not a claim that every browser request will save exactly that percentage.

## Integration rules

- Preserve original `<img src>` as fallback.
- Add WebP through `<picture>`/`srcset` with explicit `sizes`; do not change object-position or CSS crop.
- Preserve intrinsic `width`/`height` on fallback images to avoid CLS.
- Keep the hero fetch priority behavior unchanged until LCP is measured separately.
- Do not generate derivatives for all 39 gallery assets in this slice; first verify the two high-impact homepage images against the approved screenshot baseline.

## Ready when

- [x] Derivative generation is deterministic and CI-reproducible.
- [x] Originals remain untouched.
- [x] First derivative sizes are recorded.
- [ ] Responsive sources are wired into the generated homepage markup.
- [ ] Browser QA confirms no crop/layout regression at 390, 768 and 1440 widths.
- [ ] Network audit confirms the optimized sources are actually selected by Chromium.

## Next

Integrate the committed/generated derivative assets into homepage markup, rerun Visual QA, then decide whether to expand the same pipeline to Smart Home, project detail and gallery images.
