#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { strict as assert } from "node:assert";
const manifest = JSON.parse(await readFile("contracts/agent-service.v0.json", "utf8"));
assert.equal(manifest.manifest_version, "vvc.agent_service.v0");
assert.equal(manifest.status, "experimental");
assert.equal(manifest.boundaries.production_activation.startsWith("external local operator"), true);
assert.equal(manifest.policies.default_deny, true);
assert.equal(manifest.policies.candidate_capability_execution, "reject");
const ids = new Set();
for (const cap of manifest.capabilities) {
  assert(!ids.has(cap.id), "duplicate capability"); ids.add(cap.id);
  assert(["candidate","implemented-cli","implemented-cli-sequence"].includes(cap.status));
  if (cap.status === "candidate") assert.equal(cap.binding, null);
  if (cap.binding) {
    assert.equal(cap.binding.runner, "node");
    const sequences = cap.binding.argv_sequence ?? [cap.binding.argv];
    for (const argv of sequences) {
      assert(Array.isArray(argv) && argv.length === 1);
      assert(["tools/checks/run.mjs","tools/deploy/build-vps-bundle.mjs","tools/deploy/validate-vps-bundle.mjs"].includes(argv[0]));
    }
  }
  assert(!cap.id.includes("deploy") && !cap.id.includes("activate"));
}
for (const source of manifest.sources) {
  const data = JSON.parse(await readFile(source.path, "utf8"));
  assert(Array.isArray(data[source.collection]));
  for (const item of data[source.collection]) {
    for (const field of Object.keys(source.fields)) assert(field in item, `${source.id} missing ${field}`);
  }
}
console.log("Agent service contract validated (discovery only; no production authority).");
