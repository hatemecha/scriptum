# Screenplay Document Model V1

## Status

Approved on 2026-04-04 for Day 6 of the roadmap.

## Decision

SCRIPTUM V1 stores the screenplay as a normalized JSON document with seven stable top-level sections:

- `schema`
- `document`
- `project`
- `content`
- `indexes`
- `sync`
- `extensions`

The canonical screenplay body lives only in `content`.
Scenes are represented as a derived index over the ordered blocks, not as duplicated screenplay text.

This model is intentionally designed to satisfy four constraints at once:

- store a complete screenplay in one self-contained JSON payload
- keep block editing and reordering simple
- stay extensible without redefining the entire document later
- leave space for future versioning and synchronization

## Core Principles

- The screenplay body is block-based and uses only the six V1 block types already approved.
- Block order is canonical and explicit.
- Block identity is stable and independent from array position.
- Scene representation references blocks instead of duplicating titles or paragraphs.
- Schema versioning is separate from document revision.
- Sync metadata is separate from screenplay content.
- Future features must prefer new fields or new envelopes over mutating the meaning of existing ones.

## Canonical Top-Level Shape

```json
{
  "schema": {
    "kind": "scriptum/screenplay-document",
    "version": 1,
    "minimumReaderVersion": 1,
    "blockVersion": 1,
    "sceneIndexVersion": 1,
    "syncVersion": 1
  },
  "document": {
    "id": "doc_01hrz8j9g4m6c2s1a7n5p3q4r",
    "revision": 0,
    "createdAt": "2026-04-04T00:00:00.000Z",
    "updatedAt": "2026-04-04T00:00:00.000Z",
    "lastNormalizedAt": "2026-04-04T00:00:00.000Z"
  },
  "project": {
    "id": "project_01hrz8j9g4m6c2s1a7n5p3q4s",
    "title": "Untitled Screenplay",
    "author": null,
    "description": null,
    "language": "en",
    "status": "draft",
    "createdAt": "2026-04-04T00:00:00.000Z",
    "updatedAt": "2026-04-04T00:00:00.000Z"
  },
  "content": {
    "blockOrder": [
      "blk_01hrz8j9g4m6c2s1a7n5p3q4t",
      "blk_01hrz8j9g4m6c2s1a7n5p3q4u",
      "blk_01hrz8j9g4m6c2s1a7n5p3q4v"
    ],
    "blocks": {
      "blk_01hrz8j9g4m6c2s1a7n5p3q4t": {
        "id": "blk_01hrz8j9g4m6c2s1a7n5p3q4t",
        "type": "scene-heading",
        "text": "INT. KITCHEN - NIGHT",
        "revision": 0,
        "createdAt": "2026-04-04T00:00:00.000Z",
        "updatedAt": "2026-04-04T00:00:00.000Z"
      },
      "blk_01hrz8j9g4m6c2s1a7n5p3q4u": {
        "id": "blk_01hrz8j9g4m6c2s1a7n5p3q4u",
        "type": "action",
        "text": "The kettle screams on the stove.",
        "revision": 0,
        "createdAt": "2026-04-04T00:00:00.000Z",
        "updatedAt": "2026-04-04T00:00:00.000Z"
      },
      "blk_01hrz8j9g4m6c2s1a7n5p3q4v": {
        "id": "blk_01hrz8j9g4m6c2s1a7n5p3q4v",
        "type": "character",
        "text": "MARTA",
        "revision": 0,
        "createdAt": "2026-04-04T00:00:00.000Z",
        "updatedAt": "2026-04-04T00:00:00.000Z"
      }
    }
  },
  "indexes": {
    "scenes": {
      "version": 1,
      "sceneOrder": ["scene_blk_01hrz8j9g4m6c2s1a7n5p3q4t"],
      "scenes": {
        "scene_blk_01hrz8j9g4m6c2s1a7n5p3q4t": {
          "id": "scene_blk_01hrz8j9g4m6c2s1a7n5p3q4t",
          "headingBlockId": "blk_01hrz8j9g4m6c2s1a7n5p3q4t",
          "firstBlockId": "blk_01hrz8j9g4m6c2s1a7n5p3q4t",
          "lastBlockId": "blk_01hrz8j9g4m6c2s1a7n5p3q4v",
          "ordinal": 1
        }
      },
      "unscenedBlockIds": []
    }
  },
  "sync": {
    "version": 1,
    "status": "local-only",
    "clientId": null,
    "baseRevision": null,
    "lastSyncedRevision": null,
    "lastSyncedAt": null,
    "pendingOperationIds": []
  },
  "extensions": {}
}
```

