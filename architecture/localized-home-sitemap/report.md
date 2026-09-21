# Localized homepage sitemap correction — 2026-09-13

The production audit found that /en/ and /ru/ were live canonical homepages but absent from sitemap.xml. Registered all three homepages in the existing route contract and removed the sitemap builder/validator's special case for the Spanish root. The sitemap now derives every URL from eligible route records; route checks also verify that each homepage's generated HTML exists. There are 25 canonical entries instead of 23, with no duplicates.

No content, layout, article, image, robots or canonical/hreflang changes are intended. No new dependencies. Canonical checks passed: 35 tests, 0 audit errors and 5 existing warnings. Generated output changes are limited to the two additional sitemap entries.

Source SHA: f25d27baa3abef644eedd87b4fcda614c828855d.

Fresh WebP bundle validation passed: 25 sitemap routes and 29 HTML files. Comparison against release 2695336 found only sitemap.xml and DEPLOYMENT_COMMIT changed; the other 201 files are byte-identical. See release-diff.json.

Archive SHA-256: 0775aef73e0fb6b0a9ca8224128d8106996cf251b8b939c1fae5860e279b555c. Uploaded archive checksum was verified before atomic activation of /srv/vital-vibe/releases/20260913-f25d27b. Loopback Caddy and public HTTPS return the expected release SHA.

Public checks passed for all 25 canonical routes: HTTP 200, self canonical, one H1, no noindex restriction. Sitemap contains each ES/EN/RU homepage exactly once and matches the release file byte-for-byte; robots.txt permits crawling and references it. Netlify preview remains protected with 401; planner is byte-identical to its previous baseline. See public-verification.json.

Rollback release: 20260913-2695336, retained with its archive. DNS, nginx/Caddy, TLS and Netlify access settings were unchanged. No visual browser rerun was needed: all HTML, CSS, scripts and images are byte-identical to the previous verified release.

 This change makes the homepages discoverable through the sitemap; it does not claim Google/Bing have indexed them or received a manual submission.
