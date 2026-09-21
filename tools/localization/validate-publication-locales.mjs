#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";
import { assertPublishedArticleLocales, parseSupportedLanguages } from "./publication-locales.mjs";

const root = process.cwd();
const constantsPath = path.join(root, "architecture/constants.yaml");
const supportedLanguages = parseSupportedLanguages(await readFile(constantsPath, "utf8"));
const knowledge = createKnowledgeRepository(await loadContentTables({ root }));

assertPublishedArticleLocales(knowledge.listArticles(), supportedLanguages);

console.log(
  `Validated publication locales: ${knowledge.listArticles().length} published articles cover ${supportedLanguages.join(", ")}.`,
);
