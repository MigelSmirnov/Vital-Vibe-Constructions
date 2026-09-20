# Solar iframe width correction — 2026-09-13

Owner screenshot showed a blank diagram and a squeezed caption. Public iframe requests and SAMEORIGIN were correct; the problem was CSS layout.

The old `max(-24px, calc((720px - 86vw) / -2))` margin becomes increasingly positive on wider viewports. Browser measurements on the old public release:

| Viewport | Article column | Iframe width |
| --- | --- | --- |
| 390 | 346 | 346 |
| 768 | 440 | 488 |
| 1024 | 689 | 528 |
| 1440 | 720 | 202 |
| 1920 | 720 | 0 |
| 2560 | 720 | 0 |

Changed only the desktop embed margin to fixed -24 px, retaining the existing mobile zero margin. The iframe remains at least as wide as its text column without overflowing the viewport. Generated article/catalog stylesheet links include a hash of the CSS contents, so existing cached `/article.css` cannot delay delivery of this correction. No new dependencies, article rewrites, animation changes or hand-edited generated output.

Added `tools/visual/solar-embed.mjs` to the visual runner. It checks real bounding boxes, caption width, viewport overflow and same-side/diagonal/pause controls for ES/EN/RU at six widths, including 1920 and 2560. The test failed on the old archive as expected; all 18 local cases and all 18 public cases passed on the fix. The corrected iframe is 768 px on both wide viewports. A production screenshot at 1920 px was visually inspected. Previous acceptance only checked that frames and controls loaded, so it missed zero-width/narrow layout; that gap is now covered explicitly.

Release SHA: `13f0f47c92b44c0ab057ae32b453c0e0641052d4`.
Archive SHA-256: `21900aa69131ffdb401d133f2cd739176f6dadd7d7a8f4d19e345ebe70869a7d`.
Installed `/srv/vital-vibe/releases/20260913-13f0f47`; public DEPLOYMENT_COMMIT verified. Fresh production image build, bundle validation (23 sitemap routes / 29 HTML), 35 canonical tests and public route/redirect checks passed. Audit remains 0 errors / 5 warnings. Runtime nginx/Caddy configuration, DNS and certificate settings were not changed.

Previous release `20260913-fb31a282` and its original archive remain available for rollback, although that release has this known layout defect. Public browser evidence is `architecture/vps-cutover-20260913/solar-width-public.json`.
