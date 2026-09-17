// Translates the controlled HTML emitted by build-projects, never arbitrary HTML.
// Attributes are handled separately so content cannot rewrite routes or image paths.
export const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const decode = text => text.replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');

export function localizeProjectHtml(source, route, siblings, localization, origin) {
  const language = route.language;
  const translate = value => escape(localization.translate(decode(value), language));
  const home = language === 'es' ? '/' : `/${language}/`;
  const localPath = href => {
    if (href === '/' || href.startsWith('/#')) return home + href.slice(1);
    const sibling = siblings.find(item => item.language === language && item.source_path === href);
    return sibling?.path ?? href;
  };
  let html = source.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (_, json) => {
    const value = JSON.parse(json, (key, value) => {
      if (typeof value !== 'string') return value;
      if (['name', 'description', 'locationCreated'].includes(key)) return localization.translate(value, language);
      if (key === 'url' && value.startsWith(origin)) return origin + localPath(value.slice(origin.length));
      return value;
    });
    value.inLanguage = language;
    return `<script type="application/ld+json">${JSON.stringify(value, null, 2).replaceAll('<', '\\u003c')}</script>`;
  });
  html = html.split(/(<script\b[^>]*>[\s\S]*?<\/script>|<[^>]+>)/g).map(token => {
    if (token.startsWith('<script')) return token;
    if (!token.startsWith('<')) return token.replace(/\S[\s\S]*\S|\S/g, text => translate(text));
    if (token.startsWith('<html ')) return `<html lang="${language}">`;
    const textualMeta = /^<meta\b/.test(token) && /(?:name|property)="(?:description|og:title|og:description)"/.test(token);
    return token.replace(/\b(alt|aria-label|content|href)="([^"]*)"/g, (match, attr, value) => {
      if (attr === 'alt' || attr === 'aria-label' || (attr === 'content' && textualMeta)) return `${attr}="${translate(value)}"`;
      if (attr === 'href') {
        if (value.startsWith(origin)) return `href="${origin}${localPath(value.slice(origin.length))}"`;
        return `href="${localPath(value)}"`;
      }
      if (attr === 'content' && /property="og:url"/.test(token)) return `content="${route.canonical_url}"`;
      return match;
    });
  }).join('');
  const equivalents = siblings.filter(item => item.source_path === route.source_path);
  const alternates = equivalents.map(item => `<link rel="alternate" hreflang="${item.language}" href="${item.canonical_url}">`);
  alternates.push(`<link rel="alternate" hreflang="x-default" href="${origin}${route.source_path}">`);
  const switcher = `<div class="language-switcher" aria-label="Language">${equivalents.map(item => `<a href="${item.path}" lang="${item.language}"${item.language === language ? ' aria-current="page"' : ''}>${item.language.toUpperCase()}</a>`).join(' · ')}</div>`;
  return html.replace('</head>', `${alternates.join('\n')}\n</head>`).replace('</nav>', `</nav>\n${switcher}`);
}

export function projectLocaleRoutes(contract) {
  return contract.routes.filter(route => ['projects-index', 'project-detail', 'projects-index-localized', 'project-detail-localized'].includes(route.family_id) && route.status === 'generated').map(route => ({ ...route, source_path: route.language === 'es' ? route.path : route.path.replace(`/${route.language}`, '') }));
}
