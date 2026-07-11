# Agent Instructions

1. Read `architecture/app-architecture.yaml` before changing application code.
2. Treat architecture YAML files as machine-readable contracts, not prose documentation.
3. Keep content, domain rules, UI, infrastructure, SEO, and AI-discovery concerns separated.
4. Do not edit `support.js`; it is generated.
5. Preserve primary public content in raw HTML or statically/server-rendered output.
6. New sections, services, projects, articles, and media records must be added through explicit content models and module boundaries.
7. Keep external URLs, including the planner URL, in centralized configuration.
8. Do not add dependencies unless the current platform cannot reasonably solve the problem.
9. After HTML or content changes, run `node tools/content-extractor/run.mjs`.
10. Work only in non-default branches and use reviewable commits.
