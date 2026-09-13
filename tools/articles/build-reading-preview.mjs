#!/usr/bin/env node
// A sandbox-only reading sample; never adds public Article records or routes.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sandbox = path.join(root, 'sandbox/articles');
const manifest = JSON.parse(await readFile(path.join(sandbox, 'drafts/index.json'), 'utf8'));
const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

function blockHtml(block) {
  if (block.type === 'paragraph') return `<p>${escape(block.text)}</p>`;
  if (block.type === 'list') return `<ul>${block.items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`;
  if (block.type === 'quote') return `<aside class="technical-note"><span>Nota técnica</span><p>${escape(block.text)}</p></aside>`;
  if (block.type === 'image') return `<figure><img src="${escape(block.src)}" alt="${escape(block.alt)}" width="${block.width}" height="${block.height}" loading="lazy"><figcaption>${escape(block.caption || block.alt)}</figcaption></figure>`;
  throw new Error(`Unsupported article block: ${block.type}`);
}

for (const entry of manifest.articles.filter(item => item.reading_preview === true)) {
  const draft = JSON.parse(await readFile(path.resolve(sandbox, entry.source), 'utf8'));
  if (draft.status !== 'draft' || !/^[a-z0-9-]+$/.test(draft.slug)) throw new Error('Reading previews require a draft with a safe slug.');
  const faqs = (draft.faq || []).filter(item => item.internal !== true);
  const date = new Intl.DateTimeFormat(draft.language, {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'}).format(new Date(draft.updated_at));
  const toc = draft.sections.map((section, i) => `<li><a href="#section-${i + 1}"><span>${String(i + 1).padStart(2, '0')}</span>${escape(section.heading)}</a></li>`).join('');
  const sections = draft.sections.map((section, i) => `<section id="section-${i + 1}" class="article-section"><h2><span class="section-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${escape(section.heading)}</h2>${section.blocks.map(blockHtml).join('')}</section>`).join('\n');
  const html = `<!doctype html>
<html lang="${escape(draft.language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="description" content="${escape(draft.meta_description)}">
  <title>${escape(draft.seo_title)} | Vital Vibe</title>
  <link rel="stylesheet" href="../../reading.css">
</head>
<body>
  <header class="site-header"><div class="header-inner"><a href="/" aria-label="Vital Vibe — Inicio"><img src="/VVC_primary_logo.svg" alt="Vital Vibe Construcción" width="230" height="65"></a><a href="/">Volver al sitio <span aria-hidden="true">↗</span></a></div></header>
  <main id="main-content">
    <article>
      <header class="article-header">
        <div class="article-label"><span>${escape(draft.category)}</span><span class="draft-label">Borrador</span></div>
        <h1>${escape(draft.h1)}</h1>
        <p class="introduction">${escape(draft.introduction)}</p>
        <div class="article-meta"><span>${escape(draft.author)}</span><time datetime="${escape(draft.updated_at)}">${escape(date)}</time><span>${escape(entry.document.number)}</span></div>
      </header>
      <div class="reading-layout">
        <nav class="contents" aria-label="Contenido del artículo"><details open><summary>En esta guía</summary><ol>${toc}${faqs.length ? '<li><a href="#preguntas"><span>?</span>Preguntas frecuentes</a></li>' : ''}</ol></details></nav>
        <div class="article-body">
          ${sections}
          ${faqs.length ? `<section class="faq-section" id="preguntas"><p class="section-label">Para aclarar dudas</p><h2>Preguntas frecuentes</h2>${faqs.map(item => `<details><summary>${escape(item.question)}</summary><p>${escape(item.answer)}</p></details>`).join('')}</section>` : ''}
          <footer class="article-footer"><span>${escape(draft.author)}</span><a href="#main-content">Volver arriba ↑</a></footer>
        </div>
      </div>
    </article>
  </main>
  <script>if (window.matchMedia('(max-width: 760px)').matches) document.querySelector('.contents details').open = false;</script>
</body>
</html>
`;
  const output = path.join(sandbox, 'reading', draft.slug);
  await mkdir(output, {recursive:true});
  await writeFile(path.join(output, 'index.html'), html.replace(/[\t ]+$/gm, ''));
  console.log(`Built sandbox reading sample: ${draft.slug}`);
}
