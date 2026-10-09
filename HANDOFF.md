# HANDOFF

Version: 76
Updated: 2026-10-09

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

## Combined Facebook / copy release — 2026-10-09

PR #22 now combines the Facebook link with the Spanish customer-facing copy correction from `3e6d809710c4aed6c4051c0e33b0fa2bc268652e`. PR #10 draft remains excluded. See `task/006-facebook-copy-release.md` for the pinned-artifact workflow and home-machine deployment handoff. Production remains unchanged.

## Facebook page link — 2026-10-09

Owner requested a visible link to the connected Vital Vibe Construction Facebook page (1497572453430978). Branch `agent/facebook-page-link` adds it to homepage contacts and footer in ES/EN/RU and Organization `sameAs`. The URL is centralized in the ContactDetails source record and carried through the Knowledge Repository; no Facebook scripts or advertising tracking are added. Canonical checks passed with 43 tests, 0 errors and 5 existing warnings. Production is not deployed: this workspace has GitHub access but no supplied VPS deployment connection.

## Joanic masonry classification removed — 2026-10-04

The owner's production screenshot showed that the Joanic detail page still inherited the generic masonry description about demolition and partitions, although that work was not performed. The Project and all four associated Media records are now classified only as `painting`; the homepage placement remains under Painting. PR #20 merged into `main` as `a708049f523ab803e0646b193067c46dede42875`.

Production serves source `013c8b18855d0076534331db4971e55f616c70dd` from `/srv/vital-vibe/releases/20261004-013c8b1`. All 43 public route bodies match the CI artifact exactly, and the ES, EN and RU project pages list only Painting / «Покраска», with no masonry / Building work / «Общестроительные работы». Archive SHA-256: `9a3761b56d4dd9dbfe5a0afeb3b33a18a190cb661f3a38a86579a2b7125c4abb`. Rollback: `20261004-6b0061d`. DNS and server configuration were unchanged.

## Joanic card moved to Painting — 2026-10-04

At the owner's request, the Joanic communal-staircase project card in the homepage Services block moved from masonry / Building work / «Общестроительные работы» to painting / Painting / «Малярные работы». At this release the Project still had both classifications; that metadata was corrected in the later release recorded above. PR #18 merged into `main` as `bbbfbff082b7e6cf543fe28976ea7f6acc808844`.

Production serves `6b0061df1b4efbf0895d58556cbe55d4dff3fc6f` from `/srv/vital-vibe/releases/20261004-6b0061d`. All 43 public route bodies match the CI artifact exactly. Browser QA asserts that the card appears exactly once under `#pintura` and never under `#albanileria` in ES, EN and RU. Archive SHA-256: `a5150335e8f570944050885ba451e5f0095bccb35be33f24b7a13240372936ae`. Rollback: `20261004-d482617`. DNS and server configuration were unchanged.

## Parquet article copy correction published — 2026-10-04

At the owner's request, the internal invoice identifier and the list of unrelated purchases were removed from the parquet case in ES, EN and RU. The paragraph now states only that the phase calculation includes materials directly related to the floor; the retained sandbox draft was corrected as well to prevent reintroduction. PR #16 merged into `main` as `156057a33527bc18cc0b50f72743cdcc05b9f2d7`.

Production serves source `d482617769de9d565463f26f9eb3455bdaa9e6ef` from `/srv/vital-vibe/releases/20261004-d482617`. All 43 public route bodies match the new CI artifact exactly, the removed identifier is absent from all three public locales, and responsive WebP delivery remains valid. Archive SHA-256: `eef2c174810fd1497a1612af1aa10e084510995a00c483226cb65af309f2bc6f`. Rollback: `20261004-e35b7e4`. DNS and server configuration were unchanged.

## Parquet floor article published on VPS — 2026-10-04

PR #14 was merged into `main` as `122ecfb5f84b18ed0570fd528fb7e4bc83b94e8e`. Production serves the pinned, CI-verified feature commit `e35b7e437cb83b7c5941e7ffccf978f7b1e141ec` from `/srv/vital-vibe/releases/20261004-e35b7e4`; the merge commit has the identical tree. The GitHub Actions bundle was revalidated locally (43 sitemap routes / 47 HTML files, 120 WebP files) and uploaded with SHA-256 `94500d160d0a5bedebb5244ae1d59052d01448d62693d30539666d4289508f22`.

All 43 public sitemap route bodies match the release artifact exactly. The ES, EN and RU parquet article routes return the new content and responsive WebP photograph; HTTP and `www` redirect to canonical HTTPS. The electrical planner still returns 200, and the sampled Caddy log contains no error-level entries or 5xx responses. DNS, nginx/Caddy configuration and the planner were not changed. Rollback remains `20260927-765856d`. See `architecture/parquet-floor-vps-release-20261004.md`.

