# Screenplay Writing Rules V1

## Status

Approved on 2026-04-04 for Day 4 of the roadmap.

## Decision

SCRIPTUM V1 freezes screenplay writing behavior into a fixed rule set inspired by the fast block-jumping model of KIT Scenarist and constrained by the six-block scope defined in `SCREENPLAY_BLOCKS_V1.md`.

The goal of this document is not to describe a possible UX.
It defines the exact editor behavior that the implementation must follow in V1.

## Source Baseline and Inference

The main baseline taken from KIT Scenarist is the idea that screenplay editing is driven by:

- block-aware `Enter`
- block-aware `Tab`
- fast switching on empty lines and at the end of written lines
- automatic jump to the next screenplay block
- optional automatic jump from dialogue context to `Parenthetical`

Direct evidence used as baseline:

- KIT Scenarist repository: <https://github.com/dimkanovikov/KITScenarist>
- KIT Scenarist settings model for screenplay block jumping and block changing
- KIT Scenarist help page and comments describing the writing flow

SCRIPTUM V1 intentionally removes KIT's end-user configurability for these rules.
The behavior below is hardcoded for V1.

## Scope

These rules apply only to the six screenplay body blocks already approved for V1:

- `Scene Heading`
- `Action`
- `Character`
- `Dialogue`
- `Parenthetical`
- `Transition`

They do not define Day 5 formatting details such as uppercase normalization, parentheses insertion, alignment, indentation, page-break correction, or `(CONT'D)`.
Those rules are closed separately in `SCREENPLAY_FORMAT_RULES_V1.md`.

## Core Editing Model

### Paragraph model

- One screenplay block equals one editor paragraph.
- V1 does not support soft line breaks inside a block.
- Multi-paragraph action is represented as multiple consecutive `Action` blocks.
- Multi-paragraph dialogue is represented as multiple consecutive `Dialogue` blocks.

### Interaction contexts

- `Filled boundary`: caret collapsed at the end of a non-empty block.
- `Empty block`: block text trimmed length is `0`.
- `Inline selection`: text selection that starts or ends inside a block.
- `Block-aligned selection`: selection starts at the start of the first selected block and ends at the end of the last selected block.

### Single-line blocks

These blocks are treated as single-line semantic units in V1:

- `Scene Heading`
- `Character`
- `Parenthetical`
- `Transition`

For these blocks, `Enter` ignores the internal caret offset and behaves as if the caret were at the end of the block.
The block text is not split.

### Split-capable blocks

These blocks support paragraph splitting:

- `Action`
- `Dialogue`

If `Enter` is pressed inside the text of one of these blocks, the block is split into two blocks of the same type at the caret position.

## Closed Keyboard Rules

### `Enter` on a filled boundary

| Current block   | Result                                                            |
| --------------- | ----------------------------------------------------------------- |
| `Scene Heading` | Insert a new empty `Action` block after the current block.        |
| `Action`        | Insert a new empty `Action` block after the current block.        |
| `Character`     | Insert a new empty `Dialogue` block after the current block.      |
| `Dialogue`      | Insert a new empty `Action` block after the current block.        |
| `Parenthetical` | Insert a new empty `Dialogue` block after the current block.      |
| `Transition`    | Insert a new empty `Scene Heading` block after the current block. |

### `Tab` on a filled boundary

| Current block   | Result                                                            |
| --------------- | ----------------------------------------------------------------- |
| `Scene Heading` | Insert a new empty `Character` block after the current block.     |
| `Action`        | Insert a new empty `Character` block after the current block.     |
| `Character`     | Insert a new empty `Parenthetical` block after the current block. |
| `Dialogue`      | Insert a new empty `Character` block after the current block.     |
| `Parenthetical` | Insert a new empty `Dialogue` block after the current block.      |
| `Transition`    | Insert a new empty `Action` block after the current block.        |

### `Shift + Tab` on a filled boundary

- `Shift + Tab` does nothing on a filled boundary.
- It never inserts a new block.
- The reversal path in V1 exists only for empty blocks or full-block conversion contexts.

### `Enter` on an empty block

| Current empty block | Result                                                 |
| ------------------- | ------------------------------------------------------ |
| `Scene Heading`     | Convert the current block in place to `Action`.        |
| `Action`            | Convert the current block in place to `Character`.     |
| `Character`         | Convert the current block in place to `Dialogue`.      |
| `Dialogue`          | Convert the current block in place to `Action`.        |
| `Parenthetical`     | Convert the current block in place to `Dialogue`.      |
| `Transition`        | Convert the current block in place to `Scene Heading`. |

