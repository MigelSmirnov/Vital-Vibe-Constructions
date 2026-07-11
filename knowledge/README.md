# Knowledge Layer

The knowledge layer is the source model for the next website runtime.

## Boundaries

- Owns stable entities and repository access.
- Reads existing content tables through adapters.
- Exposes small APIs for builders and future UI modules.
- Does not import from `site-next`, legacy HTML, or `support.js`.

## Current Surface

- `EntityCore`
- `Service`
- `KnowledgeRepository`
- collection invariant helpers for unique entity ids and slugs
- JSON-compatible content table adapter for current `content/tables/*.yaml` files

HTML is generated from this layer, not directly from content tables.
