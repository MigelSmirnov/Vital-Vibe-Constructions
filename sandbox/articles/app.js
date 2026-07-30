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

function renderBlocks(blocks = []) {
  return blocks.map((block) => {
    switch (block.type) {
      case 'paragraph':
        return `<p>${escapeHtml(block.text)}</p>`;
      case 'list':
        return `<ul>${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
      case 'quote':
        return `<blockquote><p>${escapeHtml(block.text)}</p></blockquote>`;
      case 'image':
        return `<figure><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" width="${Number(block.width) || 1200}" height="${Number(block.height) || 800}" loading="lazy"><figcaption>${escapeHtml(block.caption || '')}</figcaption></figure>`;
      default:
        return `<p><em>Неподдерживаемый блок: ${escapeHtml(block.type)}</em></p>`;
    }
  }).join('');
}

function renderArticle(draft) {
  const sections = draft.sections.map((section) => `
    <section>
      <h2>${escapeHtml(section.heading)}</h2>
      ${renderBlocks(section.blocks)}
    </section>
  `).join('');

  const faq = draft.faq?.length ? `
    <section>
      <h2>Preguntas frecuentes</h2>
      ${draft.faq.map((item) => `
        <div class="faq-item">
          <h3>${escapeHtml(item.question)}</h3>
          <p>${escapeHtml(item.answer)}</p>
        </div>
      `).join('')}
    </section>
  ` : '';

  elements.articlePreview.innerHTML = `
    <p class="article-kicker">${escapeHtml(draft.category || 'Artículo')}</p>
    <h1>${escapeHtml(draft.h1)}</h1>
    <p class="article-meta">${escapeHtml(draft.author || 'Vital Vibe Construction')} · ${escapeHtml(draft.updated_at || 'Sin fecha')}</p>
    <p class="article-lead">${escapeHtml(draft.introduction)}</p>
    ${sections}
    ${faq}
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
