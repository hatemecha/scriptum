# Day 12 Visual States Specification

## Status

Approved on 2026-04-04 for Day 12 of the roadmap.

## Objective

Define every visual state the user can encounter so that no screen leaves the user guessing. Each state specifies where it appears, what it shows, and how it behaves. States are part of the design, not afterthoughts.

Reference: DESIGN.md section 14, SCREENS_DAY11.md cross-screen patterns.

---

## Design Rules for States

1. The state must never leave the user guessing what is happening.
2. Messages must explain what is happening and what the user can do.
3. Persistent indicators (guardando, sincronizado) must be visible but discrete.
4. Offline mode must give tranquility, not alarm.
5. Color is never the only indicator; text always accompanies color changes.
6. States must not break the layout or shift content unexpectedly.

---

## State 1: Empty

### Purpose

Show that a section has no content yet and guide the user to take the first action.

### Where it appears

| Location | Trigger | Content |
|---|---|---|
| Projects list | User has zero projects | Illustration area + heading + CTA |
| Editor canvas | New project, no blocks written | Cursor ready in empty Action block |
| Scene sidebar | No Scene Heading blocks exist | Short guidance text |
| Settings sections | No data to show (edge case) | Inline message |

### Specification

#### Projects list empty state

```
+--------------------------------------------------+
|                                                  |
|         Todavia no tienes proyectos              |
|                                                  |
|     Crea tu primer guion para empezar.           |
|                                                  |
|           [Crear proyecto]                        |
|                                                  |
+--------------------------------------------------+
```

- Position: centered vertically and horizontally in the content area below the page header.
- Heading: "Todavia no tienes proyectos" (20px, foreground).
- Description: "Crea tu primer guion para empezar." (14px, muted).
- Button: "Crear proyecto" (accent, same style as header "+ Nuevo proyecto").
- Spacing: 8px between heading and description, 24px between description and button.
- No illustration or icon. Text only.

#### Editor canvas empty state

- The canvas starts with a single empty Action block.
- The cursor is placed automatically inside this block, ready to type.
- No placeholder text inside the block. The block is simply empty.
- The block type indicator (if implemented) shows "Action".
- This is not a special "empty state screen"; it is the normal editor with no content.

#### Scene sidebar empty state

- Text: "Sin escenas todavia" (13px, muted, italic).
- Position: centered in the sidebar list area, below the header.
- Subtext: "Escribe un encabezado de escena para empezar." (12px, muted).
- No button. Writing in the canvas is the action.

#### General empty sections

- Pattern: muted text explaining what goes here and how to populate it.
- Never leave a section completely blank with no explanation.

---

## State 2: Loading

### Purpose

Show that content is being fetched. Maintain layout stability so the page does not jump when data arrives.

### Where it appears

| Location | Trigger | Pattern |
|---|---|---|
| Projects list | Initial page load | Skeleton rows |
| Editor | Loading project snapshot | Centered loading text |
| Settings | Loading profile data | Skeleton fields |
| Route transitions | Navigating between routes | Skeleton matching target layout |

### Specification

#### Projects list loading

```
+--------------------------------------------------+
|                                                  |
|   Tus proyectos                [+ Nuevo proyecto]|
|                                                  |
|   ████████████████████            ██████████     |
|   ████████████████████            ██████████     |
|   ████████████████████            ██████████     |
|                                                  |
+--------------------------------------------------+
```

- Show 3 skeleton rows matching project card dimensions.
- Skeleton bars: background token with subtle pulse animation (opacity 0.5 to 0.8, 1.5s ease-in-out, infinite).
- Each row has two skeleton elements: title-width bar (left) + timestamp-width bar (right).
- Same max-width and padding as real project list.
- The page header (title + button) renders immediately; only the list area shows skeletons.

#### Editor loading

```
+-----+--------------------------------------------+
|     |                                            |
| S   |                                            |
| K   |                                            |
| E   |          Cargando...                       |
| L   |                                            |
| E   |                                            |
| T   |                                            |
| O   |                                            |
| N   |                                            |
+-----+--------------------------------------------+
```