## Browser QA recovery — 2026-10-03

Fixed the Joanic service-card test to scroll its lazy image into view and wait for successful loading before strict decoding. The two previous runs failed at image.decode on different locales; all 120 artifact WebP files decoded independently. On source a1608e22ee07e16364a6d77f277ba53eb1660bff all four GitHub workflows passed. Visual QA run 37130573908 passed all 15 service-card layout cases and 48 article image page/viewport/DPR cases, including the parquet article. This test fix itself changed no public page content; the verified article release was subsequently activated as recorded above.

## Parquet floor article prepared — 2026-10-03 (historical)

Owner requested repository integration and website publication. PR #14 now promotes VVC-ART-005 to article-parquet-floor with full ES/EN/RU narrative, nine sections per language and five owner-selected photographs. Originals retained under assets/parquet-floor; fifteen responsive WebP variants are generated in the release bundle. Public records, routes, catalogs, sitemap and llms are prepared. The old sandbox source is retained as history and removed from the draft manifest. Costs distinguish documented purchases, estimated labour and commercial reference amounts. The historical order code remains unresolved and is not published; the technical paragraph attributes dimensions to the linked official specification.

Local checks: 43 tests, 0 audit errors / 5 existing warnings; bundle 43 routes / 47 HTML; all 120 WebP files decode. Browser launch was unavailable in that local runtime; extended article image QA subsequently passed in GitHub Actions. Production was unchanged at preparation time; the verified pinned bundle was later activated as recorded above.

## Joanic preview layout correction — 2026-09-27

Owner reported the malformed mobile/desktop service card after deployment. Reproduced: inside `picture { display:contents }`, the `source` element generated a grid item, shifting the image into column two and forcing the title into the narrow first column of a second row. Earlier functional acceptance missed internal card geometry. Explicitly hide source metadata in the card, retain the full photo's intrinsic aspect ratio, and enlarge desktop previews to 128px (92px on narrower screens). Homepage CSS now has a content-hashed URL to invalidate the previous cached stylesheet.

`tools/visual/service-project-cards.mjs` reproduces the old failure and asserts source has no box, image/text share a row, readable title width, photo aspect ratio, WebP selection and no overflow at 360/390/768/1024/1440 px in ES/EN/RU. It is included in the regular visual workflow. Canonical checks pass (43 tests, 0 audit errors / 5 existing warnings).

Published and verified as `765856d7e113d83dd4d6e2c8f0a559e86a6e9df8` / `20260927-765856d`, after PR #12 merged into the release branch. All 15 layout cases pass locally and on production; mobile/desktop screenshots inspected. All 40 public route bodies and versioned CSS match the artifact. Bundle validation and decoding of all 105 WebP files pass. Archive SHA-256: `d2b78bead4637091b71bfd459531f7d22379e2555b0aa86ea7cb811a4925c732`; VPS archive `/home/ubuntu/vital-vibe-vps-card-fix.tgz`. Rollback: `20260927-a1b83ad` (retained; contains the prior preview layout bug). Source photos and article text unchanged; DNS/server configuration unchanged.

## Joanic published on VPS — 2026-09-27

Production now serves `a1b83ad864b90ba5f055a6a59df1412179d14f7f` from `/srv/vital-vibe/releases/20260927-a1b83ad`. The owner requested repository verification and deployment from the local machine. A fresh pinned build passed 43 tests, bundle validation (40 routes / 44 HTML files), and decoding of all 105 WebP images. All 40 public route responses match the built HTML exactly. Local and production browser checks each passed 54 project page/viewport cases and nine Joanic homepage-to-project-to-article journeys in ES/EN/RU at 390/768/1440 px. Four photos load, language links work, service 06 opens, and no page-level horizontal overflow was detected.

Actual previous release, checked on the VPS before activation: `20260921-83dcb9f`, SHA `83dcb9f4e77ce65346f7df33060f4a47377b38d1`; retained for rollback. This supersedes the older previous-release assumption in the preparation note. DNS, nginx/Caddy configuration and main were unchanged. See `architecture/joanic-vps-release-20260927.md` for checksum and acceptance evidence. The following preparation notes are historical.

## Joanic VPS release prepared — 2026-09-27 (historical)

Owner reviewed preview and requested VPS branch preparation. PR #9 merged into `release/vps-migration`. Pinned release SHA: `a1b83ad864b90ba5f055a6a59df1412179d14f7f`. Fresh checked archive: `vital-vibe-vps-a1b83ad.tgz`; SHA-256 `20149047fd59a0f1bebc4fcff0a7a66baa5162577ed4fb217c5b166f86add691`. Canonical checks pass (0 errors / 5 existing warnings), tracked projections unchanged; bundle validates 40 sitemap routes / 44 HTML files; all 105 WebP decode cleanly. See `task/005-joanic-vps-release.md` for handoff, build limitations, regenerated derivative and pre-activation/rollback checks. Production, main, DNS and server configuration were not changed. Deployment is the next separate action; do not repeat the historical DNS cutover steps.

