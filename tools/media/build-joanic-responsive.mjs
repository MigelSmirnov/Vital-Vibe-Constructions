#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createKnowledgeRepository, loadContentTables } from '../../knowledge/index.mjs';

const root = process.cwd();
const dist = path.join(root, '.deploy-dist');
const knowledge = createKnowledgeRepository(await loadContentTables({ root }));
const project = knowledge.findProjectById('project-escalera-joanic-pintura');
const contract = JSON.parse(await readFile('architecture/project-routes.yaml', 'utf8'));
const media = project.imageIds.map(id => knowledge.findMediaById(id));
const temporary = await mkdtemp(path.join(tmpdir(), 'vvc-joanic-'));
const projections = new Map();
await mkdir(path.join(dist, 'assets/responsive/joanic'), { recursive: true });
try {
  for (const item of media) {
    const source = path.join(root, item.src);
    const bytes = await readFile(source);
    const hash = createHash('sha256').update(bytes).update('webp-q82-m6-auto-orient-v1').digest('hex').slice(0, 12);
    const variants = [];
    for (const width of [...new Set([480, 768, 1152].map(w => Math.min(w, item.width)))]) {
      const png = path.join(temporary, 'oriented.png');
      // Fail on truncated/corrupt JPEG data instead of accepting a decodable gray remainder.
      execFileSync('convert', ['-regard-warnings', source, '-auto-orient', '-resize', `${width}x`, '-strip', png]);
      const url = `/assets/responsive/joanic/${item.id}-${hash}-${width}.webp`;
      execFileSync('cwebp', ['-quiet', '-mt', '-m', '6', '-q', '82', png, '-o', path.join(dist, url)]);
      variants.push({ width, url, bytes: (await stat(path.join(dist, url))).size });
    }
    projections.set(`/${item.src}`, { originalBytes: bytes.length, variants });
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
const routes = contract.routes.filter(route => route.status === 'generated' &&
  (route.entity_id === project.id || ['homepage', 'projects-index', 'projects-index-localized'].includes(route.family_id)));
for (const route of routes) {
  const file = path.join(dist, route.path, 'index.html');
  let count = 0;
  const html = (await readFile(file, 'utf8')).replace(/<img\b[^>]*>/g, image => {
    const projection = projections.get(image.match(/\bsrc="([^"]+)"/)?.[1]);
    if (!projection) return image;
    count++;
    const sizes = route.family_id === 'homepage' ? '(min-width: 1100px) 128px, 92px' : '(max-width: 720px) 92vw, 768px';
    return `<picture style="display:contents"><source type="image/webp" srcset="${projection.variants.map(v => `${v.url} ${v.width}w`).join(', ')}" sizes="${sizes}">${image}</picture>`;
  });
  const expected = route.entity_id === project.id ? media.length : 1;
  if (count !== expected) throw new Error(`Expected ${expected} Joanic images in ${route.path}, found ${count}`);
  await writeFile(file, html);
}
await writeFile(path.join(root, 'artifacts/responsive-vps/joanic-images.json'), JSON.stringify(Object.fromEntries(projections), null, 2));
console.log(`Integrated ${media.length} Joanic photographs with responsive WebP in ${routes.length} pages.`);
