# HANDOFF

Version: 17
Updated: 2026-08-20T09:38:00+02:00

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This file is a living handoff, not a changelog. Historical detail should live in commits and artifacts.

## Current Status

`agent/architecture-sandbox` is on a reproducible green baseline with:

- validated Knowledge Repository architecture;
- eight generated public HTML routes in `site-next`;
- complete 39/39 legacy media coverage;
- ranked 15-page SEO/AEO query-to-page matrix;
- a documented production deployment approach for GitHub Pages.

Key planning artifacts:

- `architecture/seo-aeo-query-page-matrix.md`
- `architecture/production-deployment-plan.md`

Production has **not** been changed in this session.

## Current Strategy

- Preserve the legacy website and keep `support.js` read-only.
- Keep `site-next` as the generated projection, not as a manually copied repository-root site.
- Treat Knowledge Repository records as the source of truth.
- Treat `site-next`, `llms.txt`, and `sitemap.xml` as reproducible generated projections.
- Prefer evidence-rich Spanish content over generic SEO landing pages.
- Do not activate new routes until both priority and evidence readiness are established.
- Keep El Raval technical-photo completion deferred and non-blocking.

## SEO / AEO Matrix

Top priorities remain:

1. existing `/servicios/reformas-integrales-barcelona/`;
2. proposed `/guias/precio-reforma-integral-barcelona/`;
3. proposed `/servicios/cocinas-barcelona/`;
4. proposed `/servicios/banos-barcelona/`;
5. proposed `/servicios/electricidad-barcelona/`.

No new route has been activated from the matrix.

## Production Gate Findings

Repository evidence shows the legacy site was designed for classic GitHub Pages branch publishing:

- `main` contains the legacy root `index.html`;
- `main/CNAME` contains `vitalvibeconstruction.com`;
- the legacy README instructs publishing from branch `/root` or `/docs`;
- the legacy root entrypoint depends on `support.js` and root asset directories;
- there is no repository-owned Pages deployment workflow in `main`.

The connected GitHub tool does not expose the exact `Settings -> Pages` source selector, so that setting must be visually confirmed before production cutover.

GitHub Pages branch publishing only supports `/` or `/docs`, not arbitrary `site-next/`. Therefore the preferred production architecture is a **custom GitHub Actions Pages artifact**.

## Deployment Decision

Do **not** copy generated `site-next` files into repository root as source files.

Preferred flow:

```text
Knowledge Repository
        -> builders/checks
        -> site-next + sitemap.xml + llms.txt
        -> deterministic .pages-dist bundle
        -> GitHub Pages artifact
        -> vitalvibeconstruction.com
```

`.pages-dist` is ephemeral and must not become a tracked content source.

## Pages Bundle Composition

The future bundle should contain:

### Generated projection at artifact root

- contents of `site-next/` flattened to artifact root;
- `sitemap.xml`;
- `llms.txt`;
- `robots.txt`.

### Shared assets

- `VVC_primary_logo.svg`;
- `proyecto-1/`;
- `proyecto-2/`;
- `estandar/`;
- `premium/`;
- `smart/`.

### Custom domain

- copy `CNAME` for consistency;
- separately verify the custom domain remains configured in GitHub Pages settings.

### Initial legacy compatibility

Preserve during first cutover:

- `aviso-legal.dc.html`;
- `galeria-economica.dc.html`;
- `galeria-estandar.dc.html`;
- `galeria-premium.dc.html`;
- `support.js`.

Do not copy legacy root `index.html`; generated `site-next/index.html` must own `/` in the artifact.

Historical URLs such as `/projects.html`, `/proyecto-1.html`, and `/proyecto-2.html` must be checked immediately before cutover. Add compatibility redirect documents only if the old mappings are confirmed and the URLs still matter.

## Safe Cutover Sequence

### Phase A — no production change

1. Implement deterministic Pages bundle assembly.
2. Implement bundle validation.
3. Run bundle build in PR CI only; do not deploy.
4. Verify all generated routes, assets, discovery files and compatibility files exist in the bundle.
5. Manually confirm `Settings -> Pages`, custom domain and HTTPS state.

### Phase B — production-ready merge

1. Keep normal project checks green.
2. Merge reviewed production-capable code to `main` only when the branch is otherwise ready.
3. Do not change canonical URLs as part of cutover.

### Phase C — explicit Pages switch

In GitHub Pages settings select:

```text
Build and deployment -> Source -> GitHub Actions
```

Then enable the production `deploy-pages` job from `main`.

### Phase D — production verification

Verify HTTP 200, canonical URLs, H1, CSS, images, navigation, sitemap, robots, `llms.txt`, mobile rendering and the eight canonical routes over HTTPS.

### Phase E — discovery

Re-check sitemap/indexing in Search Console and monitor old URL coverage before starting SEO/AEO Wave 1.

## Rollback

Keep the legacy root files intact until the Actions deployment is proven stable.

If cutover fails and current Pages source is confirmed as `main /root`, rollback is to switch Pages back to branch publishing from `main /root` and verify the legacy homepage returns.

## Active Stage

The active implementation task is now:

> **Build and validate the Pages deployment bundle without deploying it.**

Do not add `actions/deploy-pages` yet.

Expected next code:

- a deterministic bundle assembly tool under `tools/`;
- a bundle validator;
- CI coverage proving the artifact contains every required route and asset;
- no production permissions and no deployment step.

## Non-Negotiable Constraints

- Do not edit `support.js`.
- Do not evolve legacy entrypoints.
- Do not bypass the Knowledge Repository.
- Do not hand-edit generated output as a substitute for changing its source or builder.
- Do not duplicate business content between builders and tables.
- Do not add dependencies unless the current platform cannot reasonably solve the problem.
- Do not activate speculative routes from the SEO/AEO matrix.
- Do not publish generic mass-produced landing pages.
- Do not deploy from pull requests.

## Verification

After content, route, builder, generated-output, structural, or deployment-bundle changes run:

```bash
node tools/checks/run.mjs
```

The future Pages bundle validator must pass separately, and tracked generated projections must remain clean.