### `Tab` on an empty block

| Current empty block | Result                                                 |
| ------------------- | ------------------------------------------------------ |
| `Scene Heading`     | Convert the current block in place to `Character`.     |
| `Action`            | Convert the current block in place to `Character`.     |
| `Character`         | Convert the current block in place to `Parenthetical`. |
| `Dialogue`          | Convert the current block in place to `Character`.     |
| `Parenthetical`     | Convert the current block in place to `Dialogue`.      |
| `Transition`        | Convert the current block in place to `Action`.        |

### `Shift + Tab` on an empty block

| Current empty block | Result                                                 |
| ------------------- | ------------------------------------------------------ |
| `Scene Heading`     | Convert the current block in place to `Transition`.    |
| `Action`            | Convert the current block in place to `Scene Heading`. |
| `Character`         | Convert the current block in place to `Action`.        |
| `Dialogue`          | Convert the current block in place to `Character`.     |
| `Parenthetical`     | Convert the current block in place to `Character`.     |
| `Transition`        | Convert the current block in place to `Action`.        |

### Validation gate for empty-block conversion

Any in-place block conversion triggered by `Enter`, `Tab`, or `Shift + Tab` must be rejected if the new type would violate the adjacency rules defined in `SCREENPLAY_BLOCKS_V1.md`.

Examples:

- An empty `Dialogue` directly after a `Character` cannot become `Character`, because `Character -> Character` is invalid.
- An empty `Scene Heading` after `Character` cannot become `Transition`, because `Character -> Transition` is invalid.

If rejected, the block type stays unchanged and the caret stays in the same block.

## Automatic Next Block Creation

Automatic block creation in V1 is closed to these rules:

- It only happens on `Enter` or `Tab` from a filled boundary.
- It never happens on `Shift + Tab`.
- It never happens when there is an inline selection.
- It never happens on blur, focus change, or arrow navigation.
- The inserted block is always empty.
- The inserted block becomes the active block and receives the caret at offset `0`.

## Empty Block Rules

### Allowed as transient state

- An empty block is allowed only as a transient editing state.
- It may exist while the caret is inside it.

### Not allowed as persisted structure

- Empty blocks are removed during document normalization before save or export.
- If normalization removes every block in the document, the editor must leave exactly one empty `Action` block.

### Removal shortcuts

- `Backspace` on an empty block removes that block and moves the caret to the end of the previous block when one exists.
- `Delete` on an empty block removes that block and moves the caret to the start of the next block when one exists.
- If there is no previous or next block, the editor recreates one empty `Action` block.

## Deletion Between Blocks

### Backspace at block start with no selection

- If the current block is empty, remove it using the empty-block rule above.
- If the current block is non-empty, do not merge text across the block boundary.
- Instead, move the caret to the end of the previous block.

### Delete at block end with no selection

- If the current block is empty, remove it using the empty-block rule above.
- If the current block is non-empty, do not merge text across the block boundary.
- Instead, move the caret to the start of the next block.

### Why merge is forbidden in V1

- Automatic cross-block merge would require semantic repair for `Character`, `Dialogue`, and `Parenthetical`.
- KIT Scenarist itself models screenplay writing as block transitions rather than free paragraph flattening.
- V1 keeps block boundaries explicit and predictable.

## Manual Block Conversion

### Allowed conversion scope

- With a collapsed caret, convert the current block.
- With a block-aligned selection, convert every selected block.
- With an inline selection, manual conversion is rejected.

### Allowed target types

- Any of the six V1 block types may be requested.
- The conversion is applied only if the entire resulting document fragment remains valid under `SCREENPLAY_BLOCKS_V1.md`.
- If one selected block would become invalid, the whole conversion is rejected.

### Text preservation

- Manual conversion preserves block text byte-for-byte in V1.
- It does not uppercase character names.
- It does not add or remove parentheses.
- It does not add `(CONT'D)`.
- It does not trim punctuation.

Those transformations belong to Day 5 formatting rules, not Day 4.

## Paste Rules

### Structured screenplay paste

SCRIPTUM V1 reserves an internal clipboard payload:

- MIME type: `application/x-scriptum-screenplay-blocks+json`

If this payload exists and the paste target is block-aligned or a collapsed caret on a block boundary:

