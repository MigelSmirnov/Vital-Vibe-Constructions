# Google Business Profile link release — 2026-10-30

Status: prepared for validation; not deployed.

## Scope
- Current business listing: https://g.page/r/Cf0M7nPD9-VLEBM
- Review request: https://g.page/r/Cf0M7nPD9-VLEBM/review
- Obsolete listing URL: https://maps.app.goo.gl/9LcztAtyft5EzsqJ6?g_st=iw
- Canonical source: content/tables/contact-details.yaml
- The previous main-branch commits updated site-next ES/EN/RU projections, root legacy index, llms.txt and contact data.
- Two artifacts/content-audit/legacy-content* files preserve historical snapshots. Do not rewrite these as though they were current generated output.
- Do not hand-edit generated pages or legacy entrypoints again. Rebuild from content records.

## Required release checks
1. Run `node tools/checks/run.mjs` in a clean checkout. Verify generated pages agree with the canonical contact record.
2. Run `node tools/deploy/build-vps-bundle.mjs`.
3. Run `node tools/deploy/validate-vps-bundle.mjs`.
4. Search `.deploy-dist/` for the obsolete listing URL; it must not appear in published output.
5. Verify the current business listing opens from ES/EN/RU contact links and that structured data uses the same listing.
6. Record actual check output, bundle SHA and rollback target before VPS publication.
7. Deploy only the validated `.deploy-dist/` package using the established VPS/Caddy release procedure; verify live routes afterward.

## Limitations
GitHub connector access alone does not execute local Node commands or publish to the VPS. No successful build, validation, or live deployment is claimed by this document.
