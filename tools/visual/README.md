# Visual QA

This folder implements the first slice of `task/001-visual-checks.md`.

It adapts the useful parts of `plugin87/ux-ui-agent-skills` rather than copying that package into this repository. The guiding rule is the same: automated checks can catch loading and responsive failures, but they cannot prove that a design looks good. Human screenshot review remains required.

## One command

From a clean clone on a supported desktop Linux/macOS environment:

```bash
bash tools/visual/run.sh
```

The command:

1. runs the existing full project checks;
2. builds and validates `.deploy-dist`;
3. installs an isolated pinned Playwright (`1.55.0`) under ignored `.visual-tools/`;
4. serves `.deploy-dist` locally over HTTP so root-relative assets behave like production;
5. captures fixed screenshots at 390×844, 768×1024 and 1440×1000;
6. records failed requests, broken images and horizontal overflow;
7. opens the mobile homepage menu and captures it;
8. verifies that each public article's language switch matches `architecture/project-routes.yaml`.

Routes are derived from the existing architecture contracts, not copied into a second route registry. The current capture set is the ES/EN/RU homepages, all generated public Article routes, the gallery, and the El Raval project.

## Output

Diagnostic output is written to:

```text
artifacts/visual/latest/
  report.md
  summary.json
  screenshots/*.png
```

The directory is ignored by git and must never be copied into `site-next` or `.deploy-dist`. CI uploads it as a workflow artifact for review.

## Determinism

The browser uses fixed viewport sizes, locale `es-ES`, timezone `Europe/Madrid` and `prefers-reduced-motion: reduce`. After loading fonts and images, the runner disables animations/transitions before capture.

The first automatically captured set is **not** a visual baseline. A human must review it first and approve what should become the reference.

## Environment note

The repository's normal local execution path is Termux, but Playwright's bundled Chromium is not a supported Android/Termux target. Use the GitHub Actions `Visual QA` workflow for reproducible browser captures when working only from the phone. This limitation is intentional and should not be hidden by treating an unavailable browser as a passing check.

## Next slice

After the first capture is reviewed, add the remaining checks from the audited UX/UI skill where they fit this site: WCAG 2.5.8 target-size measurement, reduced-motion parity, keyboard/focus checks and selected accessibility gates. Do not add a large visual-diff framework until the owner has approved a real baseline.
