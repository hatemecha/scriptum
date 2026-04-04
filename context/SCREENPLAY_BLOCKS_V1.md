# Screenplay Blocks V1

## Status

Approved on 2026-04-04 for Day 3 of the roadmap.

## Decision

SCRIPTUM V1 supports exactly six screenplay body blocks:

- `Scene Heading`
- `Action`
- `Character`
- `Dialogue`
- `Parenthetical`
- `Transition`

This list is closed for V1.
Every screenplay paragraph stored in the editor must map to one and only one of these block types.
There is no free-form paragraph type and no arbitrary styling block in V1.

## Why These Six

These six blocks are enough to write a complete screenplay with professional structure while keeping the editor simple.
They also match the core screenplay model already defined in `SCRIPTUM.md` and `DESIGN.md`.

KIT Scenarist supports extra screenplay-related formats, but they are not consistently essential for the MVP and some of them belong more to outlining, reporting, annotations, or advanced layout than to the core writing flow.

## Official V1 Block List

| Block | Purpose in V1 | Allowed previous | Allowed next | Core rule |
| --- | --- | --- | --- | --- |
| `Scene Heading` | Starts a new scene and defines the scene title used by navigation | `document-start`, `action`, `dialogue`, `transition` | `action`, `character` | It is the canonical scene boundary in V1. |
| `Action` | Describes visible or audible action outside spoken dialogue | `document-start`, `scene-heading`, `action`, `dialogue`, `transition` | `action`, `character`, `scene-heading`, `transition`, `document-end` | It is the default general-purpose prose block of the screenplay body. |
| `Character` | Declares the current speaker for the dialogue that follows | `scene-heading`, `action`, `dialogue`, `transition` | `dialogue`, `parenthetical` | It cannot stand alone in a valid saved document. |
| `Dialogue` | Stores spoken lines for the most recent active character | `character`, `parenthetical`, `dialogue` | `dialogue`, `character`, `action`, `scene-heading`, `transition`, `document-end` | It always belongs to the nearest preceding `Character`. |
| `Parenthetical` | Stores a short performance or delivery cue inside a dialogue run | `character`, `dialogue` | `dialogue` | It only exists inside a character/dialogue flow. |
| `Transition` | Stores manual editorial transitions such as scene-to-scene moves | `document-start`, `action`, `dialogue` | `scene-heading`, `action`, `document-end` | It is manual, rare, and never the default next block. |

## Rules by Block

### `Scene Heading`

- Marks the beginning of a scene.
- Feeds the scene navigator and any future scene indexing.
- In V1, if a block starts a scene, it must be a `Scene Heading`.
- It may be followed directly by `Action` or `Character`.
- It is part of the printable screenplay body.

### `Action`

- Describes what is seen or heard outside spoken dialogue.
- It is the fallback block when content does not belong to dialogue flow.
- Consecutive `Action` blocks are valid.
- It may open the document when the script starts without an initial heading.
- It may precede a `Character`, a new `Scene Heading`, a `Transition`, or the document end.

### `Character`

- Declares the speaker for the dialogue run that follows.
- It is not narration and it is not metadata.
- A valid saved/exported document cannot end with a `Character` block.
- After `Character`, the next block must be `Dialogue` or `Parenthetical`.
- A new `Character` resets the active speaker.

### `Dialogue`

- Stores spoken text for the active speaker.
- The active speaker is the nearest preceding `Character` not interrupted by `Action`, `Scene Heading`, or `Transition`.
- Consecutive `Dialogue` blocks are valid and represent continued speech by the same speaker.
- A `Dialogue` block may be followed by another `Dialogue`, a new `Character`, `Action`, `Scene Heading`, `Transition`, or the document end.

### `Parenthetical`

- Stores a short cue like tone, delivery, or small action within the dialogue flow.
- It is only valid between `Character` and `Dialogue`, or between dialogue paragraphs of the same speaker.
- It is not a replacement for `Action`.
- A valid saved/exported document cannot end with `Parenthetical`.
- After `Parenthetical`, the next block must be `Dialogue`.

### `Transition`

- Stores explicit manual transitions such as `CUT TO:` or `FADE OUT.`.
- It is right-aligned in visual/export treatment, but alignment behavior is specified later with the formatting rules.
- It is optional and not part of the default automatic writing flow.
- It may appear at the beginning of the document only for opening transitions such as `FADE IN:`.
- It may appear at the end of the document only for closing transitions such as `FADE OUT.`.

## Closed Scope for V1

The following elements are explicitly out of scope for V1 as screenplay body blocks:

| Element outside V1 | Why it stays out | Temporary V1 fallback |
| --- | --- | --- |
| `Folder` | It is an outline/navigation grouping concept, not a core screenplay body block | None |
| `Scene Description` or scene notes | It belongs to outline support, not to the printable screenplay body | None |
| `Scene Characters` | It is useful for reports, but not required to write the screenplay body | Infer later from text or add in a future metadata layer |
| `Shot` | It adds directorial granularity and complexity that the MVP does not need | `Action` |
| `Title` or centered title cards | It requires special layout treatment outside the core body flow | `Action` |
| `Lyrics` | It needs special formatting and pagination rules outside the MVP | `Dialogue` |
| `Note on the text` | It is annotation, not screenplay body | Future comments/notes system |
| `Non-printable text` | It creates hidden content and export ambiguity | Future comments/notes system |
| `Dual Dialogue` | It is an advanced layout feature, not a base body block | Out of V1 with no fallback layout |
| Title page fields | They are project metadata, not editor body blocks | Project metadata |

## Validation Criteria for Day 3

Day 3 is considered closed only if all of the following remain true:

- The list of V1 screenplay blocks stays closed to these six types.
- Every body paragraph has exactly one block type from that list.
- No excluded element is silently treated as a first-class V1 block.
- Any future implementation of the editor, parser, JSON model, and PDF export uses this document as the source of truth until a later roadmap day changes it intentionally.

## Reference Baseline

- `SCRIPTUM.md`
- `DESIGN.md`
- KIT Scenarist desktop help: <https://kitscenarist.ru/en/help/first_glance.html>
- KIT Scenarist mobile help: <https://kitscenarist.ru/en/help/howto_mobile_version.html>