## Why This Shape

### `schema`

- Defines the document family and schema versions.
- Prevents future migrations from relying on guesswork.
- Separates structural compatibility from content revision.

### `document`

- Stores the identity and revision of the document snapshot itself.
- `revision` is the mutable content revision, not the schema version.
- `lastNormalizedAt` records when the body was last normalized for persistence or export.

### `project`

- Stores the self-contained metadata required to identify the screenplay without loading another table first.
- This metadata belongs to the project snapshot inside the document, not to the screenplay body.

### `content`

- Contains the canonical screenplay body.
- `blockOrder` is the only source of truth for document order.
- `blocks` stores block entities by id for fast local updates and future patch-based sync.

### `indexes`

- Stores derived structures that accelerate navigation without redefining the canonical screenplay body.
- V1 includes only the scene index.
- Any future outline, character, or search indexes must follow the same rule: reference content, do not replace it.

### `sync`

- Keeps synchronization state fully decoupled from writing semantics.
- Future offline queueing or cloud reconciliation can evolve here without mutating the screenplay block model.

### `extensions`

- Reserved empty object for future optional data that does not belong in the fixed V1 envelopes.
- Typical future candidates: title page payload, comments, revision marks, analytics caches, or AI-assist metadata.

## Block Structure

Each block is stored as a flat entity:

```json
{
  "id": "blk_...",
  "type": "dialogue",
  "text": "We missed the call.",
  "revision": 4,
  "createdAt": "2026-04-04T00:00:00.000Z",
  "updatedAt": "2026-04-04T00:12:41.000Z"
}
```

Rules:

- `id` is stable for the lifetime of the block.
- `type` must be one of the six approved V1 screenplay blocks.
- `text` stores the canonical raw block text for the editor model.
- `revision` tracks block-level mutation count for future granular sync or diffing.
- `createdAt` and `updatedAt` are ISO timestamps.

What V1 blocks do not store:

- no `previousBlockId`
- no `nextBlockId`
- no `sceneId`
- no visual styling metadata
- no PDF coordinates
- no speaker cache

Those fields are intentionally excluded to prevent coupling between editing, navigation, and rendering.

## Project Metadata

V1 project metadata is:

- `id`
- `title`
- `author`
- `description`
- `language`
- `status`
- `createdAt`
- `updatedAt`

Rules:

- `title` is required and user-facing.
- `author` is nullable.
- `description` is nullable.
- `language` is a document-level language hint and defaults to a simple language code such as `en`.
- `status` is a project lifecycle flag, not a writing block.

Title page fields do not belong to screenplay body blocks.
If they enter V1 later, they must live under project metadata or an extension envelope, never as fake screenplay paragraphs.

## Internal Scene Representation

Scenes are represented as a derived index:

```json
{
  "version": 1,
  "sceneOrder": ["scene_blk_abc"],
  "scenes": {
    "scene_blk_abc": {
      "id": "scene_blk_abc",
      "headingBlockId": "blk_abc",
      "firstBlockId": "blk_abc",
      "lastBlockId": "blk_xyz",
      "ordinal": 1
    }
  },
  "unscenedBlockIds": ["blk_intro"]
}
```

Rules:

