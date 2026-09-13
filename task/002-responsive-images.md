# 002 — responsive image optimization

Status: homepage high-impact images, Standard project, bounded Premium project and the homepage LCP hero are integrated and browser-verified. Originals, Media IDs, alt text, intrinsic dimensions and approved crops remain intact.

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

Each receives 480w / 768w / 1200w WebP candidates. The kitchen derivative is also reused on `/projects/` and on the homepage.

### EXIF orientation safeguard

The first project-detail browser pass exposed an important visual regression: several source JPEGs store their viewing orientation in EXIF metadata, while a direct `cwebp -resize` conversion produced rotated WebPs. Automated structural checks were green, but human screenshot review caught the defect.

The derivative builder now runs every source through ImageMagick `-auto-orient` before stripping metadata and encoding WebP. CI installs both ImageMagick and `webp`.

### Final browser selection — run #45

Visual QA run #45 on `a47740d5876490df7fa64b970c51449d85a0c8c2` completed successfully. Chromium selected and actually requested these combined project-detail payloads at 1×:

| Viewport | Selected WebP bytes for all 6 project photos |
| --- | ---: |
| 390×844 | 80,566 B |
| 768×1024 | 93,344 B |
| 1440×1000 | 214,548 B |

Compared with the six original files totaling 13,644,080 B, that is roughly 99.4%, 99.3% and 98.4% less transferred bytes for this bounded six-request comparison. It is not a claim about complete page weight, cache behavior or higher-DPR devices.

Dedicated screenshots reported zero failed requests, zero broken images and zero horizontal overflow. Human review confirmed correct orientation and unchanged object-fit crops/layout.

## Slice 4 — Premium project high-transfer images

The Premium project route is `/projects/trabajos-contrata-premium/`. Rather than generate variants for every image, this slice targets the ten largest gallery files that dominate transfer cost:

- `premium/pladur-instalacion.jpeg`;
- `premium/pladur-obra.jpeg`;
- `premium/prep-techo-1.jpeg` through `prep-techo-4.jpeg`;
- `premium/techo-1.jpeg` through `techo-4.jpeg`.

Those ten originals total **26,312,747 B**. Smaller Premium lead/support files remain on originals in this bounded slice.

Each selected source has EXIF-aware 480w / 768w / 1200w WebP derivatives. `Responsive image derivatives` run #8 on commit `99f12f4565c329ae3ad78e1f35593deeb328dab5` completed successfully.

Dedicated Premium verification is now complete. Visual QA run #64 on `bfbcb7bd7dde15d2f69a663c3c7160f861ec81af` reported zero failed requests, zero broken images and zero horizontal overflow, while Chromium selected and requested:

| Viewport | Selected bytes for 10 Premium images |
| --- | ---: |
| 390×844 | 177,286 B |
| 768×1024 | 177,286 B |
| 1440×1000 | 382,392 B |

The 480w and 768w generated candidate totals remain 177,286 B and 382,392 B respectively; the 1200w candidate set totals 789,948 B for higher-density/larger-slot use. The table above is the actual 1× browser-selected result for the reference matrix.

`tools/media/patch-premium-project-responsive.mjs` patches only the release copy with `<picture>` + width `srcset` + `sizes`, retaining original `<img src>`, intrinsic dimensions and alt text. `tools/visual/premium-project.mjs` verifies real `currentSrc`, actual requests, file existence, failed requests, broken images, overflow and full-page screenshots.

## Slice 5 — homepage hero / LCP

The hero was measured before changing delivery. Baseline Visual QA run #63 on commit `2d04103065dc1c9c50f469024f8836511d503833` used a cold-cache, DPR 1, network-only synthetic profile (150 ms latency, 1.6 Mbps down, 750 kbps up, no CPU throttling). The hero was the observed LCP element in all three reference viewports and the same **264,764 B** JPEG was delivered everywhere with no responsive candidates:

