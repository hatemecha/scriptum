# Screenplay Format Rules V1

## Status

Approved on 2026-04-04 for Day 5 of the roadmap.

## Decision

SCRIPTUM V1 locks screenplay formatting to one closed professional reference.

The reference is a spec-screenplay layout compatible with the standard US screenplay page model used by Final Draft-style software:

- one fixed page size
- one fixed font model
- one fixed indentation system
- one fixed uppercase policy
- one fixed pagination policy

There is no user-configurable formatting in V1.
Editor preview and PDF export must resolve to the same geometry and the same block rules.

## Source Baseline and Inference

This Day 5 specification is grounded in:

- Final Draft overview of screenplay elements and their professional placement: <https://www.finaldraft.com/learn/screenplay-formatting-elements/>
- Final Draft manual rules for dialogue breaks, `(MORE)`, `(CONT'D)`, and automatic character continueds: <https://www.finaldraft.com/downloads/manuals/fd10mac.pdf>
- Screenplay.com basic screenplay format guide for page layout, margins, Courier 12, and element indents: <https://screenplay.com/pages/basic-screenplay-format>

Inference intentionally made for SCRIPTUM V1:

- Where the industry allows slight layout variation, V1 chooses one exact value.
- V1 targets spec screenplay output, not production-script scene continueds.
- V1 treats continuation markers as render-time formatting, not as stored author text.

## Scope

These rules apply to formatting and pagination of the six approved V1 screenplay body blocks:

- `Scene Heading`
- `Action`
- `Character`
- `Dialogue`
- `Parenthetical`
- `Transition`

These rules do not add new block types.
They also do not make format user-configurable.

## Canonical Page Specification

### Page and font

- Paper size: US Letter, portrait, `8.5"` x `11"`
- Body font: `Courier Prime` 12 pt
- Fallback fonts: `Courier New`, `Courier`, `monospace`
- Horizontal density: `10` characters per inch
- Vertical density: `6` lines per inch
- Line spacing: single
- User-controlled leading: forbidden in V1

### Margins and printable body frame

- Top margin: `1"`
- Bottom margin: `1"`
- Left margin: `1.5"`
- Right margin: `1"`
- Body frame width: `6"` = `60` monospace columns
- Body frame height: `9"` = `54` text lines

### Page numbers

- Page numbers print starting on page `2`
- Page `1` is unnumbered
- Printed page number format: `2.`, `3.`, `4.`
- Alignment: flush right in the header area

## Visual Lane Matrix

All indents below are absolute positions from the left page edge.
Columns are measured inside the `60`-column body frame.

| Block           | Text case                                          | Left edge  | Width       | Columns | Alignment | Space before    |
| --------------- | -------------------------------------------------- | ---------- | ----------- | ------- | --------- | --------------- |
| `Scene Heading` | Uppercase                                          | `1.5"`     | `6.0"`      | `0-59`  | Left      | `1` blank line  |
| `Action`        | Preserve typed case                                | `1.5"`     | `6.0"`      | `0-59`  | Left      | `1` blank line  |
| `Character`     | Uppercase                                          | `3.7"`     | `3.8"`      | `22-59` | Left      | `1` blank line  |
| `Dialogue`      | Preserve typed case                                | `2.5"`     | `3.5"`      | `10-44` | Left      | `0` blank lines |
| `Parenthetical` | Preserve inner case, always wrapped in parentheses | `3.0"`     | `2.5"`      | `15-39` | Left      | `0` blank lines |
| `Transition`    | Uppercase                                          | body frame | `6.0"` lane | `0-59`  | Right     | `1` blank line  |

Rules for vertical spacing:

- `Space before` is suppressed when a block becomes the first printable block on a page.
- No block in V1 may add custom blank lines beyond the values above.
- Alignment comes from block type only, never from typed spaces or tabs.

## Exact Block Rules

### `Scene Heading`

- Displayed in uppercase.
- Starts at the left page margin.
- Uses the full body width.
- Canonical scene-start prefixes allowed in V1: `INT.`, `EXT.`, `EST.`, `INT/EXT.`, `I/E.`
- The line must remain a single semantic heading.
- Internal whitespace is collapsed to single spaces.
- If a separated dash is used between location and time, it normalizes to `space-hyphen-space`.
- It is never centered, manually padded, or right-aligned.
- Pagination rule: a `Scene Heading` cannot be orphaned at the bottom of the page.

#### Keep-with-next rule for `Scene Heading`

The heading must stay on the same page as the first renderable unit after it:

- if followed by `Action`, keep at least one rendered `Action` line with it
- if followed by a dialogue run, keep the `Character` cue and at least one following `Dialogue` line with it

If that minimum unit does not fit, move the heading to the top of the next page.

### `Character`

- Displayed in uppercase.
- Starts at `3.7"` from the left page edge.
- Uses a `3.8"` cue lane.
- Must not end with `:`
- May include one visible extension in parentheses when required by formatting:
  - `(O.S.)`
  - `(V.O.)`
  - `(O.C.)`
  - `(CONT'D)`
- `(CONT'D)` is not stored as base character text in V1; it is a derived display marker.

#### Automatic continuity rule for `Character`

Append `(CONT'D)` to the displayed cue only in these two cases:

- the same speaker resumes after an `Action` interruption inside the same scene
- the same speaker's dialogue continues on the next page after a page break

Never append `(CONT'D)` in these cases:

- across a new `Scene Heading`
- across a `Transition`
- when a different speaker intervenes

#### Keep-with-next rule for `Character`

A `Character` cue cannot be the last rendered line on a page.
It must stay with:

- at least one following `Dialogue` line
- or a `Parenthetical` immediately followed by at least one `Dialogue` line

If that minimum unit does not fit, move the cue to the next page.

### `Dialogue`

- Preserves the writer's mixed case and punctuation.
- Starts at `2.5"` from the left page edge.
- Uses a fixed `3.5"` dialogue lane.
- Consecutive `Dialogue` blocks for the same speaker stay in the same lane.
- No typed tabs or leading spaces may alter the dialogue lane.

#### Page-break rule for `Dialogue`

`Dialogue` may split across pages only at rendered line boundaries.
It must never split in the middle of a rendered line.

When dialogue breaks across pages:

- render `(MORE)` at the bottom of the first page
- align `(MORE)` inside the dialogue lane, flush right
- repeat the same `Character` cue at the top of the next page
- append `(CONT'D)` to that repeated cue
- continue the dialogue immediately below the repeated cue with no extra blank line

### `Parenthetical`

- Always rendered with outer parentheses.
- If stored text is `half awake`, display `(half awake)`.
- If stored text is already `(half awake)`, keep one clean pair of parentheses only.
- Starts at `3.0"` from the left page edge.
- Uses a fixed `2.5"` lane.
- Preserves inner mixed/lower case.
- It is never uppercased automatically unless the author typed uppercase text.

#### Keep-with-next rule for `Parenthetical`

A `Parenthetical` cannot be the last rendered line on a page.
It must stay with at least one following `Dialogue` line.

If that minimum unit does not fit, move the `Parenthetical` and the following dialogue line to the next page.

### `Transition`

- Displayed in uppercase.
- Uses the full `6"` body frame as a right-aligned lane.
- Right edge aligns with the printable body frame right edge.
- It is not padded with typed spaces.
- It is visually flush right because the renderer aligns it right, not because the writer inserts spacing.

#### Pagination rule for `Transition`

A `Transition` cannot become the first rendered line on a page.
It stays with the preceding rendered unit.

If a break would place the transition at the top of a page, move the transition to the previous page when the preceding unit still fits with it.
If that is impossible, move both the preceding unit fragment and the transition together to the next page.

## Automatic Uppercase Rules

Normalization happens on:

- block commit
- manual block conversion
- paste normalization
- save
- export

Exact uppercase policy:

- `Scene Heading`: uppercase the full line
- `Character`: uppercase the full displayed cue
- `Transition`: uppercase the full line
- `Action`: preserve typed case
- `Dialogue`: preserve typed case
- `Parenthetical`: preserve inner typed case, but enforce outer parentheses

Display-only tokens automatically generated by formatting:

- `(MORE)`
- `(CONT'D)`

Those tokens are not part of the base stored block text in V1.

## Page-Break Rules

### General

- Break only at rendered line boundaries.
- Never break in the middle of a rendered line.
- Never use blank lines as fake page breaks.
- A block that is first on a page suppresses its normal `space before`.

### Sentence protection

For `Action` and `Dialogue`, V1 protects sentence continuity at the bottom of the page:

- if the next sentence would start at the very bottom and continue onto the next page
- move that sentence start to the top of the next page instead

Sentence boundaries in V1 are detected by:

- `.`
- `?`
- `!`
- `...` when used as an ellipsis

### Block-specific page-break behavior

- `Scene Heading`: keep with its next renderable unit
- `Action`: may split across pages without continuation markers
- `Character`: keep with the minimum following dialogue unit
- `Dialogue`: may split and uses `(MORE)` plus repeated `Character (CONT'D)`
- `Parenthetical`: keep with at least one following dialogue line
- `Transition`: keep with the preceding unit and never start a page alone

### Scene continueds

Scene continuation markers such as `CONTINUED:` are disabled in V1.

Reason:

- V1 targets a clean spec-screenplay format
- scene continuation headers belong more to production script workflows than to the MVP writing experience

## Visual Continuity of the Screenplay

The screenplay must feel visually continuous in editor and export.
That means:

- the same block type always resolves to the same lane
- the same text always resolves to the same uppercase policy
- the same document geometry is used by editor preview and PDF export
- users cannot drift the format with manual spaces or tabs
- continuation markers are derived consistently at render time
- page breaks never depend on intuition or manual padding

## Functional Reference for V1

The executable source of truth for this document is:

- `src/features/screenplay/format-rules.ts`

That module contains:

- the fixed page geometry
- the fixed block lane metrics
- the automatic uppercase and parentheses rules
- the pagination and continuation rules
- validation samples that must resolve to one deterministic formatted output

## Validation Criteria for Day 5

Day 5 is considered closed only if all of the following remain true:

- Each screenplay block already approved for V1 now has an exact visual rule.
- Uppercase behavior is deterministic and no longer improvised.
- Indentation and page width are fixed.
- Pagination and continuation behavior are fixed.
- Editor preview and PDF export can rely on the same format reference.
- The format no longer depends on user intuition or manual spacing hacks.

## Reference Baseline

- `SCRIPTUM.md`
- `DESIGN.md`
- `SCREENPLAY_BLOCKS_V1.md`
- `SCREENPLAY_WRITING_RULES_V1.md`
