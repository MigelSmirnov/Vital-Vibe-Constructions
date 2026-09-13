# HANDOFF

Version: 59
Updated: 2026-09-13T21:09:34Z

## Session rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This is a living handoff. Historical detail belongs in commits and architecture artifacts.

## Start here

1. Read `AGENTS.md` and its required architecture contracts in order.
2. Continue from `task/README.md`; responsive-image history is tracked in `task/002-responsive-images.md`.
3. Prepare the full-site release on `release/vps-migration`; read `task/004-release-branch-audit.md`. Keep each new feature in its own `agent/<task>` branch.
4. Do not hand-edit generated `site-next` output instead of changing builders/reproducible release steps.
5. Run `node tools/checks/run.mjs` after content, route, builder or generated-output changes.

## Production — VPS cutover completed 2026-09-13

**Published and verified:** https://vitalvibeconstruction.com serves release SHA `2695336c8117234206bc4a3e19009ae517f7094f` with responsive article photographs. `/srv/vital-vibe/current` points to release `20260913-2695336`. Archive SHA-256: `e081bca9155398e72fb0a06ea61c5ca510f22902646513a0f38194e4bc55ca6b`.

Owner changed DonDominio manually: apex now has one A record `152.228.139.236`; www CNAME is `vitalvibeconstruction.com.`. Both authoritative servers agree. Existing app, other subdomains and mail records were preserved. Original zone screenshots and private nginx backup are retained on VPS under `/home/ubuntu/vvc-migration-fb31a282/backup/`.

Existing nginx handles public TLS and forwards to dedicated Caddy on `127.0.0.1:8890`; Caddy admin remains loopback-only and releases are mounted read-only under UID 65534. A dedicated nginx virtual host was added; all previous nginx files remain byte-identical. Caddy runtime config fixes asset-cache header precedence, retains SAMEORIGIN and preserves the approved site artifact. This shared-server topology uses Certbot/nginx TLS instead of direct Caddy ACME. Nginx emits its own Server header; HTTPS omits its version.

Certificate covers apex + www until 2026-12-12. **Automatic renewal is configured and test-verified** with webroot HTTP-01, active Certbot timer and a certificate-scoped nginx reload hook. The two manual ACME TXT entries are obsolete and may be removed by the owner; no automatic DNS access is configured.

Validation: 35 tests, gallery 39/39, 12 localized article pages, audit 0 errors / 5 warnings; 23 sitemap routes and nine historical redirects checked on public HTTPS; 69 pre-cutover browser page checks plus 21 final public browser checks and nine public solar iframe/control checks. No broken images, JS errors or horizontal overflow in the checked pages. Painting retains 10 sections / two photos; renovation-cost article retains 11 sections / six photos. HTTP→HTTPS and www→apex work. Planner `/manual` remained byte-identical. No 5xx or Caddy error messages in the sampled logs; one missing favicon and rejected .env probes were observed.

GitHub Pages configuration remains `main:/` with its custom domain and HTTPS intact for DNS rollback. Previous release `20260913-13f0f47` is retained for symlink rollback (working solar iframe, heavier article photographs). Initial release `20260913-fb31a282` is also retained as historical recovery material. Article source CSS, its builder and generated CSS links changed in the follow-up fix; article copy, animation source, support.js, main and PR #6 remain unchanged.

**Operational follow-ups are not claimed complete:** shared VPS still permits SSH passwords and root key login; provider firewall/DDoS controls, registrar MFA and external uptime monitoring have not been verified/configured in this task. Handle those with the shared-server recovery/access context. See [execution report](architecture/vps-cutover-20260913/report.md). The public website migration itself is complete.

## Netlify preview closed to anonymous access

Owner authorized restricting the preview. Netlify project `vital-vibe-preview` now requires team login for all deploys. Both preview alias and deploy permalink return 401 anonymously; the primary VPS site remains public at SHA 2695336 and planner is unchanged. This supersedes the audit finding that preview was publicly indexable. See [settings, checks and rollback](architecture/netlify-preview-private/report.md).

## Crawler and AEO audit

Read-only audit of current production completed: all 25 checked canonical pages accessible in raw HTML; 24 user-agent probes passed. Two sitemap omissions (/en/, /ru/) and an indexable Netlify preview identified. Article content has useful first-hand evidence; actual new-page indexing and AI citations remain unverified without webmaster data. See [audit and priorities](architecture/crawler-aeo-audit/report.md). No production changes were made.

