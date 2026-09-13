# HANDOFF

Version: 34
Updated: 2026-09-13T06:36:00Z

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

The first reproducible browser QA system is implemented:

- command: `bash tools/visual/run.sh`;
- source projection: validated `.deploy-dist` served over local HTTP;
- fixed viewports: 390×844, 768×1024, 1440×1000;
- targets: ES/EN/RU homepages, the bathroom Article in all three languages, gallery and El Raval project;
- extra state: open mobile menu;
- checks: loading failures, broken images, horizontal overflow and Article language links;
- screenshots/reports remain diagnostic artifacts and do not enter the release bundle.

GitHub Actions Visual QA run #4 produced the first green set. The owner then approved acting on the visual review findings. Run #5 on commit `7b41ed9ac081635f8fe2c7bdd629368b2e2e867e` passed after the first correction slice.

## First visual-review fixes

Three confirmed Major findings were addressed:

1. **Gallery length and sameness**
   - All 39/39 contract media remain present.
   - `tools/site-next/build-gallery.mjs` now groups media by Project or capability rather than rendering one flat stream.
   - `tools/site-next/gallery.css` provides compact responsive previews: 3 columns desktop, 2 columns tablet/mobile, with existing `Antes` / `Proceso` / `Resultado` / `Detalle` state labels.

2. **Internal status exposed on El Raval**
   - `pending_technical_media` was removed from the public Project record.
   - The generated Project page no longer shows `Fotografías pendientes de incorporar`.
   - The six missing technical-photo subjects were moved to `task/README.md` as internal backlog only.

3. **Cramped mobile homepage project cards**
   - Under 720 px the compact project cards now stack vertically: media above, metadata/title below.
   - Desktop/tablet composition remains unchanged.

Tracked generated projections were rebuilt from the changed sources and synchronized after the source commit. No production deployment was performed.

## Visual baseline status

Technical QA is green, but the improved screenshots still need a human pass before they are declared the first visual baseline. Do not treat a CI PASS as proof of visual quality.

Next visual candidates after baseline review:

- reduce Smart Home mobile density while preserving real content;
- improve Article desktop centering without harming its strong mobile reading layout;
- then introduce a shared semantic brand-token layer for color, typography, spacing, focus and borders.

Image optimization remains pending. Earlier static review found the homepage image payload heavy enough to merit responsive derivatives and modern formats after the layout is stable.

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

Review the improved Visual QA screenshots from the latest green run. If the gallery, El Raval page and mobile project cards are accepted, mark them as the first visual baseline in `task/001-visual-checks.md`, then move to the next confirmed visual issue rather than broad redesign work.