- A scene exists only when a `Scene Heading` exists.
- Scene ids are deterministic and derived from the heading block id: `scene_${headingBlockId}`.
- Scene entries never duplicate heading text.
- `headingBlockId` anchors the scene to the canonical boundary.
- `firstBlockId` and `lastBlockId` define the block span using the canonical `blockOrder`.
- `ordinal` is the 1-based scene order used by navigation.
- `unscenedBlockIds` stores valid leading blocks that appear before the first `Scene Heading`.

Why `unscenedBlockIds` exists:

- V1 allows a document to start with `Action` or `Transition`.
- Those blocks are valid, but they do not become fake scenes.
- The scene index must account for them without violating the rule that scenes start only with `Scene Heading`.

## Unique Block IDs

Block ids must follow these rules:

- Generated client-side before persistence.
- Opaque and never derived from array position.
- Unique across the whole document.
- Stable through text edits and reordering.
- Replaced when duplicating or pasting blocks, so clones never reuse ids.

Recommended prefix strategy:

- `doc_` for documents
- `project_` for projects
- `blk_` for screenplay blocks
- `scene_` for scene index entries
- `op_` for future sync operations

V1 does not require a specific algorithm such as UUID or ULID, but the generator must be collision-resistant enough for offline creation.

## Logical Block Order

The logical order is defined only by `content.blockOrder`.

This is a deliberate decision.

Why arrays alone are not enough:

- Array position is unstable under inserts, deletes, and future sync rebasing.
- Updating one block inside a pure array requires rewriting the whole structure more often.

Why linked-list pointers are not used in V1:

- They add coupling and repair cost.
- They create more opportunities for inconsistent state.
- `blockOrder` plus block ids is enough for deterministic editing and scene derivation.

Rules:

- Every id in `blockOrder` must exist in `blocks`.
- Every persisted block in `blocks` must appear exactly once in `blockOrder`.
- Validation must reject duplicates, gaps, or unknown ids.

## Prepared for Future Versioning

V1 separates three kinds of versioning:

### Schema version

- Stored in `schema.version`.
- Changes only when the JSON structure itself changes.

### Envelope sub-versions

- `schema.blockVersion`
- `schema.sceneIndexVersion`
- `schema.syncVersion`

These allow future migrations to evolve one part of the document without ambiguity.

### Content revision

- Stored in `document.revision`.
- Increases when the screenplay content changes.
- Does not imply a schema migration.

This separation prevents a common mistake: using one number for both compatibility and mutation history.

## Prepared for Future Synchronization

V1 is not collaborative yet, but the document model leaves explicit space for it.

Sync envelope:

```json
{
  "version": 1,
  "status": "local-only",
  "clientId": null,
  "baseRevision": null,
  "lastSyncedRevision": null,
  "lastSyncedAt": null,
  "pendingOperationIds": []
}
```

Field intent:

- `status` tracks local, pending, synced, or conflict state.
- `clientId` identifies the writer device when sync is introduced.
- `baseRevision` anchors optimistic sync against the last acknowledged server revision.
- `lastSyncedRevision` and `lastSyncedAt` support save indicators and conflict diagnostics.
- `pendingOperationIds` allows an operation queue later without redesigning the document body.

Important boundary:

- The sync system may reference block ids and document revision.
- The screenplay block model must never depend on sync state to remain valid.

## Validation Criteria for Day 6

Day 6 is considered closed only if all of the following stay true:

- A full screenplay can be represented with the approved six block types inside `content`.
- The canonical body depends only on `blockOrder` and `blocks`.
- Scene navigation can be derived from blocks without duplicating screenplay text.
- Project metadata is kept outside screenplay body blocks.
- Block ids remain stable independently of order.
- Schema versioning and content revision are separated.
- Sync metadata is isolated from screenplay semantics.
- The model can grow later without redefining the meaning of current V1 fields.

## Reference Baseline

- `SCRIPTUM.md`
- `DESIGN.md`
- `SCREENPLAY_BLOCKS_V1.md`
- `SCREENPLAY_WRITING_RULES_V1.md`
- `SCREENPLAY_FORMAT_RULES_V1.md`
