#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

PLAYWRIGHT_VERSION="1.55.0"

node tools/checks/run.mjs
node tools/deploy/build-vps-bundle.mjs
node tools/deploy/validate-vps-bundle.mjs

if [[ ! -f ".visual-tools/node_modules/playwright/package.json" ]]; then
  npm install --prefix .visual-tools --no-save --package-lock=false "playwright@${PLAYWRIGHT_VERSION}"
fi

if [[ "${CI:-}" == "true" ]]; then
  ./.visual-tools/node_modules/.bin/playwright install --with-deps chromium
else
  ./.visual-tools/node_modules/.bin/playwright install chromium
fi

node tools/visual/check.mjs
node tools/visual/standard-project.mjs
node tools/visual/premium-project.mjs
node tools/visual/gallery-responsive.mjs
node tools/visual/accessibility.mjs
node tools/visual/reduced-motion.mjs
node tools/visual/responsive-images.mjs
node tools/visual/hero-lcp.mjs
