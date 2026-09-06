#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sandboxRoot = path.join(root, "sandbox", "articles");
const manifestPath = path.join(sandboxRoot, "drafts", "index.json");
const requiredFields = [
  "id",
  "slug",
  "status",
  "language",
  "title",
  "seo_title",
  "meta_description",
  "h1",
  "introduction",
  "sections",
];
const supportedBlockTypes = new Set(["paragraph", "list", "quote", "image"]);
const documentNumberPattern = /^VVC-ART-\d{3}$/;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function validateDraft(draft, source) {
  for (const field of requiredFields) {
    assert(draft[field] !== undefined && draft[field] !== null && draft[field] !== "", `${source}: missing ${field}`);
  }

  assert(draft.status === "draft", `${source}: status must be draft`);
  assert(Array.isArray(draft.sections), `${source}: sections must be an array`);
  assert(draft.sections.length > 0, `${source}: sections must not be empty`);
  assert(draft.seo_title.length <= 65, `${source}: seo_title must be 65 characters or fewer`);
  assert(draft.meta_description.length <= 170, `${source}: meta_description must be 170 characters or fewer`);

  for (const [sectionIndex, section] of draft.sections.entries()) {
    assert(typeof section.heading === "string" && section.heading.trim(), `${source}: section ${sectionIndex + 1} needs a heading`);
    assert(Array.isArray(section.blocks) && section.blocks.length > 0, `${source}: section ${sectionIndex + 1} needs blocks`);

    for (const [blockIndex, block] of section.blocks.entries()) {
      assert(supportedBlockTypes.has(block.type), `${source}: unsupported block type ${block.type} at ${sectionIndex + 1}.${blockIndex + 1}`);
      if (block.type === "paragraph" || block.type === "quote") {
        assert(typeof block.text === "string" && block.text.trim(), `${source}: ${block.type} block needs text`);
      }
      if (block.type === "list") {
        assert(Array.isArray(block.items) && block.items.length > 0, `${source}: list block needs items`);
      }
      if (block.type === "image") {
        assert(typeof block.src === "string" && block.src.startsWith("/"), `${source}: image src must be root-relative`);
        assert(typeof block.alt === "string" && block.alt.trim(), `${source}: image needs truthful alt text`);
        assert(Number.isFinite(block.width) && block.width > 0, `${source}: image width is required`);
        assert(Number.isFinite(block.height) && block.height > 0, `${source}: image height is required`);
      }
    }
  }

  if (draft.faq !== undefined) {
    assert(Array.isArray(draft.faq), `${source}: faq must be an array`);
    for (const [index, item] of draft.faq.entries()) {
      assert(typeof item.question === "string" && item.question.trim(), `${source}: FAQ ${index + 1} needs a question`);
      assert(typeof item.answer === "string" && item.answer.trim(), `${source}: FAQ ${index + 1} needs an answer`);
    }
  }
}

function validatePresentation(item) {
  assert(item.document && typeof item.document === "object", `manifest entry ${item.id}: document metadata is required`);
  assert(typeof item.document.number === "string" && documentNumberPattern.test(item.document.number), `manifest entry ${item.id}: document.number must match VVC-ART-000`);

  if (item.sheet_titles !== undefined) {
    assert(Array.isArray(item.sheet_titles), `manifest entry ${item.id}: sheet_titles must be an array`);
    for (const [index, title] of item.sheet_titles.entries()) {
      assert(typeof title === "string" && title.trim(), `manifest entry ${item.id}: sheet_titles[${index}] must be non-empty`);
    }
  }
}

async function main() {
  const manifest = await readJson(manifestPath);
  assert(manifest.version === 1, "draft manifest version must be 1");
  assert(Array.isArray(manifest.articles), "draft manifest articles must be an array");

  const ids = new Set();
  const slugs = new Set();
  const documentNumbers = new Set();

  for (const item of manifest.articles) {
    assert(item.status === "draft", `manifest entry ${item.id}: status must be draft`);
    assert(!ids.has(item.id), `duplicate manifest id: ${item.id}`);
    ids.add(item.id);

    validatePresentation(item);
    assert(!documentNumbers.has(item.document.number), `duplicate document number: ${item.document.number}`);
    documentNumbers.add(item.document.number);

    const sourcePath = path.resolve(sandboxRoot, item.source);
    assert(sourcePath.startsWith(path.join(sandboxRoot, "drafts") + path.sep), `manifest entry ${item.id}: source must remain inside drafts`);

    const draft = await readJson(sourcePath);
    validateDraft(draft, item.source);
    assert(draft.id === item.id, `${item.source}: id does not match manifest`);
    assert(draft.title === item.title, `${item.source}: title does not match manifest`);
    assert(draft.language === item.language, `${item.source}: language does not match manifest`);
    assert(!slugs.has(draft.slug), `duplicate draft slug: ${draft.slug}`);
    slugs.add(draft.slug);
  }

  console.log(`Article sandbox drafts valid: ${manifest.articles.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