## Painting and floor photograph delivery

The eight photographs added after earlier responsive-image work still used full JPEG files. Production now generates 24 WebP derivatives and responsive sources for six localized article pages and three catalogs. Originals, text, captions, crop, layout and lazy-loading policy are preserved. The selected eight-photo payload falls from 2,074,102 bytes to 144,364 at 390/768 px DPR1 or 314,868 at 1440 px DPR1 (about 93% / 85% smaller); these are file sizes, not load-time measurements.

All 36 browser cases passed locally and all 36 on public HTTPS, including desktop DPR2. Canonical 35 tests and production bundle validation passed; 23 public routes and nine redirects passed. Scope comparison confirmed every other release file unchanged, including the solar fix. Planner remained byte-identical. DNS and server configuration did not change. See [report and evidence](architecture/article-photo-delivery/report.md).

## Solar iframe correction after owner screenshot

Owner reported a blank animation on a wide desktop. Reproduced: the old CSS margin formula reduced the iframe to 202 px at 1440 px and zero width at 1920/2560 px. Earlier checks confirmed loading and controls but did not assert embed width, so their “pass” missed this layout defect. Fixed source CSS to bounded desktop margins, kept mobile margins, and added content-hashed CSS URLs to refresh cached styles. Builders regenerated all affected outputs; article copy and animation are unchanged.

New `tools/visual/solar-embed.mjs` is part of visual QA and checks iframe/caption width, viewport fit and controls on ES/EN/RU at 390/768/1024/1440/1920/2560. It failed on the old artifact and passed all 18 cases locally and all 18 on production after deployment. Wide-screen iframe is now 768 px; an actual 1920 px production screenshot was visually inspected. See `architecture/solar-embed-width-fix.md`. Fresh production bundle and 35 canonical tests passed; public routes and redirects passed. DNS/server/TLS settings did not change for this fix.

## Previous stage (historical)

The human-approved visual baseline, semantic/accessibility layer, homepage responsive images, Standard/Premium project slices, homepage hero/LCP delivery, bounded gallery high-transfer reuse and shared reduced-motion follow-up are green. Production and DNS remain unchanged.

Reference states:

- visual baseline: run #15 / `b34f72fd7902235cd24206f9a56ea9e243e89c92`;
- accessibility baseline: run #23 / `b23f0b9046e359f181f4065cc76665310f9d6188`;
- Standard project responsive slice: run #45 / `a47740d5876490df7fa64b970c51449d85a0c8c2`;
- hero/LCP baseline: run #63 / `2d04103065dc1c9c50f469024f8836511d503833`;
- Premium + responsive hero acceptance: run #64 / `bfbcb7bd7dde15d2f69a663c3c7160f861ec81af`;
- gallery top-16 responsive reuse: run #66 / `2c38471b8cd31af0c02137c40df6e16f479e4cac`;
- docs/state control after gallery: run #67 / `75517e4276cafe96b50fb2caae72a428f263b8a6`;
- reduced-motion cleanup: run #68 / `c583479bfbd639856143212c52876e949b5ccf40`.

## Responsive-image system

`tools/media/build-home-responsive.sh` auto-orients source photos with ImageMagick before stripping metadata and encoding WebP with `cwebp` q=82 / method 6. CI installs `imagemagick` + `webp` because some legacy JPEGs store intended orientation in EXIF metadata.

`tools/deploy/build-vps-bundle.mjs` generates responsive assets into `.deploy-dist/assets/responsive/`. Delivery changes are release-only and preserve original `<img src>` fallbacks, intrinsic dimensions, Media IDs and alt text. `<picture>` is layout-neutral (`display: contents`) so existing crop rules remain authoritative.

Current release helpers/verifiers include homepage hero, Standard project, Premium project and gallery top-16 reuse. The gallery keeps all 39 contract images; only the six Standard + ten heavy Premium images reuse responsive project derivatives. The remaining 23 stay original until a new measured reason justifies more work.

### Key measured results

- Standard six: **13,644,080 B** originals → **80,566 / 93,344 / 214,548 B** selected at 390 / 768 / 1440 in run #45.
- Premium top ten: **26,312,747 B** originals → **177,286 / 177,286 / 382,392 B** in run #64.
- Hero: **264,764 B** JPEG baseline → **28,102 / 28,102 / 55,556 B** selected after responsive delivery. Controlled synthetic LCP changed **1,892/3,044/3,240 ms → 632/640/892 ms**. These are comparative synthetic timings, not field CWV.
- Gallery bounded top 16: **39,956,827 B** original source payload → **257,852 B** selected in each 1× reference viewport during the full-scroll verification in run #66. This is not complete page weight; 23 other images remain original/lazy-loaded.

