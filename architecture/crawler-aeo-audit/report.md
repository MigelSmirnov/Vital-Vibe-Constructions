# Crawler and AEO audit — 2026-09-13

Read-only public audit of production SHA 2695336c8117234206bc4a3e19009ae517f7094f. No site, DNS or server configuration changes. HTTP observations are point-in-time results from our network, not verified visits from crawler infrastructure. No Search Console, Bing Webmaster Tools or authenticated analytics data was available in this audit.

## Technical findings

- All 23 sitemap URLs plus /en/ and /ru/ returned HTTP 200. Each has one H1, a title, description, self canonical and parseable JSON-LD. No meta robots or X-Robots-Tag restrictions found on these pages.
- robots.txt allows all user agents and points to the production sitemap.
- Googlebot, bingbot, YandexBot, OAI-SearchBot, GPTBot, ChatGPT-User, ClaudeBot and PerplexityBot user-agent tokens each received 200 with identical bodies on home, robots.txt and the Spanish painting article: 24 requests. This does not establish reachability from their actual IP ranges or prove indexing/citation.
- Text, links, prices and article explanations are present in raw HTML without executing JavaScript. JSON-LD includes Organization, Article, CollectionPage, WebPage and Service/BreadcrumbList/FAQPage on the service page. Parsing is not a Google rich-results eligibility test.
- Language alternate links are reciprocal for the checked home/article/catalog groups. All 25 production pages have incoming HTML links from another checked page. Projects and the service page are Spanish-only; no fake translations were inferred.
- /en/ and /ru/ are live canonical pages but absent from the 23-URL sitemap. They are still discoverable through links/hreflang; omission is not an indexing prohibition.
- A deliberately nonexistent route returned 404.
- llms.txt exists and lists the current articles, services, projects and contact information. It is not an indexing guarantee or substitute for HTML.
- Netlify preview root is HTTP 200, crawlable and has no noindex directive. Its canonical points correctly to production. This reduces duplicate ambiguity but does not make the preview private or guarantee exclusion from search. Preview robots.txt allows crawling.

## AEO content assessment

The site has a good technical foundation and useful first-hand content; actual inclusion in AI answers is unmeasured. No arbitrary numerical AEO score is assigned.

Strengths: explicit Barcelona service area and contact details; real project examples; painting price distinguishes labour, materials and preparation; renovation price explains exclusions and the need for inspection; solar article gives a direct qualified answer followed by manufacturer sources, with explanatory HTML independent of its animation. Organization authorship and publication dates are visible and marked up for articles.

Improvement priorities:

1. Verify the domain property and indexing in Google Search Console and Bing Webmaster Tools; submit the sitemap and inspect home plus representative ES/EN/RU articles. External search surfaced the older homepage text; new article indexing was not established. Search results alone are incomplete evidence and do not show all indexed URLs.
2. Add EN/RU home URLs to the sitemap through its source builder. Define a preview policy: host-specific noindex while allowing crawlers to read it, or access protection if private preview is needed. Never apply preview restrictions to production. Existing production canonical is already correct.
3. Strengthen truthful business identity: connect a consistent organization @id across schemas and verified public profiles; document the responsible professional/team and experience. Google Maps link exists, but Business Profile verification/reviews were not assessed. Do not invent addresses, certifications, ratings or authors.
4. Improve service-page usefulness: replace implementation-facing references to 'repositorio' with customer-facing language. Add a concise scope/pricing summary only from approved facts; current FAQ answers are mostly generic. Preserve full owner articles and their appearance; no rewrite was performed.
5. Consider a short answer near the beginning of the cost article, using existing approved price qualifications. Painting and solar already contain strong answer passages. Clarify materials/tax/demolition scope only with owner-confirmed facts. The cost article retains a floor-leveling slug; this is a relevance/clarity issue, not a crawling failure, and does not justify changing live URLs without redirects.

Do not mass-add FAQ schema or create thin city pages for supposed AI ranking. Additional schema must reflect visible facts. Do not treat GPTBot training permission as equivalent to ChatGPT search inclusion.

## Primary references checked

- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features): conventional SEO, indexability and snippet eligibility remain the basis; inclusion is not guaranteed.
- [Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): unique useful content and crawlable technical structure; no special AI schema requirement; llms.txt does not improve Google Search visibility.
- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots): OAI-SearchBot controls search crawling; GPTBot is a separate training control; actual IP access also matters.
- [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): canonicalization consolidates duplicate URL signals.

Evidence: bots.json and link-check.json. Full raw page snapshots and audit scripts are retained locally in /tmp/vvc-aeo-audit; they are not published to the site.
