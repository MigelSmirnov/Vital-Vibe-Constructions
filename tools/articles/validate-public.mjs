#!/usr/bin/env node
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const knowledge = createKnowledgeRepository(await loadContentTables({root}));
const contract = JSON.parse(await readFile(path.join(root,"architecture/project-routes.yaml"),"utf8"));
const routes = contract.routes.filter(route => route.family_id === "article-detail");
const family = contract.route_families.find(item=>item.id==="article-detail");
const sitemap = await readFile(path.join(root,"sitemap.xml"),"utf8");
const escape = value => String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const required = (html, fragment, label) => assert(html.includes(fragment),`Missing ${label}: ${fragment}`);
const titles = new Set();
const descriptions = new Set();
let checked = 0;
for (const article of knowledge.listArticles()) {
  const siblings = routes.filter(route=>route.entity_id===article.id);
  assert(siblings.length===article.languages.length,`Incomplete route coverage for ${article.id}`);
  for (const language of article.languages) {
    const matching = siblings.filter(route=>route.language===language);
    assert(matching.length===1,`Expected one ${language} route for ${article.id}`);
    const route=matching[0];
    const local=article.localized(language);
    assert(route.status==="generated" && route.sitemap_eligible===true,"Published article route must be generated and sitemap eligible");
    assert(route.path===`${family.path_prefixes[language]}${local.slug}/`,"Article route does not match localized slug");
    assert(route.generated_html_path===`site-next${route.path}index.html`,"Article output does not match route");
    assert(route.canonical_url===knowledge.getSite().canonicalOrigin+route.path,"Article canonical origin mismatch");
    const html=await readFile(path.join(root,route.generated_html_path),"utf8");
    assert(!/noindex|draft-label|Borrador/.test(html),"Draft marker leaked into public article");
    required(html,`<html lang="${language}">`,"document language");
    assert((html.match(/<h1\b/g)||[]).length===1,"Article must have exactly one h1");
    required(html,`<h1>${escape(local.title)}</h1>`,"localized title");
    required(html,`<p class="introduction">${escape(local.summary)}</p>`,"localized introduction");
    required(html,`content="${escape(local.meta_description)}"`,"description");
    required(html,`rel="canonical" href="${route.canonical_url}"`,"canonical");
    for (const sibling of siblings) {
      required(html,`hreflang="${sibling.language}" href="${sibling.canonical_url}"`,"reciprocal hreflang");
      required(html,`href="${sibling.path}" lang="${sibling.language}"`,"language navigation");
    }
    required(html,`hreflang="x-default" href="${siblings.find(item=>item.language===article.language).canonical_url}"`,"default alternate");
    const home=await readFile(path.join(root,"site-next",language==="es"?"index.html":`${language}/index.html`),"utf8");
    if (article.relatedProjectIds.includes(knowledge.findMediaById(knowledge.getSite().featuredMediaId)?.projectId)) required(home,`href="${route.path}"`,"localized homepage link");
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
    assert(new Set(ids).size===ids.length,"Duplicate article anchors");
    for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(match[1]),"Broken article anchor");
    let imageCount=0;
    for (const section of local.body) {
      required(html,escape(section.heading),"section heading");
      for (const block of section.blocks) {
        if (block.type==="paragraph") required(html,escape(block.text),"body paragraph");
        if (block.type==="list") block.items.forEach(item=>required(html,escape(item),"list item"));
        if (block.type==="image") {
          imageCount++;
          const media=knowledge.findMediaById(block.media_id);
          required(html,`src="/${media.src}" alt="${escape(block.alt)}" width="${media.width}" height="${media.height}"`,"localized image contract");
          required(html,escape(block.caption),"localized caption");
          await access(path.join(root,media.src));
        }
      }
    }
    assert((html.match(/<figure>/g)||[]).length===imageCount,"Unexpected article image count");
    const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1]);
    assert(schema["@type"]==="Article" && schema.headline===local.title && schema.inLanguage===language && schema.mainEntityOfPage===route.canonical_url,"Article structured data mismatch");
    assert(schema.datePublished===local.published_at && schema.dateModified===local.modified_at,"Article dates mismatch");
    assert(schema.image.length===imageCount,"Article structured image count mismatch");
    assert(sitemap.split(`<loc>${route.canonical_url}</loc>`).length===2,"Article must occur exactly once in sitemap");
    assert(!titles.has(local.seo_title) && !descriptions.has(local.meta_description),"Duplicate localized metadata");
    titles.add(local.seo_title);descriptions.add(local.meta_description);checked++;
  }
}
assert(checked===routes.length,"Unknown or extra article route");
for (const redirect of contract.article_redirects??[]) {
  const html=await readFile(path.join(root,"site-next",redirect.from.slice(1),"index.html"),"utf8");
  required(html,'content="noindex, follow"',"redirect noindex");
  required(html,`content="0; url=${redirect.to}"`,"redirect destination");
  assert(!sitemap.includes(knowledge.getSite().canonicalOrigin+redirect.from),"Old draft URL must not be indexed");
}
assert(await readFile(path.join(root,"site-next/article.css"),"utf8")===await readFile(path.join(root,"tools/articles/article.css"),"utf8"),"Article stylesheet is stale");
console.log(`Validated ${checked} published article pages: copy, images, languages, routes, metadata and redirects`);