| Viewport | Baseline selected file | Baseline bytes | Baseline synthetic LCP |
| --- | --- | ---: | ---: |
| 390×844 | `kitchen-living.jpg` | 264,764 B | 1,892 ms |
| 768×1024 | `kitchen-living.jpg` | 264,764 B | 3,044 ms |
| 1440×1000 | `kitchen-living.jpg` | 264,764 B | 3,240 ms |

The measured experiment keeps the original JPEG fallback and existing CSS crop, keeps `fetchpriority="high"`, and deliberately does **not** add preload. It adds 480w / 768w / 1152w WebP candidates through the release-only homepage patch.

`Responsive image derivatives` run #9 generated hero candidates of **28,102 B**, **55,556 B** and **95,278 B**. Visual QA run #64 then measured the same controlled profile:

| Viewport | Selected responsive hero | Selected bytes | Synthetic LCP | Byte reduction vs JPEG | LCP reduction vs baseline |
| --- | --- | ---: | ---: | ---: | ---: |
| 390×844 | `kitchen-living-480.webp` | 28,102 B | 632 ms | 89.4% | 66.6% |
| 768×1024 | `kitchen-living-480.webp` | 28,102 B | 640 ms | 89.4% | 79.0% |
| 1440×1000 | `kitchen-living-768.webp` | 55,556 B | 892 ms | 79.0% | 72.5% |

These timings are synthetic comparison data, **not field Core Web Vitals**. Their purpose is to compare before/after under the same controlled profile. Chromium selected the responsive WebP at all three widths, the hero remained the observed LCP in 3/3 cases, and viewport screenshot review at 390 / 768 / 1440 shows the approved object-fit composition intact.

Because `fetchpriority="high"` is already present and discovery is early, no preload was added. Any future preload change should be justified by a separate timing experiment rather than assumed to help.

## Release integration

`tools/media/build-home-responsive.sh` creates deterministic width-based derivatives. The pipeline auto-orients sources with ImageMagick, strips metadata and encodes WebP with `cwebp` q=82 / method 6.

`tools/deploy/build-vps-bundle.mjs` generates derivatives into `.deploy-dist/assets/responsive/`. Homepage/project markup is patched only in the release copy. `tools/media/patch-home-hero-responsive.mjs` adds the hero `<picture>` source for ES/EN/RU while preserving the original hero `<img>` fallback and `fetchpriority`.

Original `<img src>` paths and intrinsic width/height remain as fallbacks. Source `site-next` generated HTML is not hand-edited for these release-only delivery changes.

`tools/visual/hero-lcp.mjs` records LCP element/timing, selected resource, file bytes, responsive-candidate presence, preload/fetchpriority state and reference screenshots. Project-specific verifiers continue to protect the Standard and Premium slices.

## Ready when

- [x] Derivative generation is deterministic and CI-reproducible.
- [x] Originals remain untouched and Media IDs stable.
- [x] Homepage bathroom + standard-kitchen responsive sources are browser-verified.
- [x] Smart Home responsive sources are browser-verified.
- [x] Standard project detail uses responsive sources for all six displayed photographs.
- [x] EXIF-dependent source orientation is preserved in generated derivatives.
- [x] Standard project has dedicated screenshots at 390 / 768 / 1440 widths with no render failures or horizontal overflow.
- [x] Premium high-transfer subset is ranked, integrated and browser-verified at all three reference widths.
- [x] Dedicated Premium screenshots confirm no request/image/overflow regression.
- [x] Hero/LCP baseline is measured before optimization.
- [x] Hero responsive experiment is measured under the same synthetic profile and keeps the approved crop/fallback.
- [x] Full Visual QA remains green after hero delivery changes.

## Next

Keep the 39-image gallery as a separate bounded decision: rank actual source/transfer impact first, then optimize the highest-value subset rather than generating 39×N variants blindly. The remaining shared reduced-motion `scroll-behavior: smooth` advisory can be cleaned up independently because it is not part of image delivery.
