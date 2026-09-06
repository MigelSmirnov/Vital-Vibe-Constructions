const state = {
  manifest: [],
  activeId: null,
  activeDraft: null,
};

const elements = {
  draftList: document.querySelector('#draftList'),
  articlePreview: document.querySelector('#articlePreview'),
  seoPanel: document.querySelector('#seoPanel'),
  sourceEditor: document.querySelector('#sourceEditor'),
  previewView: document.querySelector('#previewView'),
  sourceView: document.querySelector('#sourceView'),
  saveDraft: document.querySelector('#saveDraft'),
  resetDraft: document.querySelector('#resetDraft'),
  error: document.querySelector('#error'),
};

const storageKey = (id) => `vvc-article-sandbox:${id}`;

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showError(message) {
  elements.error.textContent = message;
  elements.error.hidden = false;
}

function clearError() {
  elements.error.hidden = true;
  elements.error.textContent = '';
}

function validateDraft(draft) {
  const required = ['id', 'slug', 'status', 'language', 'title', 'seo_title', 'meta_description', 'h1', 'introduction', 'sections'];
  const missing = required.filter((field) => draft[field] === undefined || draft[field] === null || draft[field] === '');
  if (missing.length) throw new Error(`Не заполнены обязательные поля: ${missing.join(', ')}`);
  if (draft.status !== 'draft') throw new Error('Sandbox принимает только материалы со status: draft.');
  if (!Array.isArray(draft.sections)) throw new Error('Поле sections должно быть массивом.');
  if (draft.faq && !Array.isArray(draft.faq)) throw new Error('Поле faq должно быть массивом.');
  return draft;
}

function renderSeo(draft) {
  const fields = [
    ['Status', draft.status],
    ['Language', draft.language],
    ['Slug', draft.slug],
    ['SEO title', `${draft.seo_title} (${draft.seo_title.length})`, true],
    ['Meta description', `${draft.meta_description} (${draft.meta_description.length})`, true],
  ];

  elements.seoPanel.innerHTML = fields.map(([label, value, wide]) => `
    <div class="seo-field${wide ? ' is-wide' : ''}">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value)}</span>
    </div>
  `).join('');
}

function chunk(items, size) {
  const groups = [];
  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }
  return groups;
}

function manifestEntry(draft) {
  return state.manifest.find((item) => item.id === draft.id) || null;
}

function documentMeta(draft) {
  const entry = manifestEntry(draft);
  const document = entry?.document || {};
  const manifestIndex = state.manifest.findIndex((item) => item.id === draft.id);

  return {
    number: draft.document_number || document.number || `VVC-ART-${String(Math.max(1, manifestIndex + 1)).padStart(3, '0')}`,
    revision: draft.revision ?? document.revision ?? '0',
    status: draft.document_status || document.status || 'Borrador',
    serviceLabel: draft.service_label || document.service_label || draft.category || '—',
    scope: draft.scope || document.scope || 'Barcelona',
    stampTitle: draft.stamp_title || document.stamp_title || draft.seo_title || draft.title,
    sheetTitles: Array.isArray(draft.sheet_titles)
      ? draft.sheet_titles
      : (Array.isArray(entry?.sheet_titles) ? entry.sheet_titles : []),
  };
}

function articleNumber(draft) {
  return documentMeta(draft).number;
}

function shortTitle(draft) {
  return documentMeta(draft).stampTitle;
}

function renderZones() {
  return `
    <div class="zones" aria-hidden="true">
      <ol class="top"><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li></ol>
      <ol class="bottom"><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li></ol>
      <ol class="left"><li>A</li><li>B</li><li>C</li><li>D</li></ol>
      <ol class="right"><li>A</li><li>B</li><li>C</li><li>D</li></ol>
    </div>
  `;
}

