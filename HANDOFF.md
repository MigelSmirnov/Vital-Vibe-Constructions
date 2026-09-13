# HANDOFF

Version: 37
Updated: 2026-09-13T07:34:00Z

## Session rule

Every working session must end by updating:

- `HANDOFF.md`
- `architecture/session-state.yaml`

This is a living handoff. Historical detail belongs in commits and architecture artifacts.

## Start here

1. Read `AGENTS.md` and its required architecture contracts in order.
2. Continue from `task/README.md` and `task/001-visual-checks.md`.
3. Work on `agent/architecture-sandbox`; do not use `main` as a working branch.
4. Do not hand-edit generated `site-next` output instead of changing the builder/source.
5. Run `node tools/checks/run.mjs` after content, route, builder or generated-output changes.

## Current stage

The first human-approved visual baseline is established and the first accessibility/token layer is now browser-validated.

The Visual QA command remains:

- `bash tools/visual/run.sh`;
- validated `.deploy-dist` served in a local browser context;
- fixed viewports: 390×844, 768×1024, 1440×1000;
- targets: ES/EN/RU homepages, the bathroom Article in all three languages, gallery and El Raval project;
- extra state: open mobile menu;
- visual checks: loading failures, broken images, horizontal overflow and Article language links;
- accessibility checks: semantic-token contract, explicit control target size, real Tab-focus and reduced-motion;
- screenshots/reports remain diagnostic artifacts and do not enter the release bundle.

The approved visual baseline corresponds to run #15 on commit `b34f72fd7902235cd24206f9a56ea9e243e89c92`. The new accessibility layer was validated by run #23 on commit `b23f0b9046e359f181f4065cc76665310f9d6188`.

Production and DNS were not changed.

## Visual review fixes completed

### First slice

1. **Gallery length and sameness**
   - All 39/39 contract media remain present.
   - Gallery media are grouped by Project or capability instead of one flat stream.
   - Responsive previews use 3 columns on desktop and 2 columns on tablet/mobile.

2. **Internal status exposed on El Raval**
   - `pending_technical_media` was removed from the public Project record.
   - Missing-photo subjects remain internal backlog only.

3. **Cramped mobile homepage project cards**
   - Under 720 px compact project cards stack vertically: media above, metadata/title below.

### Second slice

4. **Smart Home mobile density**
   - Content was preserved; no capability or partner example was removed.
   - Mobile section spacing was tightened, the lead image reduced to 240 px high and partner examples reduced to compact 2×2 thumbnails.

5. **Article desktop composition**
   - The Article header, TOC/body grid and footer share a centered 1040 px editorial frame.
   - Reading column remains 720 px; TOC remains separate and sticky on desktop.
   - Mobile Article layout remains single-column.

## Visual baseline status

**Approved.** Run #15 / `b34f72f…` is the first human-approved visual reference state.

It is a comparison point, not a freeze. Future UI changes should remain surgical and be rerun through the same matrix.

## Semantic brand tokens / accessibility layer

The public page families now share a checked semantic color contract:

```text
--bg
--surface
--text
--muted
--accent
--border
```

The Article retained its light editorial appearance but moved from its private `ink/gold/line/paper` naming to the common contract. Homepage and Article also define semantic focus helpers and a minimum control-target token.

`tools/visual/accessibility.mjs` runs after the screenshot checker and covers the same 24 route/viewport states. It currently verifies:

- all six semantic tokens resolve on each tested page;
- explicitly control-like targets are at least 24 × 24 px (inline text links are not treated as blocking target-size findings);
- sampled keyboard navigation is performed with real `Tab` events and focused controls have a visible indicator;
- `prefers-reduced-motion: reduce` reaches the page and visible CSS transitions/animations over 1 ms are treated as failures.

Run #23 passed with **0 missing tokens, 0 small-control findings, 0 sampled focus failures and 0 motion-rule findings** across the full matrix.

One small advisory remains: shared secondary pages such as gallery and El Raval still compute `scroll-behavior: smooth` in the reduced-motion context. The accessibility gate records that value but does not currently fail it because it is not a CSS animation/transition. When the shared `styles.css` source is next refactored, add an explicit `prefers-reduced-motion` override for smooth scrolling as well.

## Published content state

- Homepages: ES `/`, EN `/en/`, RU `/ru/`.
- Bathroom Article: ES `/articulos/traslado-lavabo-toallero/`, EN `/en/articles/moving-a-bathroom-basin/`, RU `/ru/articles/perenos-rakoviny/`.
- The bathroom public location is **Badalona only**.
- Four working days and EUR 1,100 labour including rubbish removal are confirmed; do not present that amount as total renovation cost including materials.
- Preserve the existing disclosure that the final bathroom image was AI-retouched.
- El Raval is one property represented by the merged `project-studio-renovation-barcelona` record and 16 photographs.
- Gallery legacy coverage remains complete at 39 images.

## Architecture boundaries

Source priority remains:

```text
architecture/invariants.yaml
architecture/constants.yaml
architecture/app-architecture.yaml
architecture/session-state.yaml
architecture/project-routes.yaml
architecture/gallery-media-coverage.yaml
HANDOFF.md
README.md
```

Key rules:

- Knowledge Repository is the public content source of truth.
- `support.js` and legacy entrypoints remain read-only.
- Routes activate only through `architecture/project-routes.yaml`.
- Generated files must be reproducible from committed inputs.
- Do not introduce dependencies without a platform justification.
- Keep `task/` and development notes out of the public bundle.

## Production / VPS

Production hosting direction remains **VPS + Caddy**, with GitHub as source-control/build/validation and static release artifacts served by Caddy.

Production, DNS and original hosting were not changed in this design/accessibility session.

Before any cutover, follow:

- `architecture/vps-migration-plan.md`
- `architecture/vps-security-plan.md`
- `architecture/production-deployment-plan.md`

The public server remains static: no CMS, database, PHP runtime or Node application server is required. Caddy admin must remain loopback-only. First production-adjacent deployment remains manual validated-artifact upload + smoke test before DNS cutover.

## Immediate next action

With layout and basic accessibility stable, move to responsive-image/performance work: preserve original Media identities, generate deterministic derivatives, add `srcset/sizes` where useful, protect the approved crops and treat the hero/LCP image separately. Re-run Visual QA after each bounded performance slice.
