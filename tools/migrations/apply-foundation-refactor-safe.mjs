#!/usr/bin/env node

import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const targetPath = path.resolve(process.cwd(), process.argv[2] ?? "index.html");
const backupPath = `${targetPath}.foundation-safe-backup`;

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
  const marker = '<meta name="viewport" content="width=device-width, initial-scale=1">';
  assertIncludes(html, marker, "Viewport marker not found.");
  return html.replace(marker, `${marker}${SEO_BLOCK}`);
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
  next = addPlannerCta(next);

  if (next === original) {
    console.log("Runtime-safe foundation refactor is already applied.");
    return;
  }

  await copyFile(targetPath, backupPath);
  await writeFile(targetPath, next, "utf8");

  console.log(`Updated ${path.relative(process.cwd(), targetPath)} without changing the x-dc document structure.`);
  console.log(`Backup: ${path.relative(process.cwd(), backupPath)}.`);
}

main().catch((error) => {
  console.error("Runtime-safe foundation refactor failed.");
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
