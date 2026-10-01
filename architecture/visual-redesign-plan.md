# Visual Redesign Plan

Status: in progress — first homepage implementation, 2026-09-08

Target: `site-next`

Branch: `agent/architecture-sandbox`

## Current implementation

The user supplied a graphite/gold homepage reference and kitchen/bathroom assets. This explicit direction supersedes the proposed warm-neutral palette below. The first implemented slice uses a split hero, service disclosures, a bathroom feature with the existing project index, and coordinated pricing/contact/footer. Existing smart-home and planner capabilities remain. Browser review and further design iterations are pending; article publication remains deferred.

## Purpose

The current `site-next` implementation establishes a strong semantic, content, routing, and knowledge-model foundation. The next phase should improve visual identity and page storytelling without weakening crawlability, accessibility, content integrity, or the build pipeline.

The goal is not to make the site more decorative. The goal is to make each section communicate its role through a distinct composition, so the final experience feels authored rather than assembled from repeated generic UI patterns.

## Core Principle

Each section must answer a new customer question and should use the visual form best suited to that question.

Avoid mapping every content collection directly to a grid of equal cards.

## Current Strengths to Preserve

- Real project photography tied to real project records.
- Concrete regional, service, pricing, and contact information.
- Honest separation between construction work and partner-delivered smart-home programming.
- Knowledge-backed content entities and generated routes.
- Semantic HTML, crawlable links, image dimensions, structured data, and canonical URLs.
- No fabricated testimonials, statistics, articles, or trust claims.
- Existing accessibility features such as landmarks, skip links, visible focus states, and meaningful alternative text.

## Current Design Risks

### Repeated section grammar

Many sections follow the same pattern:

1. eyebrow
2. heading
3. summary
4. equal-column grid

This makes services, projects, pricing, capabilities, and supporting content feel structurally interchangeable even though they serve different customer needs.

### Excessive card usage

Services, projects, renovation tiers, and service scope are all represented with visually similar bordered surfaces. Cards should remain where comparison or repeated interaction benefits from containment, but they should not be the default representation for every entity.

### Weak brand differentiation

The current dark surface, gold accent, Inter/system font stack, thin borders, and small radii are coherent but generic. If the logo and photography are removed, the visual system does not strongly identify Vital Vibe Construction or even the construction category.

### Flat hierarchy

Projects appear visually equal despite differences in quality, story depth, and commercial relevance. Data equality should not automatically produce compositional equality.

### Monotone rhythm

Uniform section padding, grid gaps, image heights, and heading structures produce technical consistency but limited narrative contrast.

### Decorative metadata

Pill tags and labels can suggest filtering or navigation. They should either become functional links/filters or be restyled as non-interactive metadata.

## Desired Brand Direction

The design should feel:

- architectural rather than SaaS-like;
- precise but not sterile;
- premium through materials and composition rather than gradients and effects;
- grounded in Barcelona, real homes, site work, and construction detail;
- technically competent without resembling a dashboard template;
- editorial enough to let project photography carry the identity.

The visual language should draw from:

- architectural plans and annotations;
- material samples and construction details;
- project documentation;
- measured typography and strong alignment;
- warm neutral surfaces derived from stone, plaster, timber, and metal;
- controlled asymmetry.

## Homepage Narrative

The homepage should answer these questions in order:

1. What does the company do, where, and for whom?
2. Why should the visitor trust the team?
3. What kinds of projects has the team completed?
4. What services can the visitor hire?
5. How does the process work?
6. What level of budget is realistic?
7. How does smart-home preparation fit into the offer?
8. What should the visitor do next?

Every section should be tested against one of these questions. Sections that answer the same question should be merged or removed.

## Proposed Homepage Changes

### 1. Hero: convert from generic campaign hero to project-led proof

Current pattern:

- full-bleed image;
- centered heading;
- eyebrow;
- summary;
- two buttons.

Proposed direction:

- use an asymmetric split or layered editorial layout;
- pair the core offer with one featured real project;
- show useful project metadata such as location, type, scope, or renovation tier;
- retain one primary conversion action;
- present the electrical planner as a secondary utility, not an equal primary CTA;
- avoid unsupported claims and invented performance metrics.

Acceptance criteria:

- the first viewport clearly states the service and Barcelona coverage;
- at least one real project detail is visible without scrolling;
- the hero remains legible without relying on a heavy image overlay;
- the primary CTA is visually unambiguous;
- mobile layout does not become a centered stack of oversized text and buttons.

### 2. Trust layer: replace generic value cards with operational proof

Use existing factual content rather than generic icon cards.

Possible proof points:

- coordinated renovation delivery;
- transparent renovation tiers;
- electrical planning support;
- partner coordination for smart-home systems;
- real project documentation;
- direct contact channels.

Preferred presentation:

- compact fact strip;
- annotated project detail;
- short operational statements;
- no generic icons unless custom and necessary.

