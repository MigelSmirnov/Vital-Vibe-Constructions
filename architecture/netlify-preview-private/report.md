# Netlify preview access restriction — 2026-09-13

Owner authorized closing the Netlify preview after the crawler/AEO audit. Restricted existing project `vital-vibe-preview`, site ID `56647124-f7e4-48b4-af01-d4069b069c9a`, to authenticated Netlify team access for all deploys. The tool scope string `all-projects` resolves to this site's `whichProjectsRequireSSOTeamLogin: all`; no team-wide default was changed.

Before: requiresSSOTeamLogin=false, requiresPassword=false. After: requiresSSOTeamLogin=true, scope=all, requiresPassword=false. Existing deploy `6aa6e79ae275bb6ae5c7c792` is unchanged; no rebuild or upload was performed.

The connected Netlify tool exposes visitor access controls, not deployment header editing. Used project-level team login protection rather than the initially considered public noindex-only mode. The owner can view the private preview using a permitted Netlify account. This is access restriction, not a claim of instant removal from search indexes. No password was created and no paid-plan change was made.

Verification: unauthenticated home, Russian painting article and robots.txt all returned 401 on both the preview alias and its immutable deploy URL. The latter also returned X-Robots-Tag: noindex; alias has no such header, so its protection is the HTTP authentication response. A Googlebot User-Agent probe also returned 401. Authenticated owner login was not tested in this session.

Main domain home, article and robots.txt returned 200 without X-Robots-Tag restrictions. Production SHA remains `2695336c8117234206bc4a3e19009ae517f7094f`. Planner `/manual` returned 200 and was byte-identical to the prior baseline. No VPS, main-domain DNS, mail, planner, GitHub Pages or production files were changed.

Rollback: in this exact Netlify project's visitor access controls disable team login protection, restoring requiresSSOTeamLogin=false. This would reopen the preview to anonymous visitors/crawlers. Do not change team defaults or another project.

Evidence: verification.json. [Netlify protection documentation](https://docs.netlify.com/manage/security/secure-access-to-sites/password-protection/).
