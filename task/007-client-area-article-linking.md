# Client area article and renovation story — implementation brief

Status: preparation only; no production deployment approved.
Base: release/vps-migration.
Source draft: agent/project-tracking-article/sandbox/articles/drafts/seguimiento-control-reforma.yaml and .ru.md.
Source images: agent/project-tracking-article/sandbox/articles/assets/seguimiento-control-reforma/.

## Owner-approved intent
- Main business: apartment renovations in Barcelona and nearby municipalities; smaller jobs also accepted.
- Preserve the author's full texts, concrete cost breakdowns and explanations; do not shorten to photo captions.
- Connect the general renovation-cost article to specific articles on floors, painting, bathroom works and future work articles.
- Make the project-tracking article the concluding explanation of expenses, revisions, payments and client transparency.
- Client area is real: owner issues time-limited access keys and can renew them. No public login placeholder, authentication page, or access token on marketing pages.
- Use the EXISTING Facebook demonstration screenshot, clearly labeled as demonstration data; no invented UI.
- Homepage: small client-transparency section with screenshot preview and link to the article, placed after projects and before contact CTA. Main proposition remains apartment renovation.
- Service page: discreet contextual link to the same article.
- Support ES/EN/RU before publishing (per architecture/invariants.yaml).
- Do not publish client-identifying financial documents, live keys or project details without explicit clearance.

## Proposed internal-link graph
1. General renovation-cost article -> floors, painting, relevant future specialist articles, project-tracking article, integral-renovation service.
2. Specialist articles -> general renovation-cost article; contextual crosslinks only where genuinely relevant.
3. Project-tracking article -> renovation-cost article, floors, painting, integral-renovation service.
4. Homepage -> project-tracking article; service page -> project-tracking article.
5. Preserve existing URLs; do not create thin city/keyword pages.

## Before a reviewable implementation
- Verify exact current URLs and published slugs from content/tables/articles.yaml and route contracts; draft's floor-article link may not match current production slug.
- Check the screenshot crop at mobile and desktop sizes and retain full-resolution viewing on the article.
- Port source draft through Knowledge Repository and article builder, not by editing site-next directly.
- Verify translations accurately reflect original claims; no unverified capabilities.
- Run node tools/checks/run.mjs, bundle validation and visual/mobile checks.
- Provide preview and diff for owner approval before VPS publication.
