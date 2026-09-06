#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import process from "node:process";

const checks = [
  ["Knowledge tests", "node", [
    "--test",
    "knowledge/entities/media.test.mjs",
    "knowledge/entities/service.test.mjs",
    "knowledge/repository/knowledge-repository.test.mjs",
  ]],
  ["Gallery media coverage", "node", ["tools/content-inventory/validate-gallery-coverage.mjs"]],
  ["llms.txt build", "node", ["tools/ai-discovery/build-llms.mjs"]],
  ["llms.txt validation", "node", ["tools/ai-discovery/validate-llms.mjs"]],
  ["site-next build", "node", ["tools/site-next/build.mjs"]],
  ["localized homepages build", "node", ["tools/site-next/build-home-locales.mjs"]],
  ["project pages build", "node", ["tools/site-next/build-projects.mjs"]],
  ["gallery page build", "node", ["tools/site-next/build-gallery.mjs"]],
  ["service pages build", "node", ["tools/site-next/build-services.mjs"]],
  ["root path normalization", "node", ["tools/site-next/normalize-root-paths.mjs"]],
  ["GitHub Pages root mirror", "node", ["tools/deploy/sync-pages-root.mjs"]],
  ["root path validation", "node", ["tools/site-next/validate-root-paths.mjs"]],
  ["project pages validation", "node", ["tools/site-next/validate-project-pages.mjs"]],
  ["gallery page validation", "node", ["tools/site-next/validate-gallery-page.mjs"]],
  ["sitemap build", "node", ["tools/seo/build-sitemap.mjs"]],
  ["sitemap validation", "node", ["tools/seo/validate-sitemap.mjs"]],
  ["service pages validation", "node", ["tools/site-next/validate-service-pages.mjs"]],
  ["Route contract", "node", ["tools/routes/validate-project-routes.mjs"]],
  ["content audit", "node", ["tools/content-extractor/run.mjs"]],
  ["diff whitespace check", "git", ["diff", "--check"]],
];

for (const [label, command, args] of checks) {
  console.log(`\n==> ${label}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    break;
  }
}
