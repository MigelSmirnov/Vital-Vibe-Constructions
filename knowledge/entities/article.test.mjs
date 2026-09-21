import test from "node:test";
import assert from "node:assert/strict";
import { Article } from "./article.mjs";
import { createKnowledgeRepository, loadContentTables } from "../index.mjs";

const fixture = () => ({ id: "article-test", slug: "test", status: "published", language: "es", title: "Caso", seo_title: "Caso", summary: "Resumen", meta_description: "Descripción", category: "Obra", author: "VVC", published_at: "2026-09-08", modified_at: "2026-09-08", body: [{ heading: "Trabajo", blocks: [{type:"paragraph",text:"Hechos del caso."},{type:"image",media_id:"media-test",alt:"Obra",caption:"Durante la obra"}] }] });

test("Article rejects drafts, invalid dates and unsafe slugs before publication", () => {
  assert.throws(() => Article.fromRecord({...fixture(),status:"draft"}), /published/);
  assert.throws(() => Article.fromRecord({...fixture(),published_at:"2026-02-30"}), /published_at/);
  assert.throws(() => Article.fromRecord({...fixture(),slug:"../escape"}), /slug/);
});

test("Article translations require complete text and matching evidence", () => {
  const translated = {...fixture(),slug:"translation"};
  const valid = {...fixture(),translations:{en:translated}};
  assert.equal(Article.fromRecord(valid).localized("en").slug,"translation");
  assert.throws(() => Article.fromRecord({...valid,translations:{en:{...translated,summary:""}}}), /summary/);
  const wrong = structuredClone(translated);
  wrong.body[0].blocks[1].media_id="different-photo";
  assert.throws(() => Article.fromRecord({...valid,translations:{en:wrong}}), /same media/);
  assert.throws(() => Article.fromRecord(valid).localized("ru"), /no ru translation/);
});

test("Knowledge Repository rejects orphan article references and unknown project articles", async () => {
  const tables = await loadContentTables();
  const badMedia = structuredClone(tables);
  for (const localized of [badMedia.articles[0],...Object.values(badMedia.articles[0].translations)]) {
    localized.body.flatMap(section=>section.blocks).find(block=>block.type==="image").media_id="unknown-photo";
  }
  assert.throws(() => createKnowledgeRepository(badMedia), /Unknown article.*media/);
  const badProject = structuredClone(tables);
  badProject.articles[0].related_project_ids=["unknown-project"];
  assert.throws(() => createKnowledgeRepository(badProject), /Unknown article.*projects/);
  const badLink = structuredClone(tables);
  badLink.projects[0].article_ids=["unknown-article"];
  assert.throws(() => createKnowledgeRepository(badLink), /Unknown project.*articles/);
});

test("Published bathroom article retains three languages and six unchanged media identities", async () => {
  const repository = createKnowledgeRepository(await loadContentTables());
  const article = repository.findArticleById("article-bathroom-sink-relocation");
  assert.deepEqual(article.languages,["es","en","ru"]);
  assert.equal(article.mediaIds.length,6);
  assert.equal(article.localized("ru").title,"Перенести раковину — это разобрать и снова собрать ванную");
  for (const id of article.mediaIds) assert.ok(repository.findMediaById(id));
});
