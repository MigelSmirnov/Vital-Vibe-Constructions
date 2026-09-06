const requestedArticle = new URLSearchParams(window.location.search).get('article');

if (requestedArticle) {
  const draftList = document.querySelector('#draftList');
  const articlePreview = document.querySelector('#articlePreview');
  let activated = false;

  const activateRequestedArticle = () => {
    if (activated || !draftList) return false;
    const button = [...draftList.querySelectorAll('[data-draft-id]')]
      .find((item) => item.dataset.draftId === requestedArticle);
    if (!button) return false;
    activated = true;
    button.click();
    return true;
  };

  const observer = new MutationObserver(() => {
    if (activated) return;
    const initialPreviewReady = Boolean(articlePreview?.querySelector('.article-site-shell, .sheet, article'));
    if (initialPreviewReady && activateRequestedArticle()) observer.disconnect();
  });

  if (articlePreview) observer.observe(articlePreview, { childList: true, subtree: true });

  window.setTimeout(() => {
    activateRequestedArticle();
    observer.disconnect();
  }, 1200);
}
