# Vital Vibe agent service contract (experimental)

This is a **repository-local discovery and tool-planning contract**, not a deployed API, MCP server, Cabinet grant, or authority to operate production. Its format is a Vital Vibe proposal for future `cabinet_kernel` integration; `spec-workbench` has not accepted it as a canonical box schema.

Read `agent-service.v0.json` first instead of reverse-engineering builders. Existing source-of-truth remains `architecture/*` and `content/tables/*`; this file points to those authorities, never supersedes them. If the manifest conflicts with source, stop and report a semantic gap. Do not guess mappings from field names.

## Trust and execution

- `candidate` capabilities are discovery-only and MUST NOT execute. `implemented-cli` means an existing repository command, not an externally callable or authorized endpoint.
- The command bindings have fixed argv; never interpolate user text into shell, filesystem paths, URLs, branch names or command selection.
- `website.content.validate` can regenerate local projections; use a disposable checkout and verify `git diff --exit-code` afterwards.
- `website.release.prepare` creates a local validated bundle directory, not a production release. GitHub Actions packages `vps-site-bundle.tgz` and uploads it as a short-lived artifact; the archive digest must be computed and verified by the release operator.
- GitHub PR creation requires a separately granted GitHub write permission and human review. The manifest itself grants nothing.
- Production deployment/rollback, SSH, DNS and VPS secrets are **out of scope**. Deployment is performed separately from the operator's local machine.

## First integration experiment

Have `cabinet_kernel` discover `website.project.list` and attempt typed projection from `content/tables/projects.yaml` into a consumer contract. It must return an explicit semantic gap for any unproved output fields or disclosure rules; it must **not** fabricate an endpoint or claim the candidate operation exists. Add a verified implementation and bounded grant only after the semantics and security review are accepted.

Validation: `node tools/contracts/validate-agent-service.mjs`. The full project check runs this validator as well. This file is not included in `.deploy-dist`.
