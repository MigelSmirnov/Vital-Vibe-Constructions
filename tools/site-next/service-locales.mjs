export const escapeServiceText = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const decode = (text) => text.replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");

function splitHash(value) {
  const index = value.indexOf("#");
  if (index < 0) return [value, ""];
  return [value.slice(0, index), value.slice(index)];
}

export function localizeServiceHtml(source, route, routes, localization, origin) {
  const language = route.language;
  const translate = (value) => escapeServiceText(localization.translate(decode(value), language));
  const home = language === "es" ? "/" : `/${language}/`;
  const localPath = (href) => {
    if (href === "/") return home;
    if (href.startsWith("/#")) return home + href.slice(1);
    const [pathname, hash] = splitHash(href);
    const sibling = routes.find((item) => item.language === language && item.source_path === pathname);
    return `${sibling?.path ?? pathname}${hash}`;
  };

  let html = source.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (_match, json) => {
    const value = JSON.parse(json, (key, item) => {
      if (typeof item !== "string") return item;
      if (["name", "description", "locationCreated", "areaServed", "serviceType", "text"].includes(key)) {
        return localization.translate(item, language);
      }
      if (["url", "item", "@id"].includes(key) && item.startsWith(origin)) {
        return origin + localPath(item.slice(origin.length));
      }
      return item;
    });
    for (const item of value["@graph"] ?? []) {
      if (item?.["@type"] === "WebPage") item.inLanguage = language;
    }
    return `<script type="application/ld+json">${JSON.stringify(value, null, 2).replaceAll("<", "\\u003c")}</script>`;
  });

  html = html.split(/(<script\b[^>]*>[\s\S]*?<\/script>|<[^>]+>)/g).map((token) => {
    if (token.startsWith("<script")) return token;
    if (!token.startsWith("<")) return token.replace(/\S[\s\S]*\S|\S/g, (text) => translate(text));
    if (token.startsWith("<html ")) return `<html lang="${language}">`;
    const textualMeta = /^<meta\b/.test(token) && /(?:name|property)="(?:description|og:title|og:description)"/.test(token);
    return token.replace(/\b(alt|aria-label|content|href)="([^"]*)"/g, (match, attr, value) => {
      if (attr === "alt" || attr === "aria-label" || (attr === "content" && textualMeta)) {
        return `${attr}="${translate(value)}"`;
      }
      if (attr === "href") {
        if (value.startsWith(origin)) return `href="${origin}${localPath(value.slice(origin.length))}"`;
        if (value.startsWith("/")) return `href="${localPath(value)}"`;
        return match;
      }
      if (attr === "content" && /property="og:url"/.test(token)) return `content="${route.canonical_url}"`;
      return match;
    });
  }).join("");

  const equivalents = routes.filter((item) => item.family_group === "service" && item.source_path === route.source_path);
  const alternates = equivalents.map((item) => `<link rel="alternate" hreflang="${item.language}" href="${item.canonical_url}">`);
  alternates.push(`<link rel="alternate" hreflang="x-default" href="${origin}${route.source_path}">`);
  const switcher = `<div class="language-switcher" aria-label="Language">${equivalents.map((item) => `<a href="${item.path}" lang="${item.language}"${item.language === language ? ' aria-current="page"' : ""}>${item.language.toUpperCase()}</a>`).join(" · ")}</div>`;

  return html
    .replace("</head>", `${alternates.join("\n")}\n</head>`)
    .replace("</nav>", `</nav>\n${switcher}`);
}

export function serviceLocaleRoutes(contract) {
  return contract.routes
    .filter((route) => ["service-detail", "service-detail-localized"].includes(route.family_id) && route.status === "generated")
    .map((route) => ({
      ...route,
      family_group: "service",
      source_path: route.language === "es" ? route.path : route.path.replace(`/${route.language}`, ""),
    }));
}