function renderStamp(draft, sheetNumber, sheetCount) {
  const meta = documentMeta(draft);
  return `
    <div class="stamp" aria-hidden="true">
      <div class="logo">VVC</div>
      <div class="title">${escapeHtml(meta.stampTitle)}</div>
      <div class="hoja"><small>Hoja</small>${sheetNumber} / ${sheetCount}</div>
      <div><small>Doc. nº</small>${escapeHtml(meta.number)}</div>
      <div><small>Fecha</small>${escapeHtml(draft.updated_at || 'Sin fecha')}</div>
      <div class="rev"><small>Rev.</small>${escapeHtml(meta.revision)}</div>
    </div>
  `;
}

function renderBlocks(blocks = [], context) {
  return blocks.map((block) => {
    switch (block.type) {
      case 'paragraph':
        return `<p>${escapeHtml(block.text)}</p>`;
      case 'list':
        return `<ul>${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
      case 'quote': {
        context.noteNumber += 1;
        return `
          <aside class="note">
            <strong>NOTA ${context.noteNumber}</strong>
            <p>${escapeHtml(block.text)}</p>
          </aside>
        `;
      }
      case 'image':
        return `
          <figure class="technical-figure">
            <img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" width="${Number(block.width) || 1200}" height="${Number(block.height) || 800}" loading="lazy">
            <figcaption><span>FIG.</span>${escapeHtml(block.caption || block.alt)}</figcaption>
          </figure>
        `;
      default:
        return `<p><em>Неподдерживаемый блок: ${escapeHtml(block.type)}</em></p>`;
    }
  }).join('');
}

function renderSheetNav(sheetNumber, sheetCount) {
  const previous = sheetNumber > 1
    ? `<a href="#hoja-${sheetNumber - 1}">← Hoja ${sheetNumber - 1}</a>`
    : '<span></span>';
  const next = sheetNumber < sheetCount
    ? `<a href="#hoja-${sheetNumber + 1}">Hoja ${sheetNumber + 1} →</a>`
    : '<a href="#hoja-1">↑ Portada</a>';
  return `<div class="sheet-nav">${previous}${next}</div>`;
}

function renderCover(draft, contentGroups, hasFaq, sheetCount) {
  const meta = documentMeta(draft);
  const indexRows = contentGroups.map((group, groupIndex) => {
    const sheetNumber = groupIndex + 2;
    const firstSectionIndex = groupIndex * 3;
    const lastSectionIndex = firstSectionIndex + group.length - 1;
    const firstHeading = group[0]?.heading || '';
    const lastHeading = group[group.length - 1]?.heading || '';
    const fallbackLabel = firstHeading === lastHeading
      ? firstHeading
      : `${firstHeading} — ${lastHeading}`;
    const label = meta.sheetTitles[groupIndex] || fallbackLabel;
    const range = `${firstSectionIndex + 1}.0${lastSectionIndex > firstSectionIndex ? ` – ${lastSectionIndex + 1}.0` : ''}`;
    return `<tr><td>${String(sheetNumber).padStart(2, '0')}</td><td><a href="#hoja-${sheetNumber}">${escapeHtml(label)}</a></td><td>${range}</td></tr>`;
  }).join('');

  const faqRow = hasFaq
    ? `<tr><td>${String(sheetCount).padStart(2, '0')}</td><td><a href="#hoja-${sheetCount}">Notas y preguntas frecuentes</a></td><td>N.1 – N.${draft.faq.length}</td></tr>`
    : '';

  return `
    <article class="sheet cover-sheet" id="hoja-1">
      ${renderZones()}
      <div class="sheet-inner">
        <span class="sheet-tag">Hoja 1 / ${sheetCount} · Portada</span>
        <header class="cover-block">
          <div class="cover-main">
            <p class="doc-kind"><span>Guía técnica</span><span>${escapeHtml(draft.category || 'Artículo')}</span></p>
            <h1>${escapeHtml(draft.h1)}</h1>
            <p class="intro">${escapeHtml(draft.introduction)}</p>
          </div>
          <dl class="fields">
            <div><dt>Documento nº</dt><dd>${escapeHtml(articleNumber(draft))}</dd></div>
            <div><dt>Estado</dt><dd class="status">${escapeHtml(meta.status)}</dd></div>
            <div><dt>Fecha</dt><dd>${escapeHtml(draft.updated_at || 'Sin fecha')}</dd></div>
            <div><dt>Revisión</dt><dd>Rev. ${escapeHtml(meta.revision)}</dd></div>
            <div><dt>Servicio</dt><dd>${escapeHtml(meta.serviceLabel)}</dd></div>
            <div><dt>Ámbito</dt><dd>${escapeHtml(meta.scope)}</dd></div>
            <div><dt>Idioma</dt><dd>${escapeHtml(String(draft.language || 'es').toUpperCase())}</dd></div>
            <div><dt>Hojas</dt><dd>${sheetCount}</dd></div>
            <div class="wide"><dt>Redactado por</dt><dd class="brand">${escapeHtml(draft.author || 'Vital Vibe Construction')}</dd></div>
          </dl>
        </header>
        <nav class="sheet-index" aria-label="Índice de hojas">
          <p class="sheet-index-title">Índice de hojas</p>
          <table>
            <thead><tr><th>Hoja</th><th>Contenido</th><th>Apartados</th></tr></thead>
            <tbody>${indexRows}${faqRow}</tbody>
          </table>
        </nav>
        ${renderStamp(draft, 1, sheetCount)}
      </div>
    </article>
    ${renderSheetNav(1, sheetCount)}
  `;
}

function renderContentSheet(draft, group, groupIndex, sheetCount, context) {
  const sheetNumber = groupIndex + 2;
  const firstSectionIndex = groupIndex * 3;
  const sections = group.map((section, index) => {
    const sectionNumber = firstSectionIndex + index + 1;
    return `
      <section id="s${sectionNumber}">
        <h2><span class="n">${sectionNumber}.0</span>${escapeHtml(section.heading)}</h2>
        ${renderBlocks(section.blocks, context)}
      </section>
    `;
  }).join('');

  return `
    <article class="sheet" id="hoja-${sheetNumber}">
      ${renderZones()}
      <div class="sheet-inner">
        <span class="sheet-tag">Hoja ${sheetNumber} / ${sheetCount}</span>
        <div class="content">${sections}</div>
        ${renderStamp(draft, sheetNumber, sheetCount)}
      </div>
    </article>
    ${renderSheetNav(sheetNumber, sheetCount)}
  `;
}

function renderFaqSheet(draft, sheetCount) {
  const sheetNumber = sheetCount;
  const faqItems = (draft.faq || []).map((item, index) => `
    <details${index === 0 ? ' open' : ''}>
      <summary><span>N.${index + 1}</span><span>${escapeHtml(item.question)}</span></summary>
      <p>${escapeHtml(item.answer)}</p>
    </details>
  `).join('');

  return `
    <article class="sheet" id="hoja-${sheetNumber}">
      ${renderZones()}
      <div class="sheet-inner">
        <span class="sheet-tag">Hoja ${sheetNumber} / ${sheetCount} · Notas</span>
        <section class="faq" aria-label="Notas y preguntas frecuentes">
          <div class="faq-head"><span>Nº</span><span>Notas y preguntas frecuentes</span></div>
          ${faqItems}
        </section>
        <div class="cta">
          <p>${escapeHtml(draft.cta_text || 'El precio definitivo se confirma tras revisar el inmueble y definir el alcance del trabajo.')}<small>${escapeHtml(draft.cta_note || 'Contenido orientativo; no constituye una oferta comercial.')}</small></p>
          <a class="button" href="/#contacto">${escapeHtml(draft.cta_label || 'Solicitar visita y presupuesto')}</a>
        </div>
        ${renderStamp(draft, sheetNumber, sheetCount)}
      </div>
    </article>
    ${renderSheetNav(sheetNumber, sheetCount)}
  `;
}

function renderArticle(draft) {
  const contentGroups = chunk(draft.sections, 3);
  const hasFaq = Boolean(draft.faq?.length);
  const sheetCount = 1 + contentGroups.length + (hasFaq ? 1 : 0);
  const context = { noteNumber: 0 };

  const contentSheets = contentGroups
    .map((group, index) => renderContentSheet(draft, group, index, sheetCount, context))
    .join('');

  const faqSheet = hasFaq ? renderFaqSheet(draft, sheetCount) : '';

  elements.articlePreview.innerHTML = `
    <div class="article-site-header">
      <a class="article-brand" href="/" aria-label="Vital Vibe Construction">
        <img src="/VVC_primary_logo.svg" alt="" width="960" height="330">
      </a>
      <nav aria-label="Navegación principal">
        <a href="/#servicios">Servicios</a>
        <a href="/#proyectos">Proyectos</a>
        <a href="/#precios">Precios</a>
        <a href="/#contacto">Contacto</a>
      </nav>
    </div>
    <main class="sheet-stack">
      ${renderCover(draft, contentGroups, hasFaq, sheetCount)}
      ${contentSheets}
      ${faqSheet}
    </main>
    <footer class="article-site-footer">© ${new Date().getFullYear()} Vital Vibe Construction · Vista de borrador</footer>
  `;
}

function renderDraftList() {
  elements.draftList.innerHTML = state.manifest.map((item) => `
    <button class="draft-card${item.id === state.activeId ? ' is-active' : ''}" data-draft-id="${escapeHtml(item.id)}" type="button">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.status)} · ${escapeHtml(item.language)}</span>
    </button>
  `).join('');

  elements.draftList.querySelectorAll('[data-draft-id]').forEach((button) => {
    button.addEventListener('click', () => loadDraft(button.dataset.draftId));
  });
}

async function loadDraft(id) {
  clearError();
  const item = state.manifest.find((entry) => entry.id === id);
  if (!item) return;

  try {
    const local = localStorage.getItem(storageKey(id));
    const draft = local
      ? JSON.parse(local)
      : await fetch(item.source, { cache: 'no-store' }).then((response) => {
          if (!response.ok) throw new Error(`Не удалось загрузить ${item.source}`);
          return response.json();
        });

    state.activeId = id;
    state.activeDraft = validateDraft(draft);
    elements.sourceEditor.value = JSON.stringify(state.activeDraft, null, 2);
    renderSeo(state.activeDraft);
    renderArticle(state.activeDraft);
    renderDraftList();
  } catch (error) {
    showError(error.message);
  }
}

function switchView(view) {
  const isPreview = view === 'preview';
  elements.previewView.hidden = !isPreview;
  elements.sourceView.hidden = isPreview;
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === view);
  });
}

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => switchView(button.dataset.view));
});

elements.saveDraft.addEventListener('click', () => {
  if (!state.activeId) return;
  clearError();
  try {
    const draft = validateDraft(JSON.parse(elements.sourceEditor.value));
    localStorage.setItem(storageKey(state.activeId), JSON.stringify(draft));
    state.activeDraft = draft;
    renderSeo(draft);
    renderArticle(draft);
    switchView('preview');
  } catch (error) {
    showError(`Черновик не сохранён: ${error.message}`);
  }
});

elements.resetDraft.addEventListener('click', () => {
  if (!state.activeId) return;
  localStorage.removeItem(storageKey(state.activeId));
  loadDraft(state.activeId);
});

async function boot() {
  try {
    const response = await fetch('./drafts/index.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Не удалось загрузить список черновиков.');
    const manifest = await response.json();
    state.manifest = manifest.articles || [];
    renderDraftList();
    if (state.manifest[0]) await loadDraft(state.manifest[0].id);
  } catch (error) {
    showError(`${error.message} Запускайте sandbox через локальный HTTP-сервер, а не напрямую через file://.`);
  }
}

boot();
