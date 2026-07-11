#!/usr/bin/env node

import { readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(toolDir, "extract.mjs");
const runtimePath = path.join(toolDir, ".extract.runtime.mjs");

async function main() {
  const source = await readFile(sourcePath, "utf8");

  const patched = source
    .replace(
      'if (!snapshot.landmarks.some((item) => item.tag === "main")) add("warning", "missing-main", "Document has no semantic <main> landmark.");',
      'if (!snapshot.rawMetrics.hasMain) add("warning", "missing-main", "Document has no semantic <main> landmark.");',
    )
    .replace(
      'if (!snapshot.landmarks.some((item) => item.tag === "nav")) add("info", "missing-nav", "Document has no semantic <nav> landmark.");',
      'if (!snapshot.rawMetrics.hasNav) add("info", "missing-nav", "Document has no semantic <nav> landmark.");',
    )
    .replace(
      '      dataDcScriptPresent: /data-dc-script/i.test(html),',
      [
        '      dataDcScriptPresent: /data-dc-script/i.test(html),',
        '      hasMain: /<main\\b/i.test(html),',
        '      hasNav: /<nav\\b/i.test(html),',
      ].join("\n"),
    );

  if (patched === source) {
    throw new Error("The expected extractor source patterns were not found; refusing to run an unverified patch.");
  }

  await writeFile(runtimePath, patched, "utf8");

  try {
    const child = spawn(process.execPath, [runtimePath, ...process.argv.slice(2)], {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
    });

    const exitCode = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => {
        if (signal) reject(new Error(`Extractor terminated by signal ${signal}.`));
        else resolve(code ?? 1);
      });
    });

    process.exitCode = exitCode;
  } finally {
    await rm(runtimePath, { force: true });
  }
}

main().catch((error) => {
  console.error("Corrected content audit runner failed.");
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
