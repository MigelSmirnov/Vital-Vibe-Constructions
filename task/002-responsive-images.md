# 002 — responsive image optimization

Status: homepage high-impact images, Standard project, bounded Premium project, homepage LCP hero and the highest-transfer gallery subset are integrated and browser-verified. Originals, Media IDs, alt text, intrinsic dimensions and approved crops remain intact.

## Goal

Reduce transferred image bytes without changing approved crops, Media IDs, alt text or the visual baseline.

## Delivery policy

- Derivatives are generated deterministically with ImageMagick `-auto-orient`, metadata stripping and `cwebp` q=82 / method 6.
- Original files remain untouched and remain the `<img src>` fallback.
- Responsive markup is applied only to the release copy in `.deploy-dist`; generated `site-next` HTML is not hand-edited.
- `<picture style="display:contents">` keeps existing layout and `object-fit` rules authoritative.
- Browser verification checks `currentSrc`, the actual requested resource and release-bundle file presence.

## Slice 1 — homepage bathroom + Standard kitchen

- `assets/home/bathroom-retouched.png` — 2,135,087 B.
- `estandar/cocina.jpeg` — 1,832,524 B.
- Run #30 / `073a29dc01213c9b12c929fa26630d456984d554`: browser selection, fallback retention, visual QA and accessibility QA passed.

## Slice 2 — Smart Home

Five images total **1,752,633 B** in their originals and receive 320w / 640w / 960w WebP candidates. Run #34 / `d43d45294efe9169c26361712a2a9b008c231204` confirmed real browser selection and no visible/accessibility regression.

## Slice 3 — Standard project detail

`/projects/reforma-integral-estandar-barcelona/` uses six large photographs totaling **13,644,080 B**. All six have 480w / 768w / 1200w candidates.

The first conversion exposed a legacy JPEG EXIF-orientation problem: direct conversion rotated some photos. Human screenshot review caught it even though structural QA was green. The pipeline now performs `-auto-orient` before WebP encoding.

Run #45 / `a47740d5876490df7fa64b970c51449d85a0c8c2` selected these combined 1× payloads:

| Viewport | Selected bytes |
| --- | ---: |
| 390×844 | 80,566 B |
| 768×1024 | 93,344 B |
| 1440×1000 | 214,548 B |

Final project screenshots showed correct orientation, 0 failed requests, 0 broken images and 0 horizontal overflow.

## Slice 4 — Premium project high-transfer images

The bounded Premium set is the ten large gallery sources `pladur-instalacion`, `pladur-obra`, `prep-techo-1..4`, and `techo-1..4`. Their originals total **26,312,747 B** and receive 480w / 768w / 1200w WebP candidates.

Run #64 / `bfbcb7bd7dde15d2f69a663c3c7160f861ec81af` confirmed real browser requests:

| Viewport | Selected bytes for 10 images |
| --- | ---: |
| 390×844 | 177,286 B |
| 768×1024 | 177,286 B |
| 1440×1000 | 382,392 B |

The run reported 0 failed requests, 0 broken images and 0 horizontal overflow.

## Slice 5 — homepage hero / LCP

The hero was measured before changing delivery. Baseline run #63 / `2d04103065dc1c9c50f469024f8836511d503833` used a cold-cache, DPR 1, network-only synthetic profile: 150 ms latency, 1.6 Mbps down, 750 kbps up, no CPU throttling. `.hero-image` was the observed LCP in all three reference viewports and the same **264,764 B** JPEG was delivered everywhere.

| Viewport | Baseline LCP | Responsive file | Responsive bytes | Optimized LCP |
| --- | ---: | --- | ---: | ---: |
| 390×844 | 1,892 ms | `kitchen-living-480.webp` | 28,102 B | 632 ms |
| 768×1024 | 3,044 ms | `kitchen-living-480.webp` | 28,102 B | 640 ms |
| 1440×1000 | 3,240 ms | `kitchen-living-768.webp` | 55,556 B | 892 ms |

The accepted release markup retains the JPEG fallback, approved crop and `fetchpriority="high"`. No preload was added. These timings are controlled synthetic comparison data, not field Core Web Vitals. Run #64 and human screenshot review kept the hero composition intact.

## Slice 6 — gallery highest-transfer subset

The gallery contract remains **39/39 images**. Instead of generating 39×N new variants, the source ranking showed that the six Standard images plus the ten already-optimized Premium images are the 16 dominant files. Together their original source payload is **39,956,827 B**:

- Standard six: **13,644,080 B**;
- Premium top ten: **26,312,747 B**.

No additional derivatives were needed: the gallery release copy now reuses the already-generated 480w / 768w / 1200w project derivatives for those same source identities. The remaining 23 gallery images stay on their originals for now.

Visual QA run #66 / `2c38471b8cd31af0c02137c40df6e16f479e4cac` confirmed Chromium selected and actually requested responsive WebP for all 16 bounded images:

| Viewport | Gallery images | Responsive checked | Selected bytes for 16 | Failed requests | Broken images | Overflow |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 390×844 | 39 content + logo | 16 | 257,852 B | 0 | 0 | no |
| 768×1024 | 39 content + logo | 16 | 257,852 B | 0 | 0 | no |
| 1440×1000 | 39 content + logo | 16 | 257,852 B | 0 | 0 | no |

For this bounded 16-request full-scroll comparison, 257,852 B versus 39,956,827 B is about **99.35% less source payload**. This is not a claim about complete gallery page weight: 23 other gallery images remain original, and normal user transfer also depends on lazy loading and scroll depth.

Human review of the run #66 390 / 768 / 1440 gallery screenshots shows the existing two-/three-column composition, image orientation and card crops intact.

## Release integration and verification

- Derivative builder: `tools/media/build-home-responsive.sh`.
- Release bundle: `tools/deploy/build-vps-bundle.mjs`.
- Hero patcher: `tools/media/patch-home-hero-responsive.mjs`.
- Standard patcher: `tools/media/patch-standard-project-core.mjs`.
- Premium patcher: `tools/media/patch-premium-project-responsive.mjs`.
- Gallery reuse patcher: `tools/media/patch-gallery-responsive.mjs`.
- Browser checks: `tools/visual/responsive-images.mjs`, `standard-project.mjs`, `premium-project.mjs`, `gallery-responsive.mjs`, `hero-lcp.mjs`.

## Ready when

- [x] Derivative generation is deterministic and CI-reproducible.
- [x] Originals remain untouched and Media IDs stable.
- [x] Homepage high-impact images are browser-verified.
- [x] Standard project responsive delivery is browser-verified and EXIF-safe.
- [x] Premium top-ten responsive delivery is browser-verified.
- [x] Hero/LCP was measured before optimization and re-measured afterward.
- [x] Highest-transfer gallery subset reuses existing responsive project derivatives.
- [x] Gallery retains complete 39/39 contract coverage.
- [x] Full Visual QA remains green after gallery delivery changes.

## Next

Responsive-image work is sufficiently bounded for the current release. Do not mass-generate variants for the remaining 23 gallery images without a new measured reason. Next address the shared reduced-motion `scroll-behavior: smooth` advisory, then return to the deferred solar-collector article/animation when the owner chooses to resume it.