Acceptance criteria:

- every statement is supported by repository content;
- no fake statistics, customer counts, ratings, or guarantees;
- the section does not use a three-card grid by default.

### 3. Projects: make portfolio the main visual identity

Projects are the strongest available trust asset and should receive the most expressive layout.

Proposed direction:

- choose one featured project based on media quality and story completeness;
- use an asymmetric editorial layout for the featured project;
- show the remaining projects in a secondary index;
- expose meaningful facts such as location, tier, services, and scope;
- link all project tags if they are presented as interactive controls;
- allow different image ratios where composition benefits from them.

Acceptance criteria:

- one project is visibly primary;
- project ordering is explicit in content or build logic;
- the layout does not crop all images to the same fixed height;
- project pages remain canonical and crawlable;
- the homepage does not duplicate full project-page content.

### 4. Services: replace card wall with a navigable service index

Proposed direction:

- use a numbered or typographic service list;
- pair the active or featured service with relevant media;
- keep concise descriptions;
- link only services with valid canonical pages;
- reserve cards for cases that genuinely require grouped comparison.

Acceptance criteria:

- service names remain visible and crawlable in raw HTML;
- keyboard and no-JavaScript use remain valid;
- the composition is visually distinct from the projects section;
- all descriptions come from Knowledge Repository records.

### 5. Process: introduce temporal storytelling

The process should explain how work progresses rather than display another set of cards.

Proposed direction:

- use a vertical or horizontal sequence;
- distinguish customer decisions from construction activity;
- connect steps with a timeline or measured rule;
- include only process claims that are supported by actual operations.

Candidate steps:

1. visit and initial scope;
2. proposal and budget level;
3. planning and coordination;
4. execution;
5. handover.

Acceptance criteria:

- order is explicit in data;
- the section is readable without animation;
- mobile presentation remains a clear sequence;
- no step exists only to make the count visually convenient.

### 6. Pricing: retain comparison, reduce template styling

Pricing is one area where cards may remain appropriate because users compare alternatives.

Proposed direction:

- keep the three renovation tiers;
- clarify what each price represents;
- show the approximation disclaimer prominently;
- avoid the standard SaaS pattern of one glowing recommended card;
- distinguish tiers through typography, material treatment, or layout rather than excessive badges.

Acceptance criteria:

- prices are generated from `renovation-tiers.yaml`;
- currency and unit are consistently formatted;
- disclaimer is visible and understandable;
- the featured tier does not imply unsupported popularity unless the source record supports it;
- no pricing value is duplicated manually in templates.

### 7. Smart home: present as a technical capability

This section should feel like construction coordination and infrastructure planning, not a technology-product landing page.

Proposed direction:

- use annotated imagery or a technical list tied to real installation work;
- clearly separate Vital Vibe responsibilities from partner responsibilities;
- show cable routes, electrical panels, mechanisms, lighting, or finished controls where available;
- keep the planner link as a utility CTA.

Acceptance criteria:

- partner responsibility remains explicit;
- imagery is correctly attributed to project or partner context;
- the section does not imply that Vital Vibe independently supplies or programs every system;
- capability records remain the content source.

### 8. Contact: make the final action concrete

Proposed direction:

- ask for the minimum useful information for an initial conversation;
- keep phone, email, and planner options clear;
- state Barcelona coverage;
- avoid repeating multiple equivalent CTAs across the preceding sections.

Acceptance criteria:

- contact details are generated from the contact entity;
- links use correct `tel:` and `mailto:` values;
- there is one dominant final action;
- the section remains usable with JavaScript disabled.

## Typography Plan

### Objectives

- establish a recognisable editorial voice;
- reduce the impression of a generic component library;
- make hierarchy depend on scale, measure, weight, and spacing rather than repeated eyebrow labels;
- improve long-form reading on service and project pages.

### Actions

- evaluate a display/text pairing or a more distinctive single family with suitable Spanish characters;
- define explicit tokens for display, section heading, body, metadata, captions, and utility labels;
- define maximum text measures for hero, summaries, project narratives, and FAQs;
- remove uppercase eyebrow labels from sections where the heading already provides enough context;
- establish consistent paragraph spacing and heading margins;
- test long Spanish headings and mobile wrapping.

Acceptance criteria:

- typography works with system fallback fonts;
- no heading depends on manual line breaks;
- line length remains readable across breakpoints;
- hierarchy remains clear in grayscale screenshots;
- font loading does not block meaningful content rendering.

## Layout and Rhythm Plan

### Actions

- replace one universal section spacing value with a small semantic spacing scale;
- define `compact`, `standard`, and `feature` section rhythms;
- allow different composition templates for proof, index, comparison, process, and conversion sections;
- avoid using the same three-column grid in consecutive sections;
- allow intentional image-ratio variation;
- use borders and surfaces selectively rather than around every content group.

