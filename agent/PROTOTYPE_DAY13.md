# Día 13 — Prototipo interno

## Estado

Completado el 2026-04-04. Cierra la Fase 3 antes de autenticación y backend (Fase 4).

## Objetivo

Fijar el flujo principal de producto con wireframes ligeros, un mapa navegable de rutas reales y una revisión explícita del camino de escritura, para que la implementación fuerte no improvise UX.

## Mapa navegable

Ruta interna: **`/playground/prototype`**

Lista enlaces a todas las pantallas relevantes y a variantes por query (`state`, `export`) alineadas con `src/features/product/view-states.ts`. Desde **Visual foundation** hay un enlace de acceso rápido.

## Wireframes rápidos (ASCII)

### Flujo alto nivel

```
[Landing] --login/register--> [Auth forms]
                |
                v
         [Lista proyectos] --abrir--> [Editor]
                |                         |
                +-------- ajustes --------+
                v
            [Ajustes]
```

### Editor (zona de escritura)

```
+------------------------------------------------------------------+
|  SCRIPTUM    [ Titulo editable________ ]   Estado   Exportar   |
+-------+----------------------------------------------------------+
| Escenas |                 PAPEL (Courier)                        |
|  01 ... |   INT. LUGAR - DIA                                     |
|  02 ... |   Accion...                                            |
|         |                      PERSONAJE                         |
|         |              Dialogo                                   |
+-------+----------------------------------------------------------+
| Bloque activo / paginas ~N    |    N escenas / escena activa     |
+------------------------------------------------------------------+
```

### Dashboard proyectos

```
+------------------------------------------------------------------+
| SCRIPTUM    Proyectos | Ajustes                    [usuario]     |
+------------------------------------------------------------------+
|  Tus proyectos                        [ + Nuevo proyecto ]       |
|  ----------------------------------------------------------------|
|  Titulo proyecto                                    editado ...  |
|  resumen...                                                      |
+------------------------------------------------------------------+
```

## Flujo de escritura (revisión)

Secuencia acordada para el MVP, alineada con la documento canónico:

1. **Entrada**: landing → registro o login (Fase 4 persistirá sesión).
2. **Descubrimiento**: lista de proyectos → crear nuevo o abrir existente.
3. **Sesión de escritura**:
   - Cabecera con título editable, estado de guardado, exportación.
   - Rail de escenas para saltar entre encabezados de escena.
   - Lienzo tipo papel; bloques según `SCREENPLAY_BLOCKS_V1.md`.
   - Comportamiento de teclado según `SCREENPLAY_WRITING_RULES_V1.md` (sin barra de formato en V1).
4. **Salida**: modal de exportación PDF → confirmación / descarga (backend en fases posteriores).
5. **Ajustes**: preferencias de cuenta y editor sin competir con el lienzo (`SCREENS_DAY11.md`).

### Decisiones ya cerradas para Fase 4+

- El modelo de documento y bloques está en `SCREENPLAY_DOCUMENT_MODEL_V1.md`.
- Estados vacío / carga / error / offline están especificados en `VISUAL_STATES_DAY12.md` y expuestos en el mapa de prototipo para QA visual.

## Validación (checklist)

- [x] Wireframes rápidos documentados (este archivo).
- [x] Prototipo navegable básico (`/playground/prototype` + app en `localhost:3000`).
- [x] Flujo de escritura completo revisado frente a reglas y pantallas oficiales.
- [x] Diseño ajustado donde hacía falta claridad interna (enlace foundation → mapa; ruta `playgroundPrototype` en `routes.ts`).

### Criterio de cierre

- [x] El flujo principal es claro antes de programar fuerte contra backend: **landing → auth → proyectos → editor → export → ajustes**, con estados de error y vacío explorables desde el mapa.

## Referencias cruzadas

| Documento | Uso |
|-----------|-----|
| `agent/SCREENS_DAY11.md` | Layout y zonas por pantalla |
| `agent/VISUAL_STATES_DAY12.md` | Variantes UI |
| `agent/FRONTEND_ARCHITECTURE_DAY8.md` | Rutas y layouts |
| `agent/SCREENPLAY_WRITING_RULES_V1.md` | Enter / Tab / pegado |
| `agent/SCREENPLAY_FORMAT_RULES_V1.md` | Apariencia por tipo de bloque |
