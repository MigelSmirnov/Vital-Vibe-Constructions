# Content Growth and Crawlability Requirements

## Status

These requirements are mandatory for the architectural refactor of the Vital Vibe Constructions website.

## Content growth

The site must support adding new page sections and content types without expanding one monolithic entrypoint.

Required content types:

- marketing page sections;
- services;
- completed projects and case studies;
- testimonials;
- frequently asked questions;
- articles;
- article categories and tags;
- company and contact information.

Each content type must have an explicit domain model and a stable public content API. UI sections consume content models; they must not own raw business content.

New homepage sections should be registered through configuration and composed by the page shell. Adding a section must not require editing unrelated sections.

Articles must have their own feature boundary and support:

- stable human-readable URLs;
- title, description, publication date, modification date, author, category, tags, and hero image;
- canonical URL;
- article-specific Open Graph metadata;
- Article or BlogPosting structured data;
- internal links to relevant services and projects;
- listing pages and article detail pages;
- inclusion in sitemap generation.

A future CMS may replace static content storage, but the UI and domain layers must depend on a provider-neutral content repository rather than directly on a CMS SDK.

## Crawler visibility

Critical public content must be available in the initial HTML response.

The architecture must not require crawlers to execute client-side JavaScript in order to discover:

- navigation links;
- headings and body content;
- service descriptions;
- project descriptions;
- article titles and article bodies;
- canonical links;
- metadata;
- structured data;
- internal links.

Preferred rendering strategy:

1. static generation for marketing pages and articles;
2. server-side rendering where content cannot be generated statically;
3. client-side hydration only for interactive features such as calculators, filters, forms, galleries, and animations.

A JavaScript-only single-page rendering strategy is not acceptable for primary indexable content.

## Semantic HTML

Public pages must use semantic document structure:

- one meaningful `h1` per page;
- ordered heading hierarchy;
- `header`, `nav`, `main`, `section`, `article`, `aside`, and `footer` where appropriate;
- real anchor elements with crawlable `href` values for navigation;
- descriptive link text;
- useful image `alt` text;
- visible text rather than essential text embedded in images or generated only through CSS.

Buttons must be used for actions. Links must be used for navigation.

## SEO infrastructure

The project must own explicit modules or build steps for:

- page metadata;
- canonical URLs;
- Open Graph and social metadata;
- Organization and LocalBusiness structured data;
- Service structured data where valid;
- Article or BlogPosting structured data for articles;
- BreadcrumbList structured data for nested pages;
- sitemap generation;
- robots.txt;
- RSS or Atom feed when articles are introduced;
- redirects for changed URLs;
- 404 behavior;
- URL normalization.

Structured data must describe content that is actually visible on the corresponding page.

## Sitemap rules

The sitemap must contain canonical public HTML pages, including:

- homepage;
- service pages;
- project or case-study pages;
- article listing pages;
- article detail pages;
- other indexable landing pages.

Utility files such as `robots.txt` and `llms.txt` are not HTML landing pages and should not be treated as priority indexable page URLs in the main sitemap.

Every generated sitemap URL must be absolute and use the canonical production origin.

## Performance and accessibility

Crawler visibility and user experience share the same performance requirements:

- avoid blocking essential content behind animations;
- reserve image dimensions to reduce layout shift;
- use responsive images and modern formats;
- lazy-load below-the-fold media, but not the primary page content;
- minimize render-blocking scripts;
- progressively enhance interactive features;
- keep the site usable with JavaScript unavailable wherever practical.

## Architectural additions

The target architecture must include these boundaries:

```text
src/
  content/
    repository/
    static/
    validation/

  features/
    articles/
      domain/
      application/
      ui/
    seo/
    sitemap/

  infrastructure/
    content/
      staticContentAdapter
      cmsContentAdapter

  pages/ or routes/
    home
    services
    projects
    articles
```

The exact framework-specific folder names may change, but the responsibilities and dependency direction must remain explicit.

## Acceptance criteria

The refactor is not complete until:

1. primary text and internal links are visible in raw page HTML;
2. every indexable page has a unique title, description, canonical URL, and semantic heading structure;
3. articles can be added without editing the homepage implementation;
4. new homepage sections can be registered without modifying unrelated section internals;
5. sitemap and robots files are generated or maintained from explicit configuration;
6. interactive features enhance server-rendered or statically generated content rather than replacing it;
7. crawler-facing output can be verified from the built HTML, not only from the browser DOM after JavaScript execution.