Acceptance criteria:

- no two consecutive homepage sections share the same heading-plus-three-card composition;
- mobile order follows reading and decision priority;
- spacing tokens are documented and reused;
- content remains stable when descriptions become longer.

## Component Rules

### Cards

Use a card when at least one of these is true:

- the item is independently clickable;
- the item needs containment for comparison;
- the item has repeated internal structure that benefits scanning;
- the surface communicates a real state or grouping.

Do not use a card only because the content comes from an array.

### Eyebrows

Use an eyebrow only when it adds context not already expressed by the heading.

Do not require an eyebrow in every section component.

### Tags

- linked tags must navigate or filter;
- non-interactive tags must not look like controls;
- service relationships can be represented as plain metadata where interaction is absent.

### Icons

- do not add generic icon sets to decorate service cards;
- use custom diagrams, annotations, or material details when graphics improve understanding;
- omit graphics when they do not add information.

### Animation

- animation must explain hierarchy, state, or sequence;
- content must remain complete without animation;
- avoid universal scroll-reveal effects;
- respect `prefers-reduced-motion`.

## Data and Architecture Changes

The redesign should stay knowledge-driven. Avoid hard-coding presentation decisions directly into generated HTML when they belong in content or view-model configuration.

Potential additions:

- `featured` and `position` fields for projects;
- optional project facts such as area, duration, property type, and scope when verified;
- process-step entity and table;
- optional display variant fields for homepage sections, constrained to a documented enum;
- media roles such as `hero`, `featured`, `detail`, and `process`;
- explicit distinction between interactive tags and plain metadata.

Do not add fields merely to control arbitrary CSS. Content fields should describe editorial meaning.

## Implementation Phases

### Phase 1: establish narrative and tokens

- approve homepage question order;
- define typography tokens;
- define color/material tokens;
- define semantic spacing scale;
- document card, eyebrow, tag, and animation rules;
- select a featured project based on real media quality.

Deliverable:

- design tokens and updated homepage content/view model without major visual implementation.

### Phase 2: redesign proof-heavy sections

- hero;
- trust layer;
- featured projects;
- project index.

Reason:

These sections establish brand identity and credibility. They should set the system before lower-priority sections are restyled.

### Phase 3: redesign decision sections

- services index;
- process;
- pricing;
- smart-home capability;
- contact.

### Phase 4: propagate to detail pages

- project detail pages;
- service detail pages;
- gallery;
- article sandbox only after credible article content exists.

### Phase 5: validation and cleanup

- responsive visual review;
- keyboard and focus review;
- reduced-motion review;
- raw HTML/crawlability review;
- structured-data validation;
- image loading and layout-shift review;
- remove obsolete CSS and unused component variants.

## Validation Checklist

### Content integrity

- [ ] No fabricated testimonials, statistics, client logos, awards, or claims.
- [ ] All prices come from one canonical source.
- [ ] All contact details come from one canonical source.
- [ ] Partner responsibilities remain clear.
- [ ] Project facts are sourced and verified.

### Visual identity

- [ ] The brand remains recognisable when UI chrome is removed.
- [ ] Project photography drives the visual identity.
- [ ] At least three distinct section composition types appear on the homepage.
- [ ] Consecutive sections do not repeat the same grid pattern.
- [ ] Decorative elements have an informational purpose.

### Usability

- [ ] Primary action is clear in the first viewport.
- [ ] Navigation remains usable on small screens.
- [ ] Interactive tags look and behave interactively.
- [ ] Non-interactive metadata does not resemble controls.
- [ ] Long Spanish content does not break layouts.

### Technical quality

- [ ] Generated pages remain valid semantic HTML.
- [ ] Canonical routes and sitemap remain correct.
- [ ] JSON-LD remains aligned with knowledge records.
- [ ] No content is hidden behind JavaScript-only rendering.
- [ ] Images retain dimensions and useful alternative text.
- [ ] Core pages pass repository validation scripts.

## Definition of Done

The redesign is complete when:

1. the homepage has a clear customer-decision narrative;
2. projects act as the primary visual proof;
3. services, projects, process, pricing, and smart-home content use distinct compositions;
4. repeated cards and eyebrow labels are reduced to intentional cases;
5. the visual system has identifiable architectural and material character;
6. all visible claims remain grounded in repository content;
7. generated routes, SEO assets, accessibility, and no-JavaScript readability remain intact;
8. responsive layouts have been reviewed with real Spanish content rather than placeholder text.

## Recommended First Implementation Slice

Start with the homepage hero and featured-project section.

This slice should:

- add an explicit featured-project choice;
- expose verified project metadata;
- redesign the hero around a real project;
- introduce the first typography and spacing tokens;
- remove the generic centered hero composition;
- preserve current canonical URLs, structured data, and crawlable content.

This creates a visible brand improvement while testing the new editorial system on a limited surface area before it is propagated across the site.
