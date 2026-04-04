# Day 11 Screens Specification

## Status

Approved on 2026-04-04 for Day 11 of the roadmap.

## Objective

Define the layout, content hierarchy, zones, and behavior of every main screen so that the visual experience is decided before implementation begins. Every screen aligns with routes from Day 8, data from Day 9, tokens from DESIGN.md, and the screenplay model from Days 3-6.

## Design Principles Applied

- Paper-first aesthetic: warm, luminous, minimal.
- The editor is the center of the product; all other screens serve it.
- Keyboard-first, low visual density.
- States (empty, loading, error) are part of the design, not afterthoughts.
- No decorative elements, cinema iconography, or heavy chrome.

## Color and Typography Reference

Tokens from DESIGN.md apply everywhere:

- `background` (#f4efe8): app-wide body.
- `surface` (#fbf8f4): cards, panels, elevated containers.
- `paper` (#fffdf9): editor canvas, form containers on public pages.
- `foreground` (#1c1a18): primary text.
- `muted` (#6a645c): secondary text, metadata, placeholders.
- `accent` (#284c7a): links, primary buttons, active states.
- `success` (#2f6b4f): saved, synced, exported confirmations.
- `warning` (#9a6a1d): attention states, soft warnings.
- `danger` (#a23d3d): errors, destructive actions.
- `border-subtle` (#d8d1c8): minimal separators when spacing alone is not enough.

Typography:

- UI: clean sans-serif (system stack or Inter).
- Editor canvas: Courier Prime 12pt.
- Titles: sans-serif, sobrio, no decorative.

Spacing rhythm: 4, 8, 12, 16, 24, 32, 48 px.

---

## Screen 1: Landing

**Route:** `/` (public layout)

### Purpose

Communicate what SCRIPTUM is and convert visitors to registration. One screen, no scroll maze.

### Layout

```
+----------------------------------------------------------+
| Nav: Logo (left)          Login | Register (right)       |
+----------------------------------------------------------+
|                                                          |
|                     Hero Section                         |
|          Headline + sub-headline + CTA button            |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|                   Value Section                          |
|       3 columns: format | export | simplicity            |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|                   Editor Preview                         |
|     Static screenshot or illustration of the editor      |
|                                                          |
+----------------------------------------------------------+
|                     Footer                               |
|            Copyright + minimal links                     |
+----------------------------------------------------------+
```

### Zones

#### Navigation bar

- Logo: text-only "SCRIPTUM" in foreground, no icon. Links to `/`.
- Right side: "Iniciar sesion" (text link, muted) + "Crear cuenta" (primary button, accent).
- Height: 48-56px. Background: transparent or background token.
- Sticky: no. The landing is short enough that fixed nav adds noise.

#### Hero section

- Headline: one sentence, max 8 words. Example: "Escribe guiones con formato profesional."
- Sub-headline: one sentence clarifying the value. Example: "Editor limpio, formato automatico, exportacion PDF."
- CTA: primary button "Empezar gratis". Links to `/register`.
- Text: foreground. Sub-headline: muted.
- Alignment: centered.
- Vertical padding: 48-64px top, 32-48px bottom.

#### Value section

- 3 items in a row (stacked on mobile).
- Each item: small heading (16px, foreground) + one-line description (14px, muted).
- Items:
  1. "Formato profesional" - "Tu guion sigue el estandar sin que tengas que pensar en ello."
  2. "Exporta a PDF" - "Descarga tu guion listo para enviar."
  3. "Sin friccion" - "Abre, escribe, exporta. Nada mas."
- No icons. Text only. Clean.
- Padding: 32px vertical.

#### Editor preview

- A static image or stylized representation of the editor screen.
- Centered, max-width 720px.
- Subtle border-subtle border or shadow to separate from background.
- This section is optional for initial implementation; a simple placeholder is acceptable.

#### Footer

- One line: "(c) 2026 SCRIPTUM" centered, muted text, 14px.
- Padding: 24px vertical.

### Behavior

- No animations, no parallax, no scroll-triggered reveals.
- Responsive: on mobile, value items stack vertically, hero text shrinks slightly.
- If the user is already authenticated, nav shows "Mis proyectos" link instead of login/register.

---

## Screen 2: Login

**Route:** `/login` (public layout)

### Purpose

Authenticate an existing user with minimal friction.

### Layout

```
+----------------------------------------------------------+
| Nav: Logo (left)               Register link (right)     |
+----------------------------------------------------------+
|                                                          |
|                  +------------------+                    |
|                  |   Login Card     |                    |
|                  |                  |                    |
|                  |  Email input     |                    |
|                  |  Password input  |                    |
|                  |  [Iniciar sesion]|                    |
|                  |                  |                    |
|                  |  Forgot password |                    |
|                  |  No account? Reg |                    |
|                  +------------------+                    |
|                                                          |
+----------------------------------------------------------+
```

### Zones

#### Navigation bar

- Same structure as landing nav.
- Right side: "Crear cuenta" text link (accent).

#### Login card

- Background: paper token.
- Max-width: 400px. Centered horizontally and vertically in the available space.
- Border-radius: 8px. Optional subtle shadow or border-subtle.
- Padding: 32px.

#### Card content

- Title: "Inicia sesion" (20px, foreground, left-aligned).
- Spacing after title: 24px.
- Email field:
  - Label: "Correo electronico" (14px, foreground).
  - Input: full width, 40px height, border-subtle border, paper background.
  - Placeholder: "tu@correo.com" (muted).
- Password field:
  - Label: "Contrasena" (14px, foreground).
  - Input: full width, 40px height, type password.
  - No show/hide toggle in MVP.
- Spacing between fields: 16px.
- Submit button: "Iniciar sesion", full width, accent background, white text, 40px height.
- Spacing after button: 16px.
- Secondary links (14px, muted, centered):
  - "Olvidaste tu contrasena?" (links to future recovery flow, disabled in MVP).
  - "No tienes cuenta? Crear cuenta" where "Crear cuenta" is accent link to `/register`.

### Error states

- Invalid credentials: inline message below submit button, danger color. "Correo o contrasena incorrectos."
- Empty fields: inline under each field. "Este campo es obligatorio."
- Network error: inline below submit button, danger. "No se pudo conectar. Intenta de nuevo."

### Behavior

- Submit on Enter key from password field.
- Button shows loading state (disabled + "Iniciando sesion..." text) during request.
- On success: redirect to `/projects`.

---

## Screen 3: Register

**Route:** `/register` (public layout)

### Purpose

Create a new account with minimum required data.

### Layout

Identical structure to login. Same card, same centering.

```
+----------------------------------------------------------+
| Nav: Logo (left)               Login link (right)        |
+----------------------------------------------------------+
|                                                          |
|                  +------------------+                    |
|                  |  Register Card   |                    |
|                  |                  |                    |
|                  |  Name input      |                    |
|                  |  Email input     |                    |
|                  |  Password input  |                    |
|                  |  [Crear cuenta]  |                    |
|                  |                  |                    |
|                  |  Have account?   |                    |
|                  +------------------+                    |
|                                                          |
+----------------------------------------------------------+
```

### Card content

- Title: "Crea tu cuenta" (20px, foreground).
- Fields:
  - Name: label "Nombre", placeholder "Como quieres que te llamemos". Optional but shown.
  - Email: same as login.
  - Password: label "Contrasena", placeholder empty. Min 8 characters.
- Submit button: "Crear cuenta", full width, accent.
- Secondary link: "Ya tienes cuenta? Iniciar sesion" where "Iniciar sesion" links to `/login`.

### Error states

- Email already registered: "Este correo ya esta registrado."
- Password too short: "La contrasena debe tener al menos 8 caracteres."
- Empty required fields: "Este campo es obligatorio."
- Network error: same pattern as login.

### Behavior

- Submit on Enter from last field.
- Button loading state during request.
- On success: redirect to `/projects`.

---

## Screen 4: Dashboard / Projects List

**Route:** `/projects` (authenticated > dashboard layout)

### Purpose

Show all user projects and allow creating new ones. This is the "home" after login.

### Layout

```
+----------------------------------------------------------+
| Dashboard Nav: Logo | Projects  Settings | User avatar   |
+----------------------------------------------------------+
|                                                          |
|   Heading: "Tus proyectos"         [+ Nuevo proyecto]   |
|                                                          |
|   +--------------------------------------------------+  |
|   |  Project Card         Last edited: hace 2h       |  |
|   +--------------------------------------------------+  |
|   |  Project Card         Last edited: ayer           |  |
|   +--------------------------------------------------+  |
|   |  Project Card         Last edited: 3 abr 2026    |  |
|   +--------------------------------------------------+  |
|                                                          |
+----------------------------------------------------------+
```

### Zones

#### Dashboard navigation

- Left: "SCRIPTUM" logo text, links to `/projects`.
- Center-left: "Proyectos" (active indicator, foreground) | "Ajustes" (muted, links to `/settings`).
- Right: user display name or email initial in a 32px circle (accent background, white text). No dropdown in MVP; clicking goes to `/settings`.
- Height: 48-56px. Background: surface. Bottom border: border-subtle.

#### Page header

- Left: "Tus proyectos" (24px, foreground).
- Right: "+ Nuevo proyecto" primary button (accent).
- Vertical padding: 24px.
- Max-width: 720px centered, or left-aligned with 48px left padding.

#### Project list

- Each project is a row/card:
  - Background: paper on hover, transparent default.
  - Height: 56-64px.
  - Left: project title (16px, foreground). Below or right: author name if set (14px, muted).
  - Right: last edited relative timestamp (14px, muted). Example: "hace 2 horas", "ayer", "3 abr 2026".
  - Click: navigates to `/projects/[projectId]`.
  - Separator: border-subtle 1px between items, or spacing only.
- Sorted by `last_edited_at` descending (most recent first).
- Max-width matches page header.

#### Empty state

When user has zero projects:

- Centered vertically in content area.
- Heading: "Todavia no tienes proyectos" (20px, foreground).
- Sub-text: "Crea tu primer guion para empezar." (14px, muted).
- Button: "Crear proyecto" (accent, same style as header button).

### Behavior

- "+ Nuevo proyecto" opens inline creation or navigates directly to a new project.
  - **Preferred MVP flow:** clicking the button creates a project with default title "Sin titulo" and immediately navigates to `/projects/[newId]`. No modal, no extra step.
- Project title is editable from within the editor, not from the list.
- No drag reorder. Sort is automatic by last edited.
- No pagination in MVP; list shows all projects. If list exceeds viewport, native scroll.

### Project actions (future)

- Context menu or swipe actions for rename/archive/delete are not required for Day 11.
- Noted here for awareness: these will be designed alongside Day 17 (project management).

---

## Screen 5: Editor

**Route:** `/projects/[projectId]` (authenticated > editor layout)

### Purpose

The core of the product. Where the user writes the screenplay. Every pixel must serve writing.

### Layout

```
+----------------------------------------------------------+
| Editor Header                                            |
| Title (editable) | Status | [Export]                     |
+-----+----------------------------------------------------+
|     |                                                    |
| S   |                                                    |
| C   |           Writing Canvas                           |
| E   |                                                    |
| N   |     INT. COFFEE SHOP - DAY                         |
| E   |                                                    |
| S   |     Sarah enters. She looks around.                |
|     |                                                    |
| B   |                    SARAH                            |
| A   |          Is anyone here?                            |
| R   |                                                    |
|     |                                                    |
+-----+----------------------------------------------------+
| Status bar (optional)                                    |
+----------------------------------------------------------+
```

### Zones

#### Editor header

- Height: 40-48px. Background: surface. Bottom border: border-subtle.
- Left zone:
  - Back arrow or "SCRIPTUM" logo: links to `/projects`. Small (16px icon or text).
  - Project title: inline editable text. 16px, foreground. Click to edit, blur to save. No input chrome until focused.
- Center zone:
  - Save status indicator: small text (12-14px, muted).
    - "Guardado" (success color, fades to muted after 2s).
    - "Guardando..." (muted, with subtle pulse or no animation).
    - "Sin guardar" (warning).
    - "Error al guardar" (danger).
- Right zone:
  - "Exportar" button: secondary style (outlined or ghost), accent text, no fill. Opens export modal.
  - Optional: settings icon (gear) linking to `/settings`. Only if space allows.
- The header must be visually recessive. It should not compete with the canvas.

#### Scene sidebar

- **See Screen 7 for full specification.**
- Width: 220-260px. Background: surface. Right border: border-subtle.
- Position: left side of the editor.
- Collapsible: toggle button at the top of the sidebar or via keyboard shortcut.
- When collapsed: sidebar disappears, canvas expands to full width.
- Default state: expanded on desktop, collapsed on narrow viewports.

#### Writing canvas

- The most important element in the entire product.
- Background: paper token.
- Max-width: 660px (matching 6" body width at screen resolution).
- Centered horizontally in the remaining space after sidebar.
- Vertical padding: 48px top, generous bottom (allow writing "into whitespace").
- Font: Courier Prime, 12pt equivalent for screen (approximately 16px for readability; exact size to be tuned during implementation).
- The canvas must feel like a clean sheet of paper.
- No visible block handles, toolbars, or type labels while typing.
- Block type indication: subtle and non-intrusive. Options (decide during implementation):
  - A faint label to the left of the current block, visible only on the focused block.
  - Or no label at all; the formatting (indentation, uppercase) already communicates the type.
- Cursor: standard text cursor, visible, blinking.
- Block formatting follows SCREENPLAY_FORMAT_RULES_V1.md exactly:
  - Scene Heading: left-aligned, full uppercase, 1 blank line before.
  - Action: left-aligned, 1 blank line before.
  - Character: indented to column 22, uppercase, 1 blank line before.
  - Dialogue: indented to column 10, width 35 chars.
  - Parenthetical: indented to column 15, width 25 chars, parentheses enforced.
  - Transition: right-aligned, uppercase, 1 blank line before.

#### Status bar (optional)

- Height: 24-28px. Background: surface or background. Top border: border-subtle.
- Content (all in muted, 12px):
  - Left: current block type (e.g., "Action", "Dialogue").
  - Right: page estimate or scene count.
- This bar is low priority. It can be omitted in initial implementation and added later.
- It must never distract from writing.

### Behavior

- The editor page loads the latest snapshot for the project.
- If no snapshot exists (new project), the canvas starts with a single empty Action block with cursor focused.
- Autosave triggers after a debounced pause (e.g., 2 seconds of inactivity). Indicator updates accordingly.
- All keyboard rules from SCREENPLAY_WRITING_RULES_V1.md apply.
- No undo/redo UI buttons. Standard Ctrl+Z / Ctrl+Y handled by Lexical.
- No formatting toolbar. Block type is controlled via keyboard (Enter/Tab/Shift+Tab) per writing rules.

---

## Screen 6: Scene Sidebar (detail)

**Route:** Part of `/projects/[projectId]` editor layout.

### Purpose

Let the writer see the structure of the screenplay and jump between scenes quickly.

### Layout

```
+-----------------------------+
| Scenes           [collapse] |
+-----------------------------+
| 1. INT. COFFEE SHOP - DAY  |
| 2. EXT. PARK - NIGHT       |  <-- active (highlighted)
| 3. INT. OFFICE - DAY       |
| 4. EXT. STREET - MORNING   |
|                             |
|                             |
+-----------------------------+
```

### Zones

#### Sidebar header

- Text: "Escenas" (14px, foreground, semibold).
- Right: collapse button (small icon, muted). Toggles sidebar visibility.
- Padding: 12px horizontal, 12px vertical.
- Bottom border: border-subtle.

#### Scene list

- Each item:
  - Text: scene heading text, truncated with ellipsis if too long.
  - Format: "{ordinal}. {heading text}" (14px, foreground).
  - Padding: 8px horizontal, 6-8px vertical.
  - Active scene (where the cursor is): paper background + accent left border (3px) or accent text.
  - Hover: paper background.
  - Click: scrolls the canvas to that scene heading.
- The list is derived from `Scene Heading` blocks in blockOrder. It updates in real time as the user adds or removes scene headings.
- If no scenes exist: show muted text "Sin escenas todavia" centered in the list area.

### Behavior

- Active scene tracking: as the user moves the cursor through the document, the sidebar highlights the scene that contains the current block.
- Scroll sync: if the document is long, the sidebar list itself scrolls to keep the active scene visible.
- Keyboard shortcut to toggle sidebar: to be defined during implementation (suggestion: Ctrl+\).
- The sidebar never steals focus from the editor canvas.

---

## Screen 7: Settings

**Route:** `/settings` (authenticated > dashboard layout)

### Purpose

Minimal account management. Not a power-user config panel.

### Layout

```
+----------------------------------------------------------+
| Dashboard Nav: Logo | Projects  Settings | User avatar   |
+----------------------------------------------------------+
|                                                          |
|   Heading: "Ajustes"                                     |
|                                                          |
|   +--------------------------------------------------+  |
|   | Perfil                                            |  |
|   |                                                   |  |
|   |  Nombre:    [___________________]  [Guardar]      |  |
|   |  Correo:    usuario@correo.com  (read-only)       |  |
|   +--------------------------------------------------+  |
|                                                          |
|   +--------------------------------------------------+  |
|   | Cuenta                                            |  |
|   |                                                   |  |
|   |  Plan:      Free                                  |  |
|   |  [Cerrar sesion]                                  |  |
|   +--------------------------------------------------+  |
|                                                          |
+----------------------------------------------------------+
```

### Zones

#### Dashboard navigation

- Same as projects list screen. "Ajustes" is now the active tab.

#### Page header

- "Ajustes" (24px, foreground).
- Max-width: 600px, same alignment as projects list.

#### Profile section

- Section title: "Perfil" (16px, foreground, semibold).
- Name field: editable, same input style as login. Save button next to it (secondary style).
- Email: displayed as read-only text (14px, muted). Not editable in MVP.
- Spacing: 16px between fields.
- Card-like container: paper background, 24px padding, border-subtle or none.

#### Account section

- Section title: "Cuenta" (16px, foreground, semibold).
- Plan display: "Plan: Free" (14px, foreground). Future premium users see "Plan: Premium" + management link.
- "Cerrar sesion" button: danger ghost style (danger text, no fill). On click: logs out and redirects to `/`.
- Same card styling as profile section.
- Spacing between sections: 24px.

### Behavior

- Name update: save button is disabled until the field changes. Shows "Guardado" toast on success.
- Password change: not in MVP V1. Placeholder text "Para cambiar tu contrasena, usa la opcion de recuperacion." (muted, 14px). This can be added later.
- No dark mode toggle, no editor preferences, no notification settings in MVP.

---

## Screen 8: Export Modal

**Route:** Overlay on `/projects/[projectId]`.

### Purpose

Allow the user to export the current screenplay as a professional PDF with one click.

### Layout

```
+----------------------------------------------------------+
|                                                          |
|              +------------------------+                  |
|              |   Exportar guion       |                  |
|              |                        |                  |
|              |   Titulo: Mi guion     |                  |
|              |   Autor:  Juan Perez   |                  |
|              |   Escenas: 12          |                  |
|              |   Paginas: ~24         |                  |
|              |                        |                  |
|              |   [Exportar PDF]       |                  |
|              |            [Cancelar]  |                  |
|              +------------------------+                  |
|                                                          |
+----------------------------------------------------------+
```

### Zones

#### Backdrop

- Semi-transparent overlay: foreground at 30-40% opacity.
- Click outside the modal: closes it.
- Escape key: closes it.

#### Modal card

- Background: paper. Border-radius: 12px. Shadow: subtle elevation.
- Max-width: 440px. Centered.
- Padding: 32px.

#### Modal content

- Title: "Exportar guion" (20px, foreground).
- Summary section (16px spacing between lines, all 14px):
  - "Titulo: {project.title}" (foreground).
  - "Autor: {project.author}" (foreground). If empty: "Autor: Sin definir" (muted).
  - "Escenas: {count}" (muted).
  - "Paginas: ~{estimate}" (muted). Approximate page count derived from block count / lines-per-page.
- Spacing after summary: 24px.
- Primary action: "Exportar PDF" button, full width or auto, accent style.
- Secondary action: "Cancelar" text link or ghost button, muted, below or to the right of primary.

### States

#### Default

- Shows summary + export button.

#### Exporting

- Button changes to "Exportando..." with disabled state.
- Optional: subtle progress indicator (indeterminate bar or spinner inside the button).

#### Success

- Button area replaced with: "PDF listo" (success color) + "Descargar" link/button.
- The file download should trigger automatically; the "Descargar" link is a fallback.
- Modal can be closed after download.

#### Error

- Message below button: "No se pudo generar el PDF. Intenta de nuevo." (danger).
- Button returns to active state for retry.

### Behavior

- Opens when user clicks "Exportar" in the editor header.
- The modal reads project metadata and document stats to populate the summary.
- Export generates a PDF following SCREENPLAY_FORMAT_RULES_V1.md.
- No format options in MVP (no "choose paper size", no "include title page" toggles). One format, one output.
- Focus is trapped inside the modal while open (accessibility).

---

## Cross-Screen Patterns

### Loading states

- Route transitions: skeleton placeholder matching the target layout structure.
- Projects list loading: 3-4 skeleton rows (gray bars on surface background).
- Editor loading: empty canvas with centered "Cargando..." (muted).
- Skeletons should use the same max-width and padding as real content.

### Error states

- Route-level errors: centered message with retry button.
- Template: icon-free. Heading: "Algo salio mal" (20px, foreground). Description: context-specific (14px, muted). Button: "Reintentar" (accent).

### Transitions

- No page transition animations in MVP.
- Modal open/close: simple opacity transition (150-200ms).
- Sidebar collapse/expand: simple width transition (150-200ms).

### Responsive behavior

- Breakpoint approach: single breakpoint is sufficient for MVP.
  - >= 768px: full layout (sidebar visible, cards side by side on landing).
  - < 768px: sidebar collapsed by default, value items stacked, cards full width.
- The editor canvas max-width stays constant; it is already narrower than most viewports.
- On very narrow screens, the canvas loses horizontal padding but keeps its character-width constraint.

### Accessibility

- All interactive elements reachable via Tab.
- Visible focus rings: accent color outline (2px offset).
- Form fields have associated labels (not just placeholders).
- Modal has role="dialog", aria-modal="true", focus trap.
- Color is never the only indicator of state; text accompanies color changes.
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text.

---

## Screen Map Summary

| Screen           | Route                   | Layout          | Key elements                                      |
| ---------------- | ----------------------- | --------------- | ------------------------------------------------- |
| Landing          | `/`                     | Public          | Hero + value props + CTA                          |
| Login            | `/login`                | Public          | Centered card with email/password                 |
| Register         | `/register`             | Public          | Centered card with name/email/password            |
| Projects list    | `/projects`             | Dashboard       | Project rows sorted by last edited + create button|
| Editor           | `/projects/[projectId]` | Editor          | Header + sidebar + canvas                         |
| Scene sidebar    | (part of editor)        | Editor          | Ordered scene list with active tracking           |
| Settings         | `/settings`             | Dashboard       | Profile section + account section                 |
| Export modal     | (overlay on editor)     | Editor (modal)  | Summary + one-click PDF export                    |

## Closure

Day 11 is considered closed with these decisions:

- all MVP screens are specified with layout, zones, and content hierarchy,
- every screen maps to a route defined in Day 8,
- visual tokens from DESIGN.md are applied consistently,
- the editor screen is prioritized as the product center,
- the scene sidebar is specified as a collapsible, real-time scene list,
- empty, loading, and error states are addressed,
- responsive behavior is defined with a single breakpoint approach,
- accessibility requirements are documented,
- no implementation details are prescribed beyond what the design requires.
