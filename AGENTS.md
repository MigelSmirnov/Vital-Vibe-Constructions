# Agent Instructions

## Required reading order

Before changing application code, content records, routes, builders, or repository structure, read these files in order:

1. `architecture/invariants.yaml`
2. `architecture/constants.yaml`
3. `architecture/app-architecture.yaml`
4. `architecture/session-state.yaml`
5. `architecture/project-routes.yaml` when routes or generated pages are involved
6. `architecture/gallery-media-coverage.yaml` when media or gallery work is involved
7. `HANDOFF.md` for human-readable context only

Then read `task/README.md` for the current task queue and the linked task brief
before starting new work. Task notes do not override the contracts above.
Keep `task/` in the repository only; never copy it into `site-next` or deployment artifacts.

## Rules

1. Treat architecture YAML files as machine-readable contracts, not prose documentation.
2. When files disagree, follow the truth priority declared in `architecture/app-architecture.yaml`.
3. Do not edit `support.js`; it is generated legacy runtime code.
4. Do not evolve legacy entrypoints during the parallel `site-next` migration.
5. Add services, projects, media, tiers, contacts, capability sections, and external apps through `content/tables` and the Knowledge Repository.
6. Do not duplicate business content inside builders or validators.
7. Preserve primary public content in raw HTML or statically generated output.
8. Activate routes only through `architecture/project-routes.yaml`.
9. Keep blocked and deferred routes absent from generated output and `sitemap.xml`.
10. Keep external URLs and other stable values in centralized configuration or `architecture/constants.yaml`.
11. Do not add dependencies unless the current platform cannot reasonably solve the problem.
12. Work only in non-default branches and use reviewable commits.
13. Run `node tools/checks/run.mjs` after content, route, builder, generated-output, or structural changes.
14. Record completed work and verified results in `architecture/session-state.yaml`; keep `HANDOFF.md` concise and human-oriented.
15. Use Termux as the local execution environment when connected GitHub tools cannot run repository commands; follow `TERMUX_WORKFLOW.md`.
