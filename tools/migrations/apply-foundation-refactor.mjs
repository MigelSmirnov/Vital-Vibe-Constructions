#!/usr/bin/env node

import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const targetPath = path.resolve(process.cwd(), process.argv[2] ?? "index.html");
const backupPath = `${targetPath}.foundation-backup`;

const SEO_BLOCK = `
<title>Reformas integrales en Barcelona | Vital Vibe Construction</title>
<meta name="description" content="Reformas integrales, cocinas, baños, electricidad y preparación para hogar inteligente en Barcelona.">
<link rel="canonical" href="https://vitalvibeconstruction.com/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Vital Vibe Construction">
<meta property="og:title" content="Reformas integrales en Barcelona | Vital Vibe Construction">
<meta property="og:description" content="Reformas integrales, cocinas, baños, electricidad y preparación para hogar inteligente en Barcelona.">
<meta property="og:url" content="https://vitalvibeconstruction.com/">
<meta property="og:image" content="https://vitalvibeconstruction.com/proyecto-2/b8.jpeg">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Vital Vibe Construction",
  "url": "https://vitalvibeconstruction.com/",
  "logo": "https://vitalvibeconstruction.com/VVC_primary_logo.svg",
  "areaServed": {
    "@type": "City",
    "name": "Barcelona"
  },
  "sameAs": [],
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Reformas integrales en Barcelona"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Planificación eléctrica para reformas"
      }
    }
  ]
}
</script>`;

function assertIncludes(value, fragment, message) {
  if (!value.includes(fragment)) throw new Error(message);
}

function addSeo(html) {
  if (html.includes("<title>Reformas integrales en Barcelona | Vital Vibe Construction</title>")) return html;
  assertIncludes(html, '<meta name="viewport" content="width=device-width, initial-scale=1">', "Viewport marker not found.");
  return html.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<meta name="viewport" content="width=device-width, initial-scale=1">${SEO_BLOCK}`,
  );
}

function addMain(html) {
  if (html.includes('<main id="main-content">')) return html;
  const headerClose = "  </header>";
  const footerOpen = "  <footer";
  assertIncludes(html, headerClose, "Header closing tag not found.");
  assertIncludes(html, footerOpen, "Footer opening tag not found.");

  html = html.replace(headerClose, `${headerClose}\n\n  <main id="main-content">`);
  html = html.replace(footerOpen, `  </main>\n\n${footerOpen}`);
  return html;
}

function addPlannerCta(html) {
  if (html.includes('href="https://app.vitalvibeconstruction.com/manual"')) return html;
  const marker = '<a data-i18n="nav_contact" href="#contactoB"';
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) throw new Error("Navigation contact link marker not found.");

  const linkEnd = html.indexOf("</a>", markerIndex);
  if (linkEnd === -1) throw new Error("Navigation contact link closing tag not found.");
  const insertionPoint = linkEnd + 4;
  const cta = '\n        <a href="https://app.vitalvibeconstruction.com/manual" target="_blank" rel="noopener" data-app-cta="electrical-planner" style="color:#e0a33b;text-decoration:none;font-weight:700;white-space:nowrap;">Planificador <span aria-label="beta" style="font-size:10px;vertical-align:super;">BETA</span></a>';
  return `${html.slice(0, insertionPoint)}${cta}${html.slice(insertionPoint)}`;
}

async function main() {
  const original = await readFile(targetPath, "utf8");
  let next = original;

  next = addSeo(next);
  next = addMain(next);
  next = addPlannerCta(next);

  if (next === original) {
    console.log("Foundation refactor is already applied.");
    return;
  }

  await copyFile(targetPath, backupPath);
  await writeFile(targetPath, next, "utf8");

  console.log(`Updated ${path.relative(process.cwd(), targetPath)}.`);
  console.log(`Backup: ${path.relative(process.cwd(), backupPath)}.`);
  console.log("Run: node tools/content-extractor/run.mjs");
}

main().catch((error) => {
  console.error("Foundation refactor failed; index.html was not intentionally rewritten after a failed assertion.");
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
