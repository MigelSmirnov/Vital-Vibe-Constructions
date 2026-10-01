#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createKnowledgeRepository, loadContentTables } from "../../knowledge/index.mjs";

const root = process.cwd();
const dist = path.join(root, ".deploy-dist");
const repository = createKnowledgeRepository(await loadContentTables({ root }));
// Bounded delivery optimization for the eight recently added owner photographs.
const articleIds = new Set(["article-painting-preparation", "article-floor-leveling"]);
const articles = repository.listArticles().filter(article => articleIds.has(article.id));
if (articles.length !== articleIds.size) throw new Error("Missing article image optimization scope");
const mediaIds = [...new Set(articles.flatMap(article => article.mediaIds))];
const media = mediaIds.map(id => repository.findMediaById(id));
const contract = JSON.parse(await readFile(path.join(root, "architecture/project-routes.yaml"), "utf8"));
const routes = contract.routes.filter(route => route.status === "generated" &&
  (articleIds.has(route.entity_id) || route.family_id === "articles-index"));
const articleSizes = "(max-width: 760px) calc(100vw - 44px), (max-width: 880px) calc(100vw - 328px), (max-width: 1057px) calc(95vw - 284px), 720px";
const catalogSizes = "(max-width: 760px) calc(100vw - 44px), (max-width: 1104px) calc(50vw - 46px), 506px";
const imageDirectory = path.join(dist, "assets/responsive/articles");
await mkdir(imageDirectory, { recursive: true });
const temporary = await mkdtemp(path.join(tmpdir(), "vvc-article-images-"));
const projections = new Map();
try {
  for (const item of media) {
    const source = path.join(root, item.src);
    const bytes = await readFile(source);
    const hash = createHash("sha256").update(bytes).update("webp-q82-m6-auto-orient-v1").digest("hex").slice(0, 12);
    const widths = [...new Set([480, 768, 1440].map(width => Math.min(width, item.width)))];
    const variants = [];
    for (const width of widths) {
      const url = `/assets/responsive/articles/${item.id}-${hash}-${width}.webp`;
      const png = path.join(temporary, "oriented.png");
      execFileSync("convert", [source, "-auto-orient", "-resize", `${width}x`, "-strip", png]);
      execFileSync("cwebp", ["-quiet", "-mt", "-m", "6", "-q", "82", png, "-o", path.join(dist, url)]);
      variants.push({ width, url, bytes: (await stat(path.join(dist, url))).size });
    }
    projections.set(`/${item.src}`, { id: item.id, originalBytes: bytes.length, variants });
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}

for (const route of routes) {
  const file = path.join(dist, route.path, "index.html");
  const html = await readFile(file, "utf8");
  let count = 0;
  const sizes = route.family_id === "articles-index" ? catalogSizes : articleSizes;
  const updated = html.replace(/<img\b[^>]*>/g, image => {
    const src = image.match(/\bsrc="([^"]+)"/)?.[1];
    const projection = projections.get(src);
    if (!projection) return image;
    count += 1;
    const srcset = projection.variants.map(variant => `${variant.url} ${variant.width}w`).join(", ");
    return `<picture style="display:contents"><source type="image/webp" srcset="${srcset}" sizes="${sizes}">${image}</picture>`;
  });
  if (articleIds.has(route.entity_id)) {
    const expected = articles.find(article => article.id === route.entity_id).mediaIds.length;
    if (count !== expected) throw new Error(`Expected ${expected} article photos in ${route.path}, found ${count}`);
  }
  await writeFile(file, updated);
}
const report = path.join(root, "artifacts/responsive-vps/article-images.json");
await mkdir(path.dirname(report), { recursive: true });
await writeFile(report, JSON.stringify(Object.fromEntries(projections), null, 2));
console.log(`Integrated responsive WebP delivery for ${media.length} article photographs across ${routes.length} localized pages/catalogs.`);