## Joanic owner photographs — 2026-09-27

Received four valid owner JPEGs: loose coating removal, filler repair, finished landing and finished staircase. Replaced the truncated lead image with 1000004923.jpg; added the other three to the existing Joanic Media/Project records with ES/EN/RU captions. Original JPEGs remain intact. `tools/media/build-joanic-responsive.mjs` generates EXIF-oriented 480/768/1152 (capped at source width) WebP q82 variants and integrates srcset into the existing localized homepage card, catalog and project pages. It rejects decoder warnings to catch truncated JPEGs. No crop, design or project-copy changes. Canonical checks pass (0 errors / 5 existing warnings); bundle validation passes (40 routes / 44 HTML files). All 12 WebP files decode cleanly and were visually inspected; 480px versions total 92,000 bytes versus 795,128 bytes of originals (88% smaller). Updated branch preview ready: https://6ab90b1e6482ef013606aa31--vital-vibe-preview.netlify.app/ru/ . Source SHA 49dd002a533a943fbceb651c86eee64e33bcb4c6. Live browser/mobile QA remains unverified behind team login. This supersedes the missing-original blocker below.

## Joanic photo and article-link follow-up — 2026-09-27

Owner reported missing photo and painting-article links. The committed `assets/projects/joanic-staircase/final-staircase.jpg` is truncated (6,593 bytes); ImageMagick reports premature JPEG end and visual inspection shows a narrow image strip followed by gray. File existence checks did not catch this. A valid owner original is required; do not invent/reconstruct the photograph. The image issue is still open.

Added explicitly titled, language-matched Article links inside service 06 and on the service-owned Joanic detail page, resolved from existing Article records. Added localized link regression checks; canonical checks pass (0 errors / 5 existing warnings). Copy and design unchanged. Updated branch preview ready: https://6ab909042cf8dce189ae9c7c--vital-vibe-preview.netlify.app/ru/ . Source: 7ea7a7174b40e2330677b1b31c7bc64cac36d833. Bundle validation passed (40 routes / 44 HTML files). Live browser QA remains blocked by team sign-in. Production/main and access protection unchanged.

## Joanic Netlify preview — 2026-09-27

Netlify branch preview deployed from source `1444f923cc0d5b6782126064cf5bcf3770b4a300` to existing `vital-vibe-preview`; deploy `6ab90592e5118bd6bf6c6c55` is ready in `branch-deploy` context. RU URL: https://6ab90592e5118bd6bf6c6c55--vital-vibe-preview.netlify.app/ru/ . Canonical checks passed (0 errors / 5 existing warnings), tracked projections unchanged; bundle validation passed (40 sitemap routes / 44 HTML files). Static artifact confirms Joanic inside masonry service 06, RU detail link, no lower homepage duplicate and referenced image files present. Live accordion, image rendering and mobile overflow verification remain blocked by Netlify team sign-in in the browser. Team-login protection and published deploy `6aa6e79ae275bb6ae5c7c792` are unchanged; production/main untouched.

## Joanic staircase painting — ready for review 2026-09-27

Working branch: `agent/joanic-staircase-project`. PR #9 targets `release/vps-migration`.

Added `project-escalera-joanic-pintura`: repair and painting of a 92 m² communal stairwell in Joanic, completed in four working days. The project price recorded for this specific job is 900 € + IVA and includes labour, materials purchase/transport, repairs, primer and two roller coats. It is linked to both `painting` and `masonry` (Russian public label: «Общестроительные работы») and to the existing painting-preparation article. One owner-provided finished photograph is published.

Owner clarified the intended homepage placement: Joanic belongs **inside service 06, masonry / «Общестроительные работы»**, not as another card in the global «Выполненные проекты» list. `services.yaml` now links masonry to Joanic through `related_project_ids`; the homepage builder renders a compact localized project card inside that accordion and excludes service-owned featured projects from the lower global list. The project remains in the full project catalog and retains ES/EN/RU detail routes.

EN/RU copy and the service-placement behavior are covered by `tools/site-next/validate-project-locales.mjs`, and repository validation requires every service-related project to exist and include the same service in its `service_ids`. Canonical validation passed in workflow `Joanic service placement` run #1 (run id 36315845180). Generated projection was committed as `085c12d38f8d790d3f3c1347745be9827b8eefb7`; the temporary workflow was removed in `942f753cbd8eefef64a163d68420aef59ca8b745`. Production and `main` were not changed.

