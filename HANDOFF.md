# HANDOFF

Version: 35
Updated: 2026-09-13T06:56:00Z

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

The active work is **visual QA and refinement of the generated site**, not a wholesale redesign.

The reproducible browser QA system is in place:

- command: `bash tools/visual/run.sh`;
- source projection: validated `.deploy-dist` served over local HTTP;
- fixed viewports: 390×844, 768×1024, 1440×1000;
- targets: ES/EN/RU homepages, the bathroom Article in all three languages, gallery and El Raval project;
- extra state: open mobile menu;
- checks: loading failures, broken images, horizontal overflow and Article language links;
- screenshots/reports remain diagnostic artifacts and do not enter the release bundle.

GitHub Actions Visual QA run #14 on commit `712f180c9a8f7f9f273ec8eada27b0755d659931` completed successfully after the second visual-refinement slice.

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
   - The ES 390 px full-page capture became materially shorter while keeping the same information hierarchy.

5. **Article desktop composition**
   - The Article header, TOC/body grid and footer now share a centered 1040 px editorial frame.
   - Reading column remains 720 px; TOC remains separate and sticky on desktop.
   - Mobile Article layout is unchanged and remains single-column.

Tracked generated `site-next/home.css` and `site-next/article.css` are synchronized with their source styles. The final diff from the previous approved visual state contains only those four intended CSS files. No production deployment was performed.

## Visual baseline status

The new screenshot set has been technically validated and visually inspected for the intended changes. It is a **baseline candidate**, but owner approval is still required before calling it the first visual baseline.

Next useful work after baseline approval:

- shared semantic brand tokens for color, typography, spacing, focus and borders;
- target-size / keyboard-focus accessibility checks;
- responsive image derivatives and modern formats after layout stabilizes.

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

Production, DNS and original hosting were not changed in this visual-design session.

Before any cutover, follow:

- `architecture/vps-migration-plan.md`
- `architecture/vps-security-plan.md`
- `architecture/production-deployment-plan.md`

The public server remains static: no CMS, database, PHP runtime or Node application server is required. Caddy admin must remain loopback-only. First production-adjacent deployment remains manual validated-artifact upload + smoke test before DNS cutover.

## Immediate next action

Review the refined run #14 screenshots as the candidate first baseline. If accepted, mark task 001 baseline-approved and move to shared brand tokens / accessibility checks rather than another broad redesign pass.