- paste the copied blocks with their original block types
- replace the selected blocks if a block-aligned selection exists
- reject the paste if the resulting surrounding adjacency would be invalid

If the paste target is an inline selection, ignore the structured payload and fall back to plain-text paste.

### Plain-text paste

If the clipboard does not contain the structured screenplay payload:

- normalize line endings to `\n`
- trim leading and trailing blank lines
- collapse repeated blank lines into single paragraph separators

#### Single-line plain-text paste

- If the normalized paste contains no newline, insert it into the current block text.
- If there is an inline selection, replace only the selected text.

#### Multi-line plain-text paste

- If the normalized paste contains one or more newlines, the editor treats it as block paste.
- If the current selection is inline rather than block-aligned, expand the replacement range to the full first and last intersected blocks.
- Each resulting non-empty paragraph becomes exactly one candidate block.

### Plain-text paragraph classification

Candidate paragraphs are classified in this exact order:

1. `Scene Heading`
   - if the trimmed paragraph starts with `INT.`, `EXT.`, `EST.`, `INT/EXT.`, or `I/E.`
2. `Transition`
   - if the trimmed paragraph matches a known transition (`FADE IN:`, `FADE OUT.`, `CUT TO:`, `DISSOLVE TO:`, `SMASH CUT TO:`, `MATCH CUT TO:`, `WIPE TO:`)
   - or it is uppercase and ends with `TO:`
3. `Parenthetical`
   - if the trimmed paragraph starts with `(` and ends with `)` and the previous accepted block is `Character` or `Dialogue`
4. `Character`
   - if the trimmed paragraph is uppercase
   - and length is `38` characters or less
   - and it does not end with `:`
   - and the previous accepted block allows `Character` as next block
5. `Dialogue`
   - if the previous accepted block is `Character`, `Parenthetical`, or `Dialogue`
6. `Action`
   - every remaining paragraph

### Plain-text paste normalization

After classification, pasted paragraphs are inserted and then normalized against surrounding context using deterministic repairs:

- dangling `Character` becomes `Action`
- `Dialogue` without an active preceding `Character` becomes `Action`
- invalid `Parenthetical` becomes `Action`
- invalid `Scene Heading` becomes `Action`
- invalid `Transition` becomes `Action`

No pasted paragraph is silently discarded.
If a paragraph cannot remain valid in its inferred type, its text is preserved as `Action`.

## Cut, Copy, and Paste of Multiple Blocks

### Copy

When the selection is block-aligned and spans one or more complete blocks:

- copy structured screenplay payload to the internal MIME type
- copy plain-text fallback using newline-separated block text in document order

When the selection is inline:

- copy plain text only

### Cut

- `Cut` behaves like `Copy` and then removes the selected content.
- If the removed content was block-aligned, the editor removes whole blocks.
- After removal, run the same normalization repairs described for plain-text paste.
- If the document becomes empty, leave one empty `Action` block.

### Paste

- Prefer structured screenplay payload only when the target is block-aligned or a collapsed block boundary.
- Otherwise use plain-text paste behavior.

## Multiple Selection

SCRIPTUM V1 supports only one contiguous selection range.

Explicitly out of scope for V1:

- discontiguous multi-selection
- multiple carets
- simultaneous editing in several non-adjacent blocks

### Supported selection states

- caret only
- inline selection inside one or more adjacent blocks
- block-aligned selection across adjacent blocks

### Operational consequences

- Manual block conversion requires a caret or block-aligned selection.
- Structured multi-block copy/cut requires a block-aligned selection.
- Inline selection always behaves as text selection, not block selection.

## Validation Criteria for Day 4

Day 4 is considered closed only if all of the following stay true:

- Every key rule above is deterministic by block type and context.
- Automatic next-block creation is defined without fallback intuition.
- Empty-block deletion and persistence are defined.
- Cross-block deletion does not rely on editor guesswork.
- Manual conversion has explicit acceptance and rejection rules.
- Paste behavior is closed for both internal structured payloads and external plain text.
- Multiple selection is explicitly limited to contiguous ranges only.

## Reference Baseline

- `SCRIPTUM.md`
- `DESIGN.md`
- `SCREENPLAY_BLOCKS_V1.md`
- `SCREENPLAY_FORMAT_RULES_V1.md`
- KIT Scenarist repository: <https://github.com/dimkanovikov/KITScenarist>
- KIT Scenarist help and comments: <https://kitscenarist.ru/en/help/first_glance.html>
