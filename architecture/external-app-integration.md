# External Application Integration

## Purpose

The marketing website must provide a clear, configurable path to the working application hosted at:

`https://app.vitalvibeconstruction.com/manual`

The application is currently usable but still in testing. The website must communicate that status honestly without making the CTA feel broken or hidden.

## CTA requirements

The primary application CTA should:

- use a real anchor element with a crawlable `href`;
- point to the canonical application URL from centralized configuration;
- use descriptive text such as `Open electrical planner` or `Try the electrical planner`;
- include a short visible status label such as `Beta` or `Testing version`;
- be accessible from the main navigation and at least one relevant content section;
- remain usable without JavaScript;
- include accessible focus styles and a clear external-destination indication when appropriate;
- avoid misleading claims about production readiness.

Recommended placements:

1. header/navigation CTA;
2. hero or planner-introduction section;
3. footer or tools section;
4. relevant service and article pages.

## Configuration

The URL and status must not be duplicated in components.

Suggested configuration shape:

```ts
export const EXTERNAL_APPS = {
  electricalPlanner: {
    url: "https://app.vitalvibeconstruction.com/manual",
    status: "beta",
    label: "Open electrical planner",
  },
} as const;
```

Future URL changes should require editing one configuration entry only.

## SEO and AI-native visibility

The planner link must appear in raw HTML and machine-readable content where relevant.

Update these resources from the shared configuration/content model:

- homepage HTML;
- relevant service pages;
- `llms.txt`;
- future `llms-full.txt`;
- sitemap only if the application URL is intentionally treated as an external linked product page rather than a page owned by the website sitemap;
- structured data using a truthful relationship such as a related software application when enough public application metadata exists.

Do not place the external application URL in the website sitemap merely to advertise it. A sitemap should normally contain canonical URLs owned by that sitemap's host.

## Tracking

Clicks may be measured through the analytics adapter using a stable event such as:

```text
external_app_opened
```

Suggested properties:

- `app_id`: `electrical-planner`;
- `placement`: `header`, `hero`, `service-page`, `article`, or `footer`;
- `status`: `beta`.

Tracking must not block navigation.

## Resilience

The website remains independently useful if the application is temporarily unavailable. Core service descriptions, contact information, and planning guidance must stay on the website rather than being delegated entirely to the external application.

## Acceptance criteria

1. the CTA URL is centralized;
2. the link is present in initial HTML;
3. users can identify that the application is in beta/testing;
4. the CTA works without JavaScript;
5. navigation is not blocked by analytics;
6. AI-readable resources describe the planner consistently;
7. changing the application URL does not require editing multiple UI components.
