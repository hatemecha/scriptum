# Design Standard (UI System) — Scriptum

Este documento define el **estándar de diseño** (colores, tipografía, espaciado, radios, sombras, estados e interacción) que se debe seguir **a rajatabla** para mantener consistencia en todo el proyecto.

- **Dirección de producto / north star**: ver `agent/DESIGN.md` (define “qué se siente” y “por qué”).
- **Source of truth de tokens implementados**: `src/styles/globals.css` (define “con qué se construye”).

Si este archivo y el CSS discrepan, **se actualiza el CSS y luego se ajusta este doc** para reflejar el estado real.

---

## 1. Regla de oro (consistencia > creatividad)

Antes de inventar un estilo nuevo, verificá en este orden:

1. ¿Existe un token en `src/styles/globals.css`?
2. ¿Existe un patrón ya usado (componentes / módulos CSS existentes)?
3. ¿Se puede resolver con composición y spacing sin agregar “un nuevo look”?

Si la respuesta es “no” a todo: recién ahí se propone un token/patrón nuevo y se implementa **de manera global** (no por componente aislado).

---

## 2. Tokens: lo único permitido para colores, tipografías y espaciado

### 2.1 Colores (usar variables, nunca hex sueltos en features)

**Prohibido**: hardcodear `#...`, `rgb(...)`, `hsl(...)` dentro de CSS Modules o componentes (salvo assets/ilustraciones muy puntuales).

**Permitido**: usar variables CSS definidas en `src/styles/globals.css`.

**Excepciones explícitas**:

- **PDF / export renderers**: se permiten colores “físicos” por especificación (ej. `rgb(0,0,0)` en `pdf-lib`) porque no son UI CSS.
- **Masks CSS (`mask-image`, `-webkit-mask-image`)**: usar tokens funcionales (`--mask-ink`, `--mask-ink-fade`) en vez de hardcodear `#000`/`rgba(...)`.

**Tokens base (light/dark)**:

- **Fondos / superficies**
  - `--color-background`
  - `--color-surface`
  - `--color-surface-strong`
  - `--color-surface-overlay`
  - `--color-surface-overlay-strong`
  - `--color-paper`
  - `--color-paper-border`
  - `--color-paper-surface`
- **Texto**
  - `--color-foreground`
  - `--color-fg-muted`
  - `--color-placeholder`
- **Bordes**
  - `--color-border-subtle`
  - `--color-overlay-border`
  - `--color-overlay-border-strong`
- **Acento / marca**
  - `--color-accent`
  - `--color-accent-strong`
  - `--color-accent-soft`
  - `--color-accent-soft-strong`
- **Semánticos**
  - `--color-success`, `--color-success-soft`
  - `--color-warning`, `--color-warning-soft`
  - `--color-danger`, `--color-danger-soft`
- **Focus / accesibilidad**
  - `--color-focus-ring`
  - `--color-focus-shadow`

**Reglas de uso**:

- **Texto principal**: `--color-foreground`
- **Texto secundario / metadata**: `--color-fg-muted`
- **Separadores**: `--color-overlay-border` o `--color-overlay-border-strong` (no inventar grises)
- **CTA primario**: `--control-primary-`* o `--color-accent*` según el patrón existente
- **Éxito/advertencia/error**: solo tokens semánticos (no “verde/amarillo/rojo” libres)

### 2.2 Tipografía (UI vs guion)

**UI**:

- **Familia**: `--font-ui`
- **Regla**: la UI debe leerse “sobria y moderna”, no literaria.

**Editor/guion**:

- **Familia**: `--font-script`
- **Regla**: el guion debe sentirse formato profesional; no se cambia por “estética”.

**Reglas de tamaño y jerarquía**:

- Base: `html { font-size: 16px; }`
- Preferir jerarquía por **peso, espaciado y color** antes que por tamaños extremos.
- Evitar interletraje exagerado salvo patrones ya existentes (ej. labels “eyebrow”/kicker).

### 2.3 Espaciado (ritmo único)

**Prohibido**: valores arbitrarios como `13px`, `22px`, `37px` en features.

**Permitido**: usar `--space-`*:

- `--space-1` (4px)
- `--space-2` (8px)
- `--space-3` (12px)
- `--space-4` (16px)
- `--space-5` (24px)
- `--space-6` (32px)
- `--space-7` (48px)
- `--space-8` (64px)

