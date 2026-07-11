# Content Tables Decision

## Current Decision

Keep `content/tables/*.yaml` JSON-compatible for now.

The files keep the `.yaml` extension because they are architecture-owned content tables, but the current adapter parses them with `JSON.parse`. This avoids adding a runtime dependency while the records remain simple objects and arrays.

## Rationale

- Current tables already use JSON-compatible syntax.
- The build pipeline has no package manifest or dependency install step.
- The knowledge layer needs stable records more than YAML-specific syntax.
- Adding a YAML parser before nested references, comments, anchors, or multiline content are needed would increase surface area without changing behavior.

## Change Trigger

Introduce a real YAML parser only when content tables need YAML-specific features that JSON-compatible syntax cannot represent cleanly, such as multiline prose, comments that must live beside records, anchors, or richer authoring ergonomics.

When that happens, the parser belongs inside `knowledge/adapters/content-tables.mjs`; builders and entities must continue using `KnowledgeRepository`.