- Sidebar: shows skeleton items (3 bars matching scene item height).
- Canvas: centered text "Cargando..." (16px, muted). No spinner. No animation.
- Editor header renders immediately with project title as skeleton bar.
- Transition: once loaded, skeleton is replaced instantly (no fade).

#### Settings loading

- Each section shows skeleton bars matching field positions.
- Section titles render immediately.
- Fields show skeleton bars where input values will appear.

#### Skeleton design rules

- Skeleton color: `background` token (#f4efe8) for bars on `surface`/`paper` backgrounds.
- Animation: gentle opacity pulse. No shimmer/sweep effect. Subtle.
- Shape: same border-radius as the element they represent.
- Duration: skeletons should be visible for at least 200ms to avoid flicker. If data loads faster, delay skeleton removal to 200ms minimum.

---

## State 3: Error

### Purpose

Tell the user something went wrong, explain what happened, and offer a path to recover.

### Where it appears

| Location | Trigger | Severity |
|---|---|---|
| Route level | Page data fails to load | Critical |
| Editor save | Autosave fails | Recoverable |
| Auth forms | Login/register fails | Field-level |
| Export modal | PDF generation fails | Recoverable |
| Global | Unhandled render crash | Critical |

### Specification

#### Route-level error

```
+----------------------------------------------------------+
|                                                          |
|                                                          |
|              Algo salio mal                               |
|                                                          |
|     No pudimos cargar esta pagina.                       |
|     Intenta recargar o vuelve al inicio.                 |
|                                                          |
|              [Reintentar]    [Ir al inicio]              |
|                                                          |
|                                                          |
+----------------------------------------------------------+
```

- Position: centered in the route content area. Replaces normal content.
- Heading: "Algo salio mal" (24px, foreground).
- Description: context-specific (14px, muted). Examples:
  - Project list: "No pudimos cargar tus proyectos."
  - Editor: "No pudimos cargar este proyecto."
  - Settings: "No pudimos cargar tus ajustes."
- Followed by: "Intenta recargar o vuelve al inicio." (14px, muted).
- Primary action: "Reintentar" (accent button). Reloads the current route.
- Secondary action: "Ir al inicio" (muted text link). Navigates to `/projects`.
- No icon. No error code. No technical details.
- This maps to Next.js `error.tsx` segment boundaries.

#### Global error

- Used by `global-error.tsx` when the app shell itself crashes.
- Same visual pattern but full-page centered, no navigation visible.
- Heading: "Algo salio mal"
- Description: "La aplicacion encontro un error inesperado."
- Action: "Recargar pagina" (accent button). Triggers full page reload.

#### Field-level errors (forms)

- Appear below the failing input field.
- Color: danger (#a23d3d).
- Size: 13px.
- Spacing: 4px below the input.
- The input border also changes to danger color.
- Messages are specific:
  - "Este campo es obligatorio."
  - "Correo o contrasena incorrectos."
  - "Este correo ya esta registrado."
  - "La contrasena debe tener al menos 8 caracteres."
- Only show errors after submission attempt or after the field loses focus (not while typing).

#### Save error (editor)

- Appears in the editor header status area.
- Text: "Error al guardar" (12-14px, danger color).
- The indicator persists until the next successful save or manual retry.
- No modal, no toast, no blocking overlay. Just the status text change.
- If the error persists after 3 autosave attempts, show a toast: "No se pudo guardar. Tus cambios estan en el navegador." (warning).

#### Export error

- Appears inside the export modal.
- Message below the export button: "No se pudo generar el PDF. Intenta de nuevo." (14px, danger).
- The export button returns to its active state for retry.
- No modal close. The user can retry or close manually.

---

## State 4: Offline

### Purpose

Let the user know they lost connection while reassuring them that their work is safe.

### Where it appears

| Location | Trigger | Behavior |
|---|---|---|
| Editor | Network lost | Banner + status update |
| Dashboard | Network lost | Banner |
| Any route | Network lost | Banner at top |

### Specification

#### Offline banner

```
+----------------------------------------------------------+
| ! Sin conexion — Tus cambios se guardan localmente.      |
+----------------------------------------------------------+
| [normal page content continues below]                    |
```

- Position: top of the page, above the navigation bar. Pushes content down.
- Background: warning (#9a6a1d) at 10% opacity, or surface with warning left border (4px).
- Text: "Sin conexion — Tus cambios se guardan localmente." (14px, foreground).
- Icon: none. The text is clear enough.
- Height: 36-40px. Padding: 8px 16px.
- Dismissable: no. It stays until connection is restored.
- When connection returns: the banner disappears. A toast confirms: "Conexion restaurada." (success, 3s auto-dismiss).

#### Editor behavior while offline

- Status area in header changes to: "Sin conexion" (warning color).
- The user can continue writing normally. All changes stay in the browser.
- Autosave attempts are queued. On reconnection, queued saves are processed.
- No blocking modals, no disabled editing, no panic messaging.

#### Dashboard behavior while offline

- The banner appears.
- The project list may be stale. Show existing cached data if available.
- If no cached data: show the loading skeleton with text "Esperando conexion..." instead of "Cargando...".
- Creating a new project while offline: not supported in MVP. The "+ Nuevo proyecto" button is disabled (muted, cursor not-allowed). Tooltip or title attribute: "Necesitas conexion para crear un proyecto."

---

## State 5: Saving

### Purpose

Show the user that their work is being persisted. Must be visible but must not interrupt writing.

### Where it appears

| Location | Trigger |
|---|---|
| Editor header status area | Autosave triggered after debounce |
| Settings | Profile name save |

### Specification

#### Editor save indicator

Lives in the editor header center zone.

**States cycle:**

| Visual state | Text | Color | Duration |
|---|---|---|---|
| Idle (no changes) | "Guardado" | muted | Persistent |
| Saving | "Guardando..." | muted | While request is in-flight |
| Saved | "Guardado" | success, then fades to muted | success for 2s, then muted |
| Error | "Error al guardar" | danger | Until resolved |

- Text size: 12-14px.
- No spinner, no icon. Text only.
- The transition from "Guardando..." to "Guardado" should feel instant. No elaborate animation.
- The success color (#2f6b4f) on "Guardado" is a brief confirmation that fades to muted after 2 seconds (opacity transition, 0.5s ease).

#### Settings save feedback

- When the user saves their name: the "Guardar" button shows "Guardando..." (disabled), then on success triggers a toast: "Cambios guardados" (success, 3s auto-dismiss).
- On error: inline message below the field (danger). "No se pudieron guardar los cambios."

---

## State 6: Synced

### Purpose

Confirm that the local state matches the persisted state. The user's work is safe.

### Where it appears

| Location | Trigger |
|---|---|
| Editor header status area | After successful save |
| Reconnection | After queued saves complete |

### Specification

#### Editor synced state

- This is the default resting state of the save indicator.
- Text: "Guardado" (12-14px, muted).
- No icon, no badge, no timestamp.
- This is the quietest possible state. It should barely be noticeable. The absence of noise IS the confirmation.

#### Post-reconnection sync

- After coming back online, queued saves are processed.
- During processing: "Sincronizando..." (muted).
- On completion: "Guardado" (success for 2s, then muted). Same pattern as normal save.
- If sync fails: "Error al sincronizar" (danger). Persists until retry succeeds.

---

## State 7: Exporting

### Purpose

Show progress while the PDF is being generated. Prevent double-clicks. Give clear feedback on completion.

### Where it appears

| Location | Trigger |
|---|---|
| Export modal | User clicks "Exportar PDF" |

### Specification

#### Export states (within modal)

**State A: Ready to export (default)**

```
+------------------------+
|   Exportar guion       |
|                        |
|   Titulo: Mi guion     |
|   Autor:  Juan Perez   |
|   Escenas: 12          |
|   Paginas: ~24         |
|                        |
|   [Exportar PDF]       |
|            [Cancelar]  |
+------------------------+
```

- As specified in SCREENS_DAY11.md Screen 8.

**State B: Exporting**

```
+------------------------+
|   Exportar guion       |
|                        |
|   Titulo: Mi guion     |
|   Autor:  Juan Perez   |
|   Escenas: 12          |
|   Paginas: ~24         |
|                        |
|   [Exportando...]      |
|            [Cancelar]  |
+------------------------+
```

- Button text changes to "Exportando..." (accent background at 60% opacity, white text).
- Button is disabled (no pointer events).
- No progress bar. The export should be fast enough that a simple disabled state suffices.
- Cancel link remains active. Clicking it aborts the export and returns to State A.

**State C: Export complete**

```
+------------------------+
|   Exportar guion       |
|                        |
|   Tu PDF esta listo.   |
|                        |
|   [Descargar PDF]      |
|            [Cerrar]    |
+------------------------+
```

- Summary section is replaced with: "Tu PDF esta listo." (16px, success color).
- Primary button changes to "Descargar PDF" (success background, white text).
- If browser auto-downloaded: the button is a fallback. Text above: "Si la descarga no inicio automaticamente:"
- Secondary action changes to "Cerrar" (muted text link). Closes modal.

**State D: Export error**

```
+------------------------+
|   Exportar guion       |
|                        |
|   Titulo: Mi guion     |
|   Autor:  Juan Perez   |
|   Escenas: 12          |
|   Paginas: ~24         |
|                        |
|   No se pudo generar   |
|   el PDF. Intenta de   |
|   nuevo.               |
|                        |
|   [Reintentar]         |
|            [Cancelar]  |
+------------------------+
```

- Error message appears between summary and button (14px, danger).
- Button text changes to "Reintentar" (accent style, active).
- Cancel remains available.

---

## Toast Notifications

Toasts are used for transient confirmations, not for critical messages or primary validation.

### Design

- Position: bottom-center of the viewport, 24px from bottom edge.
- Background: surface with subtle shadow.
- Border-left: 4px solid, color varies by type.
- Padding: 12px 16px.
- Border-radius: 8px.
- Max-width: 400px.
- Text: 14px, foreground.
- Auto-dismiss: 3 seconds for success, 5 seconds for warning/error.
- Manual dismiss: small "x" button (muted, right side). Optional in MVP.
- Animation: slide up + fade in (150ms), slide down + fade out (150ms) on dismiss.
- Stacking: max 3 visible. New toasts push older ones up. Oldest dismissed first.

### Toast types

| Type | Border color | Use case |
|---|---|---|
| success | success (#2f6b4f) | "Cambios guardados", "Conexion restaurada" |
| warning | warning (#9a6a1d) | "No se pudo guardar. Tus cambios estan en el navegador." |
| error | danger (#a23d3d) | Transient errors that do not need inline display |
| info | accent (#284c7a) | System messages (future use) |

### When to use toasts vs inline

- **Toast:** transient confirmations (saved, exported, reconnected), non-blocking warnings.
- **Inline:** validation errors, persistent states (save error in header), empty states.
- **Never toast:** primary form validation, critical errors, states that require action.

---

## State Inventory by Screen

| Screen | Empty | Loading | Error | Offline | Saving | Synced | Exporting |
|---|---|---|---|---|---|---|---|
| Landing | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| Login | n/a | Button loading | Field + form errors | Banner | n/a | n/a | n/a |
| Register | n/a | Button loading | Field + form errors | Banner | n/a | n/a | n/a |
| Projects list | Zero projects | Skeleton rows | Route error | Banner + stale data | n/a | n/a | n/a |
| Editor | Empty Action block | Skeleton + centered text | Header status + route error | Banner + header status | Header indicator | Header indicator | n/a |
| Scene sidebar | "Sin escenas" text | Skeleton bars | Follows editor | Follows editor | n/a | n/a | n/a |
| Settings | n/a | Skeleton fields | Route error + inline | Banner | Button + toast | Toast | n/a |
| Export modal | n/a | n/a | Inline in modal | Disabled export | n/a | n/a | All 4 states |

---

## Closure

Day 12 is considered closed with these decisions:

- all 7 required visual states are specified with exact content, color, and placement,
- every screen has a documented state inventory,
- toast notification design and usage rules are defined,
- skeleton loading patterns use consistent animation and dimensions,
- error handling is layered: field-level, route-level, and global,
- offline mode reassures without blocking the writing flow,
- save/sync indicators are minimal text in the editor header,
- export modal has 4 clear states with transitions between them,
- no critical UX state is missing from the specification.
