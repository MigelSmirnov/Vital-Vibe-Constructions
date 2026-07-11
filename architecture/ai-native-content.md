# AI-Native Discovery and Multimodal Content

## Goal

Vital Vibe Constructions must be understandable not only by people and conventional search crawlers, but also by retrieval agents, AI search systems, multimodal agents, and assistants that read public web content.

AI-native does not mean hiding content in an AI-only format. The canonical source remains accessible semantic HTML. Machine-oriented resources supplement the public pages and must stay consistent with them.

## Core requirements

1. Important facts must exist in visible semantic HTML.
2. Every important entity must have a stable canonical URL.
3. Content must be available without requiring client-side JavaScript execution.
4. Pages must expose explicit metadata and JSON-LD structured data.
5. `llms.txt` must provide a curated map of authoritative resources.
6. Images must include textual context so OCR and vision models are supplementary, not the only interpretation path.
7. Machine-facing content must never contradict the visible human-facing page.

## AI-readable content surface

The public site should expose:

- `/llms.txt` — concise curated index for language-model agents;
- `/llms-full.txt` — optional expanded text representation when the content library grows;
- `/sitemap.xml` — canonical indexable HTML URLs;
- `/robots.txt` — crawler access and sitemap location;
- `/feed.xml` or `/rss.xml` — article feed when articles are introduced;
- JSON-LD on relevant HTML pages;
- stable article, service, project, and image-detail URLs.

`llms.txt` is an experimental discovery aid, not a replacement for semantic HTML, sitemap, robots rules, or structured data.

## llms.txt maintenance

`llms.txt` must be generated or validated from the same content source as the website. It should include:

- concise company description;
- geographic service area;
- authoritative service URLs;
- project and case-study URLs;
- article index and selected article URLs;
- electrical planner URL and accurate capability description;
- contact page URL;
- image gallery or visual case-study index;
- last meaningful content update date when generation is available.

Do not list invented pages. Only publish live canonical resources.

## Agent-oriented page design

Every indexable page should make its purpose obvious near the beginning of the document:

- explicit page title and `h1`;
- concise summary paragraph;
- entity type and location where relevant;
- stable facts separated from promotional language;
- relevant dates;
- author or responsible organization;
- links to related services, projects, and articles;
- clear contact and next-action information.

Use descriptive labels rather than ambiguous UI text such as “Learn more”.

## Structured data

Use JSON-LD generated from validated domain models.

Potential entity types include:

- `Organization` and an appropriate local-business subtype;
- `Service` for real service pages;
- `Article` or `BlogPosting` for editorial content;
- `ImageObject` for important project images;
- `BreadcrumbList` for nested pages;
- `WebSite` and `WebPage` for site/page identity.

Structured data must match visible content and canonical URLs. Do not add unsupported ratings, prices, addresses, certifications, or other claims.

## Multimodal gallery

Create a future visual project library as a first-class content feature, not merely a decorative carousel.

Recommended public structure:

```text
/projects/
/projects/{project-slug}/
/projects/{project-slug}/images/{image-slug}/
/gallery/
```

Each project image record should support:

- stable ID and slug;
- canonical image page URL;
- original image URL;
- optimized responsive variants;
- descriptive `alt` text;
- visible caption;
- extended description;
- project name;
- room or area type;
- work category;
- city or service area at an appropriate privacy level;
- before/after state;
- capture or publication date when known;
- width, height, format, and content type;
- copyright or ownership information;
- related service and article URLs.

## OCR and vision-agent support

OCR may help agents interpret plans, labels, signs, measurements, and annotations contained in images. However, essential meaning must not be available only through pixels.

For images containing important text or technical information:

- provide a human-reviewed textual transcription near the image;
- preserve reading order;
- identify units and labels;
- describe diagrams and spatial relationships in prose;
- offer downloadable source documents only when publication is intentional and safe;
- exclude private customer details, addresses, phone numbers, signatures, and other sensitive information.

For before/after images:

- label which image is before and which is after in visible text;
- explain what changed;
- identify the relevant service category;
- avoid relying on filename or visual comparison alone.

## Image markup

Important images should use semantic figures:

```html
<figure>
  <img
    src="..."
    srcset="..."
    sizes="..."
    width="..."
    height="..."
    alt="Descriptive alternative text"
  >
  <figcaption>Visible project context and transformation summary.</figcaption>
</figure>
```

Decorative images use an empty `alt` value. Informational images require meaningful contextual alternative text.

## Content APIs

AI-native resources should derive from the same provider-neutral content repository as HTML pages.

Suggested application boundaries:

```text
src/features/ai-discovery/
  buildLlmsIndex
  buildExpandedLlmsContent
  validateMachineReadableContent

src/features/media-library/
  domain/
  application/
  ui/

src/features/structured-data/
  buildOrganizationSchema
  buildServiceSchema
  buildArticleSchema
  buildImageObjectSchema

src/infrastructure/content/
  staticContentAdapter
  cmsContentAdapter
```

No AI discovery module may scrape rendered UI components to reconstruct content. It must consume domain content through public APIs.

## Crawler access policy

The default public-content policy is discoverable and crawlable. `robots.txt` should not accidentally block public HTML, article assets, metadata, or important images.

Crawler policy must distinguish, when necessary, between:

- search/index discovery;
- user-initiated retrieval;
- model-training collection;
- private or administrative paths.

Any future restrictions must be intentional and documented. Public discoverability must not expose private project data or unpublished customer media.

## Trust and provenance

Agent-readable content should clearly expose:

- organization identity;
- canonical domain;
- contact information;
- publication and modification dates;
- authorship or organizational ownership;
- image provenance;
- factual service area and limitations;
- links to authoritative detail pages.

Avoid unsupported superlatives and duplicated doorway pages. AI visibility must be earned through precise, useful, consistent content.

## Validation

The build or CI process should eventually verify:

1. `llms.txt`, sitemap, canonical links, and HTML use the same production origin;
2. all machine-readable links resolve successfully;
3. structured data uses visible page facts;
4. each important image has dimensions, contextual metadata, and appropriate alt text;
5. raw HTML contains the primary page content;
6. article and project records generate both human-readable pages and machine-readable entries;
7. private or draft content never appears in public AI indexes;
8. no essential technical image depends on OCR alone.