**Reglas rápidas**:

- Gap dentro de un card/panel: `--space-4` o `--space-5`
- Padding de panel grande: `--space-5`
- Densidad: por defecto **baja** (que “respire”), especialmente alrededor del editor.

---

## 3. Radio, sombras, motion y bordes

### 3.1 Radios (usar tokens)

Usar solamente:

- `--radius-sm`
- `--radius-md`
- `--radius-lg`

### 3.2 Sombras (usar tokens)

Usar solamente:

- `--shadow-subtle`
- `--shadow-soft`

### 3.3 Transiciones (no animación gratuita)

Usar:

- `--transition-base`

**Reglas**:

- Animar solo propiedades seguras/esperadas: `opacity`, `transform`, `box-shadow`, `background`.
- Evitar animar layout (width/height/left/top) salvo necesidad real.

### 3.4 Bordes (mínimos, funcionales)

Regla: si un borde no aporta claridad, **no va**. Preferir separación por espaciado + contraste sutil.

---

## 4. Componentes: patrón antes que variante nueva

Regla: antes de crear un componente nuevo, buscá si ya existe en `src/components/ui` o si hay un patrón equivalente en `globals.css` (ej. `.ui-button`, `.ui-input`, `.ui-modal`, `.toast`).

### 4.1 Botones

**Variantes permitidas (conceptuales)**:

- **Primary**: acción principal de la vista (1 por pantalla, idealmente)
- **Secondary**: acción alternativa
- **Ghost**: acción de baja jerarquía
- **Danger**: acciones destructivas

**Estados obligatorios**:

- hover
- focus-visible (respetar `--color-focus-ring`)
- disabled
- loading (si aplica)

### 4.2 Inputs

**Reglas**:

- Los errores usan `--color-danger` / `--color-danger-soft` (no inventar estilos)
- Placeholder usa `--color-placeholder`
- Focus consistente: `--color-focus-shadow` + borde con token

### 4.3 Modales y overlays

**Regla**: modales solo para acciones puntuales (exportar, confirmar, editar algo corto). Flujos largos → pantalla/panel.

Backdrop: `--color-backdrop` (no crear otros).

### 4.4 Feedback (toasts/estados)

**Regla**: feedback confirma sin interrumpir. Nada de “banners” agresivos por defecto.

---

## 5. Layout y densidad (especialmente en el editor)

### 5.1 Prioridades de layout

- **Texto manda**
- Herramientas en segundo plano
- Navegación acompaña (sidebar colapsable en pantallas chicas)

### 5.2 Medidas editoriales

- El editor debe mantener una estética **paper-first** y estable.
- El “lienzo” y superficies deben usar los tokens de `paper` / `surface` ya definidos.

---

## 6. Accesibilidad (no negociable)

Obligatorio en componentes interactivos:

- `:focus-visible` claramente visible (ya hay base en `globals.css`)
- Contraste correcto usando los tokens (evitar “muted” demasiado tenue en acciones)
- Navegación por teclado completa en flows críticos (editor, navegación, auth)

---

## 7. Reglas de implementación (para que no se rompa el estándar)

### 7.1 Prohibiciones

- No hardcodear colores (hex/rgb/hsl) en features.
- No inventar escalas nuevas de spacing.
- No introducir fuentes nuevas sin pasar por tokens.
- No agregar “una variante” de botón/input por pantalla.

### 7.2 Permitido / recomendado

- Usar tokens (`--color-`*, `--space-*`, `--radius-*`, `--shadow-*`, `--font-*`)
- Componer estilos con patrones existentes antes de crear “otro sistema”
- Si se necesita un nuevo token, se agrega a `src/styles/globals.css` con soporte light/dark.

### 7.3 Checklist para PRs que tocan UI

- ¿Usa tokens para color/spacing/radio/sombra?
- ¿Hay estados hover/focus/disabled consistentes?
- ¿Los estados semánticos usan `success/warning/danger`?
- ¿No se agregaron valores “random” (px/hex) innecesarios?

---

## 8. Dónde mirar primero (mapa rápido)

- **Tokens + componentes base**: `src/styles/globals.css`
- **Dirección de producto y sistema visual (porqué)**: `agent/DESIGN.md`
- **CSS de features (debe obedecer tokens)**: `src/features/**/**/*.module.css`