## Reduced motion

The remaining advisory came from shared secondary CSS computing `scroll-behavior: smooth` even when the browser requested `prefers-reduced-motion: reduce`.

`tools/media/patch-reduced-motion.mjs` now appends a deterministic release-only override to `.deploy-dist/styles.css`:

`@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }`

`tools/visual/reduced-motion.mjs` is a blocking check in `tools/visual/run.sh`. It verifies `/gallery/` and `/projects/estudio-reformado-barcelona/` under a real reduced-motion browser context and fails unless computed scroll behavior is `auto`.

Run #68 completed successfully, so the previous gallery/El Raval smooth-scroll advisory is closed. Normal-motion smooth scrolling remains unchanged.

## Visual/accessibility reference

Completed UI fixes remain: grouped 39-image gallery; El Raval pending-photo status removed; mobile project cards stacked; Smart Home mobile density reduced; Article desktop centered in a 1040 px editorial frame.

Semantic contract: `--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--border`.

## Solar collector material — ported

Historical branch `agent/add-solar-collector-animation` was not merged wholesale. Its technical article was ported into the current Article/content-table architecture on `agent/solar-collector-port`, with ES/EN/RU routes, two owner-provided evidence photographs and verified Bosch/Buderus/IDAE source links. The owner then supplied `solar-collector-updated-v3.html` as the authoritative animation revision. It replaces the simplified first port and is embedded from `tools/articles/solar-collector-v3.html`, with completed ES/EN translations, keyboard-accessible controls and reduced-motion behavior. `node tools/checks/run.mjs` is green. Revision v3 was deployed to the Netlify preview and its controls and three languages were browser-verified.

Painting and floor articles now exist in ES/EN/RU. Painting has two owner photographs (crack and loose coating) and an owner-confirmed EUR 4–6/m² labour-only prepared-wall rate; materials and preparation are separate. Floor article has six owner photographs grouped into three distinct jobs, uses the latest approximately 14 cm over 10 m figure, and retains the subcontractor context for the unlevelled floor. Full checks passed. Preview deployed; browser checks confirmed catalog-to-article navigation, the painting price and all six floor photographs. Unselected originals remain in conversation uploads.

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

The prepared release and actual blockers are recorded at the top of this handoff and in `architecture/vps-cutover-20260913/report.md`. Public hosting and DNS remain unchanged; VPS cutover is still authorized.

## Article editorial correction

Owner rejected the condensed report-style rewrites. Restored the original Spanish painting draft (all nine sections plus public FAQs) and full Russian renovation-cost article (eleven sections, including floor preparation). Translations preserve the same narrative. Photographs illustrate the existing paragraphs, with the confirmed 14 cm / 10 m example and labour-only painting price added. Existing URLs are retained. Original paragraphs/list items were compared against both drafts with no omissions; full checks passed. Preview deployed and browser verified: 10 painting sections, 11 renovation-cost sections, six floor images. Do not summarize or reframe owner articles without an explicit request.

## Immediate next action

Observe production, retain GitHub Pages and the prepared rollback records, and close the operational security/monitoring follow-ups in the execution report. Owner can remove the two temporary ACME TXT records; renewal now uses HTTP-01. Further content/design changes require a separate task.

## Release branch reconciliation — 2026-09-13

Created `release/vps-migration` from preserved source `06ebb34b33b5b3a6d06359bf53af16607e94e4f2`. Integrated `main` at `b89f003784b81ad6cf8efe672d6cc78446c07954` in merge `f13a031958e1782c96eaa9533cc4392898755fc2`, with exactly the source tree unchanged. The 33 main-only commits have zero net file changes against common ancestor `56ba3ec959a371ea1eb283d835ab5da7dc0be3d9`; no rejected redesign was restored by the merge. See `task/004-release-branch-audit.md`. Full canonical checks passed before and after reconciliation: 35 tests, gallery 39/39, 12 article pages, audit 0 errors / 5 warnings; generated projections unchanged. WebP production build and real Caddy checks remain pending. `main`, original feature branches, production and DNS were not changed.