Next action for this feature: review PR #9, then merge/release through the normal `release/vps-migration` process if approved. Do not deploy this branch directly.


## Project translations — published 2026-09-17

Working branch: `agent/project-translations` in `/tmp/vital-vibe-vps-fb31a282`.
Production now serves `ebd51356a925e84984bdfa2f520979fd11a44362` from `/srv/vital-vibe/releases/20260917-ebd5135`. Complete EN/RU project/catalog pages and homepage links preserve language; image captions and metadata are translated. Canonical checks: 37 tests, 0 errors / 5 existing warnings. Local and production browser checks: 45 cases each; public sitemap: all 35 routes verified. Rollback release: `20260913-f25d27b`. See [translation report](architecture/project-localizations/report.md) for archive checksum and evidence.

## Previous production — VPS cutover completed 2026-09-13

**Historical release (superseded above):** https://vitalvibeconstruction.com served release SHA `f25d27baa3abef644eedd87b4fcda614c828855d` with all localized homepages in the sitemap. `/srv/vital-vibe/current` points to release `20260913-f25d27b`. Archive SHA-256: `0775aef73e0fb6b0a9ca8224128d8106996cf251b8b939c1fae5860e279b555c`.

Owner changed DonDominio manually: apex now has one A record `152.228.139.236`; www CNAME is `vitalvibeconstruction.com.`. Both authoritative servers agree. Existing app, other subdomains and mail records were preserved. Original zone screenshots and private nginx backup are retained on VPS under `/home/ubuntu/vvc-migration-fb31a282/backup/`.

Existing nginx handles public TLS and forwards to dedicated Caddy on `127.0.0.1:8890`; Caddy admin remains loopback-only and releases are mounted read-only under UID 65534. A dedicated nginx virtual host was added; all previous nginx files remain byte-identical. Caddy runtime config fixes asset-cache header precedence, retains SAMEORIGIN and preserves the approved site artifact. This shared-server topology uses Certbot/nginx TLS instead of direct Caddy ACME. Nginx emits its own Server header; HTTPS omits its version.

Certificate covers apex + www until 2026-12-12. **Automatic renewal is configured and test-verified** with webroot HTTP-01, active Certbot timer and a certificate-scoped nginx reload hook. The two manual ACME TXT entries are obsolete and may be removed by the owner; no automatic DNS access is configured.

Validation: 35 tests, gallery 39/39, 12 localized article pages, audit 0 errors / 5 warnings; 23 sitemap routes and nine historical redirects checked on public HTTPS; 69 pre-cutover browser page checks plus 21 final public browser checks and nine public solar iframe/control checks. No broken images, JS errors or horizontal overflow in the checked pages. Painting retains 10 sections / two photos; renovation-cost article retains 11 sections / six photos. HTTP→HTTPS and www→apex work. Planner `/manual` remained byte-identical. No 5xx or Caddy error messages in the sampled logs; one missing favicon and rejected .env probes were observed.

GitHub Pages configuration remains `main:/` with its custom domain and HTTPS intact for DNS rollback. Previous release `20260913-2695336` is retained for symlink rollback (same pages and optimized images; EN/RU homepage entries missing from sitemap). Initial release `20260913-fb31a282` is also retained as historical recovery material. Article source CSS, its builder and generated CSS links changed in the follow-up fix; article copy, animation source, support.js, main and PR #6 remain unchanged.

**Operational follow-ups are not claimed complete:** shared VPS still permits SSH passwords and root key login; provider firewall/DDoS controls, registrar MFA and external uptime monitoring have not been verified/configured in this task. Handle those with the shared-server recovery/access context. See [execution report](architecture/vps-cutover-20260913/report.md). The public website migration itself is complete.

## Localized homepage sitemap published

All three homepages now belong to the route contract; sitemap generation/validation has no separate root exception. Public sitemap contains 25 unique canonical URLs including /en/ and /ru/. Full 35 tests, bundle validation and all 25 public route checks passed. Only sitemap.xml and DEPLOYMENT_COMMIT differ from previous production; 201 other files remain identical. Netlify stays protected, planner unchanged. See [release report](architecture/localized-home-sitemap/report.md). Search Console/Bing indexing verification remains the next step.

## Netlify preview closed to anonymous access

Owner authorized restricting the preview. Netlify project `vital-vibe-preview` now requires team login for all deploys. Both preview alias and deploy permalink return 401 anonymously; the primary VPS site remained public at SHA 2695336 during that change and planner was unchanged. This supersedes the audit finding that preview was publicly indexable. See [settings, checks and rollback](architecture/netlify-preview-private/report.md).

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
