#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const file = path.join(root, ".deploy-dist", "styles.css");
const marker = "/* VVC reduced-motion scroll override */";
const rule = `\n${marker}\n@media (prefers-reduced-motion: reduce) {\n  html { scroll-behavior: auto; }\n}\n`;
const css = await readFile(file, "utf8");
if (!css.includes(marker)) await writeFile(file, `${css.trimEnd()}${rule}`, "utf8");
console.log("Applied release-only reduced-motion scroll override.");
