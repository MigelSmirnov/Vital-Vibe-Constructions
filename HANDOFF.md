# HANDOFF

Version: 22
Updated: 2026-09-06T15:18:00Z

## Session Rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This is a living handoff, not a changelog. Historical detail belongs in commits and architecture artifacts.

## Current Status

Active branch: `agent/home-redesign`.

The repository has a validated generated-site architecture based on `content/tables` + the Knowledge Repository + deterministic builders. Legacy public entrypoints and `support.js` remain read-only.

Current capabilities include:

- generated ES/EN/RU homepages with crawlable language switching and hreflang;
- generated project, gallery and service routes in `site-next`;
- complete 39/39 legacy media coverage;
- engineering-style private article sandbox with stable `VVC-ART-*` document identifiers;
- VPS + Caddy production direction with deterministic release bundle and rollback tooling;
- homepage-only engineering-office visual redesign ready for CI and live visual review.

## Homepage Redesign

The homepage redesign is now implemented in the generated architecture, not only in a sandbox prototype.

Source:

```text
tools/site-next/home-redesign.css
tools/site-next/build-home-locales.mjs
```

Generated projection:

```text
site-next/home-redesign.css
site-next/index.html
site-next/en/index.html
site-next/ru/index.html
```

The localized homepage builder marks only homepage documents with `body.home` and emits the scoped redesign stylesheet. Non-home project, gallery and service pages continue using the existing shared `site-next/styles.css` presentation.

Visual direction:

- light architectural paper palette with VVC yellow and black;
- asymmetric project-led hero;
- technical metadata and numbered sections;
- specification-style service rows instead of generic cards;
- stronger hierarchy for real project evidence;
- technical smart-home section;
- pricing presented as a specification/table rather than SaaS-style plans;
- contact area styled like a project/title block.

The redesign intentionally keeps the current public content records and translations unchanged. This pass changes presentation, not business claims or route structure.

Rollback is straightforward: revert the homepage redesign merge/commits. No data migration, route migration or production infrastructure change is required.

## Article Sandbox

`sandbox/articles/` remains draft-only and `noindex`. It renders existing draft records as engineering drawing sheets with title blocks, document numbers, section numbering and sheet navigation.

It does **not** create public Article entities, routes, sitemap entries or `llms.txt` entries.

## Production Hosting Direction

Long-term target remains **VPS + Caddy**.

```text
Knowledge Repository
  -> builders/checks
  -> site-next + sitemap.xml + llms.txt
  -> validated VPS bundle
  -> /srv/vital-vibe/releases/<release-id>/
  -> /srv/vital-vibe/current
  -> Caddy / protected edge
```

GitHub Pages remains the current hosting path / rollback while the VPS cutover is not yet completed.

Key deployment artifacts:

- `architecture/vps-migration-plan.md`
- `architecture/vps-security-plan.md`
- `architecture/production-deployment-plan.md`
- `tools/deploy/build-vps-bundle.mjs`
- `tools/deploy/validate-vps-bundle.mjs`
- `deploy/vps/Caddyfile`
- `deploy/vps/install-release.sh`
- `deploy/vps/rollback-release.sh`

## Non-Negotiable Constraints

- Do not edit `support.js`.
- Do not evolve legacy entrypoints.
- Do not bypass the Knowledge Repository for public business content.
- Do not hand-edit generated output without updating the responsible builder/source.
- Do not activate speculative routes from the SEO/AEO matrix.
- Do not expose Caddy admin API publicly.
- Do not commit SSH private keys, passwords, recovery codes or provider tokens.
- Do not enable HSTS before the initial HTTPS/rollback path is verified.

## Verification

For the current homepage redesign, the important checks are:

```bash
node tools/checks/run.mjs
node tools/deploy/build-vps-bundle.mjs
node tools/deploy/validate-vps-bundle.mjs
```

`Project checks` must leave tracked generated projections clean. The ES, EN and RU homepages must load `/home-redesign.css`, while non-home routes must remain unaffected by the scoped `.home` rules.

## Active Stage

1. Let PR #3 run the full project checks.
2. If green, merge `agent/home-redesign` into `main`.
3. Let GitHub Pages deploy `main`.
4. Visually inspect desktop and mobile on the real site.
5. If the direction is rejected, revert the redesign merge; no content or route rollback is required.
6. After design review, return to VPS hardening and reversible DNS cutover work unless another design iteration is requested.
