# 1F916 agent record VPS release — 2026-10-19

## Result

Production serves release `20261019-a1e18f7` from source
`a1e18f79844e5363ef083c3af38e0bb1fbbbfe70`.

This release starts from current `main` at
`4d70d31e67b4261ca905b9b7bfcd55e52ced67e5`, so it includes the accepted SEO
and localization follow-up from 2026-10-17. It adds the public 1F916 citizen
record as a centralized `ExternalApp` and projects it into:

- a visible, localized homepage footer link on ES, EN and RU;
- a head-level `rel="me"` JSON link;
- Organization / HomeAndConstructionBusiness JSON-LD `sameAs`, alongside the
  existing Facebook identity;
- the generated `llms.txt` AI discovery index.

Public record:
`https://1f916.ai/api/citizen/vital-vibe-construction`.

## Release evidence

- canonical checks: 43 tests, 43 sitemap routes, 46 generated HTML files,
  content audit 0 errors / 5 existing warnings;
- VPS bundle workflow: https://github.com/MigelSmirnov/Vital-Vibe-Constructions/actions/runs/39172682436;
- Visual QA workflow: https://github.com/MigelSmirnov/Vital-Vibe-Constructions/actions/runs/39172936339;
- archive SHA-256:
  `50ffb595a41668454c706879bdfd4b0718581f5006647627ebfe18c69a0ff9ae`;
- archive `DEPLOYMENT_COMMIT`:
  `a1e18f79844e5363ef083c3af38e0bb1fbbbfe70`;
- all 43 public sitemap route bodies match the downloaded CI artifact exactly;
- public `/DEPLOYMENT_COMMIT` matches the release SHA;
- the three public homepages expose the correct localized footer label and the
  same `rel="me"` URL;
- public `llms.txt` contains the 1F916 section and URL;
- the 1F916 citizen endpoint returned HTTP 200 after activation.

## Activation and rollback

- active symlink: `/srv/vital-vibe/current` ->
  `/srv/vital-vibe/releases/20261019-a1e18f7`;
- previous retained release: `20261010-7fbbe65`;
- rollback command:
  `deploy/vps/rollback-release.sh 20261010-7fbbe65`;
- DNS, nginx, Caddy, TLS, planner and other VPS services were not changed.
