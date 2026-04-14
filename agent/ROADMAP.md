# SCRIPTUM — Checklist técnico de desarrollo

> Basado en el roadmap del proyecto y orientado a ejecución paso a paso en Codex.

---

## Reglas de ejecución

- [ ] No avanzar al siguiente bloque hasta que el actual funcione estable
- [ ] No agregar features fuera del paso actual
- [ ] Probar manualmente cada bloque antes de continuar
- [ ] Registrar bugs encontrados antes de seguir
- [ ] Mantener commits pequeños y claros
- [ ] Documentar decisiones técnicas importantes

---

# FASE 0 — Base del proyecto

## Día 1 — Setup inicial

- [x] Crear repositorio
- [x] Definir rama principal
- [x] Inicializar proyecto con Next.js + TypeScript
- [x] Instalar dependencias base
- [x] Configurar ESLint
- [x] Configurar Prettier
- [x] Configurar alias de importación
- [x] Crear estructura inicial de carpetas
- [x] Crear `.env.example`
- [x] Crear README técnico inicial

### Validación

- [x] El proyecto corre localmente
- [x] No hay errores de TypeScript
- [x] No hay errores de lint
- [x] La estructura base ya está definida

---

## Día 2 — Base visual

- [x] Configurar sistema de estilos
- [x] Crear layout general
- [x] Crear sistema base de componentes UI
- [x] Crear botón base
- [x] Crear input base
- [x] Crear modal base
- [x] Crear toast o feedback visual base
- [x] Crear skeleton loader base
- [x] Definir espaciados base
- [x] Definir tipografía base
- [x] Definir paleta inicial

### Validación

- [x] Existe consistencia visual mínima
- [x] Los componentes base son reutilizables
- [x] La UI ya puede crecer sin desorden

---

# FASE 1 — Definición funcional del editor

## Día 3 — Bloques del guion

- [x] Definir lista oficial de bloques permitidos
- [x] Confirmar `Scene Heading`
- [x] Confirmar `Action`
- [x] Confirmar `Character`
- [x] Confirmar `Dialogue`
- [x] Confirmar `Parenthetical`
- [x] Confirmar `Transition`
- [x] Definir qué bloques quedan fuera de V1
- [x] Documentar reglas de cada bloque

### Validación

- [x] Existe una lista cerrada de bloques de V1
- [x] No hay dudas sobre qué entra y qué no entra

---

## Día 4 — Reglas de escritura

- [x] Definir qué hace `Enter` en cada bloque
- [x] Definir qué hace `Tab` en cada bloque
- [x] Definir qué hace `Shift + Tab` en cada bloque
- [x] Definir creación automática del siguiente bloque
- [x] Definir comportamiento de bloques vacíos
- [x] Definir comportamiento de borrado entre bloques
- [x] Definir conversión manual de bloque
- [x] Definir comportamiento al pegar texto
- [x] Definir comportamiento de cortar/copiar/pegar múltiples bloques
- [x] Definir comportamiento de selección múltiple

### Validación

- [x] Las reglas están escritas de forma cerrada
- [x] Se puede implementar sin improvisación

---

## Día 5 — Formato profesional

- [x] Definir reglas exactas de `Scene Heading`
- [x] Definir reglas exactas de `Character`
- [x] Definir reglas exactas de `Dialogue`
- [x] Definir reglas exactas de `Parenthetical`
- [x] Definir reglas exactas de `Transition`
- [x] Definir reglas para mayúsculas automáticas
- [x] Definir sangrías visuales
- [x] Definir ancho de página
- [x] Definir reglas de saltos de página
- [x] Definir continuidad visual del guion

### Validación

- [x] Ya existe una referencia funcional cerrada del formato
- [x] El formato ya no depende de intuición

---

## Día 6 — Documento interno

- [x] Diseñar estructura JSON del documento
- [x] Diseñar estructura de bloques
- [x] Diseñar metadatos del proyecto
- [x] Diseñar representación interna de escenas
- [x] Diseñar identificadores únicos por bloque
- [x] Diseñar orden lógico de bloques
- [x] Diseñar estructura preparada para versionado futuro
- [x] Diseñar estructura preparada para sincronización futura

### Validación

- [x] El documento puede guardar un guion completo
- [x] La estructura es extensible
- [x] No hay acoplamiento innecesario

---

# FASE 2 — Arquitectura y servicios

## Día 7 — Decisiones técnicas finales

- [x] Confirmar stack oficial
- [x] Confirmar Next.js
- [x] Confirmar React
- [x] Confirmar TypeScript
- [x] Confirmar futura compatibilidad con Supabase
- [x] Confirmar futura compatibilidad con Stripe
- [x] Confirmar Lexical
- [x] Definir gestor de paquetes
- [x] Definir convenciones de nombres
- [x] Definir estrategia de variables de entorno

### Validación

- [x] No quedan decisiones técnicas base abiertas y las skills necesarias a futuro ya están disponibles en el entorno

---

## Día 8 — Arquitectura frontend

- [x] Diseñar árbol general de la app
- [x] Definir rutas principales
- [x] Definir layout público
- [x] Definir layout autenticado
- [x] Definir separación entre UI y lógica
- [x] Definir estrategia de estado
- [x] Definir estrategia de formularios
- [x] Definir estrategia de errores en UI

### Validación

- [x] La estructura de frontend ya puede crecer ordenadamente

---

## Día 9 — Arquitectura de datos

- [x] Diseñar entidades principales
- [x] Diseñar relación usuario ↔ proyectos
- [x] Diseñar relación proyecto ↔ documento
- [x] Diseñar tabla de perfiles
- [x] Diseñar tabla de proyectos
- [x] Diseñar tabla de documentos o snapshots
- [x] Diseñar timestamps
- [x] Diseñar soft delete o archivado

### Validación

- [x] El modelo soporta MVP completo
- [x] No hay dudas sobre persistencia principal

---

## Día 10 — Seguridad base

- [x] Definir modelo de autenticación
- [x] Definir reglas RLS en Supabase
- [x] Definir permisos por usuario
- [x] Asegurar aislamiento de proyectos por usuario
- [x] Definir validación de inputs críticos
- [x] Definir estrategia de secretos y claves
- [x] Definir política básica de backups

### Validación

- [x] La base de seguridad mínima existe antes de avanzar

---

# FASE 3 — UI principal del producto

## Día 11 — Pantallas principales

- [x] Diseñar landing básica
- [x] Diseñar login
- [x] Diseñar registro
- [x] Diseñar pantalla inicial
- [x] Diseñar lista de proyectos
- [x] Diseñar pantalla del editor
- [x] Diseñar sidebar de escenas
- [x] Diseñar ajustes mínimos
- [x] Diseñar modal de exportación

### Validación

- [x] La experiencia visual principal ya está decidida

---

## Día 12 — Estados visuales

- [x] Diseñar estado vacío
- [x] Diseñar estado cargando
- [x] Diseñar estado error
- [x] Diseñar estado sin conexión
- [x] Diseñar estado guardando
- [x] Diseñar estado sincronizado
- [x] Diseñar estado de exportación en progreso

### Validación

- [x] No faltan estados críticos de UX

---

## Día 13 — Prototipo interno

- [x] Crear wireframes rápidos
- [x] Crear prototipo navegable básico
- [x] Revisar flujo de escritura completo
- [x] Ajustar diseño antes del desarrollo fuerte

### Validación

- [x] El flujo principal está claro antes de programar fuerte

---

## Puerta a Fase 4 (auditoría de código)

Última revisión: **2026-04-05**. Auditoría completa contra especificaciones Días 1–13 ejecutada. Hallazgos corregidos: acento de marca documentado (verde #1e4d2b), paleta CSS sincronizada con DESIGN.md y SCREENS_DAY11.md, favicon actualizado, copy de pantallas alineado con Day 11 (título proyectos, empty state, nombre opcional en registro), estados del editor completados (Sin guardar, Error al guardar, Sincronizando...), toast de reconexión agregado, dead code eliminado (`RouteBlueprintPage`), referencia a `favicon.ico` inexistente removida, comentarios de código normalizados a inglés, y reference samples de screenplay ampliados.

Las tareas de **Fase 4** siguen pendientes a propósito (auth real, sesión, RLS). Antes de arrancar Fase 4: ejecutar `npm run lint` y `npm run build` para confirmar zero errors.

---

# FASE 4 — Autenticación y cuentas

## Día 14 — Autenticación

- [x] Implementar registro
- [x] Implementar login
- [x] Implementar logout
- [x] Implementar persistencia de sesión
- [x] Implementar recuperación de contraseña
- [x] Implementar verificación de correo si aplica

### Validación

- [x] Un usuario nuevo puede entrar y salir sin problemas

---

## Día 15 — Modelo de usuario

- [x] Crear perfil de usuario
- [x] Guardar preferencias básicas
- [x] Guardar estado free/premium
- [x] Guardar fecha de creación
- [x] Guardar estado de onboarding

### Validación

- [x] El usuario ya tiene identidad persistente completa

---

## Día 16 — Protección de rutas

- [x] Proteger rutas privadas
- [x] Redirigir usuarios no autenticados
- [x] Bloquear acceso a proyectos ajenos

### Validación

- [x] La app no expone rutas privadas

---

# FASE 5 — Dashboard y proyectos

## Día 17 — Gestión de proyectos

- [x] Implementar crear proyecto
- [x] Implementar listar proyectos
- [x] Implementar abrir proyecto
- [x] Implementar renombrar proyecto
- [x] Implementar eliminar proyecto
- [x] Implementar archivado si entra en V1
- [x] Ordenar por fecha de edición

### Validación

- [x] El ciclo completo de proyecto ya funciona

---

## Día 18 — Metadatos del proyecto

- [x] Guardar título del guion
- [x] Guardar autor
- [x] Guardar descripción opcional
- [x] Guardar fecha de modificación
- [x] Guardar estado del proyecto

### Validación

- [x] Los proyectos tienen información útil y consistente

---

## Día 19 — UX del dashboard

- [x] Asegurar carga rápida
- [x] Mostrar proyectos recientes
- [x] Mostrar estado vacío claro
- [x] Mostrar botón claro de nuevo proyecto

### Validación

- [x] El dashboard no estorba
- [x] El usuario entiende qué hacer en segundos

---

# FASE 6 — Editor base

## Día 20 — Integración del editor

- [x] Integrar Lexical
- [x] Crear instancia base del editor
- [x] Configurar tema visual del editor
- [x] Implementar documento inicial vacío
- [x] Implementar render básico
- [x] Verificar estabilidad mínima de edición

### Validación

- [x] El editor abre
- [x] El cursor funciona bien
- [x] No hay glitches graves

---

## Día 21 — Implementación de bloques

- [x] Implementar `Scene Heading`
- [x] Implementar `Action`
- [x] Implementar `Character`
- [x] Implementar `Dialogue`
- [x] Implementar `Parenthetical`
- [x] Implementar `Transition`
- [x] Implementar conversión entre bloques
- [x] Verificar estilos correctos de cada bloque

### Validación

- [x] Todos los bloques renderizan correctamente
- [x] El documento conserva estructura válida

---

## Día 22 — Teclado y flujo

- [x] Implementar `Enter`
- [x] Implementar `Tab`
- [x] Implementar `Shift + Tab`
- [x] Implementar navegación con flechas
- [x] Implementar borrado consistente
- [x] Implementar creación automática del siguiente bloque
- [x] Implementar casos borde iniciales

### Validación

- [x] Se puede escribir sin pelear con el editor
- [x] El flujo se siente natural

---

## Día 23 — Experiencia real de escritura

- [x] Eliminar latencia perceptible
- [x] Asegurar foco correcto del cursor
- [x] Corregir inconsistencias entre bloques
- [x] Eliminar saltos visuales molestos
- [x] Probar sesiones de escritura largas

### Validación

- [x] El editor ya se siente cómodo de verdad

---

# FASE 7 — Navegación y ayudas

## Día 24 — Sidebar de escenas

- [x] Detectar escenas automáticamente
- [x] Mostrar lista de escenas
- [x] Permitir navegación por clic
- [x] Sincronizar con posición del documento
- [x] Resaltar escena actual
- [x] Probar con documentos largos

### Validación

- [x] La navegación ayuda y no molesta

---

## Día 25 — Ayudas opcionales

- [x] Implementar glosario básico
- [x] Implementar ayudas contextuales mínimas
- [x] Implementar opción para ocultarlas
- [x] Verificar que no interrumpan a usuarios expertos

### Validación

- [x] Las ayudas son opcionales
- [x] No rompen el flujo principal

---

# FASE 8 — Guardado y persistencia

## Día 26 — Guardado local

- [x] Diseñar autosave local
- [x] Guardar borradores temporales
- [x] Recuperar cambios no sincronizados
- [x] Evitar pérdida ante refresh o cierre accidental

### Validación

- [x] El usuario no pierde trabajo localmente

---

## Día 27 — Guardado en nube

- [x] Guardar documento en Supabase
- [x] Guardar cambios de forma eficiente
- [x] Evitar guardados excesivos
- [x] Mostrar estado de guardado
- [x] Manejar errores de persistencia
- [x] Reintentar sincronización

### Validación

- [x] El documento persiste sin comportamiento raro

---

## Día 28 — Offline-first básico

- [x] Permitir seguir escribiendo sin conexión
- [x] Detectar estado online/offline
- [x] Mantener cola de sincronización básica
- [x] Sincronizar al reconectar
- [x] Validar conflictos simples

### Validación

- [x] El usuario puede seguir escribiendo si se corta internet

---

# FASE 9 — Exportación PDF

## Día 29 — Definición del exportador

- [x] Definir formato exacto del PDF
- [x] Definir tamaño de página
- [x] Definir márgenes
- [x] Definir fuente
- [x] Definir paginación
- [x] Definir encabezados si aplican

### Validación

- [x] Ya existe una especificación clara de exportación

---

## Día 30 — Implementación PDF

- [x] Generar PDF desde documento estructurado
- [x] Verificar consistencia con formato profesional
- [x] Verificar saltos de página correctos
- [x] Verificar textos largos
- [x] Verificar diálogos largos
- [x] Verificar escenas largas
- [x] Verificar exportación de proyectos completos

### Validación

- [x] El PDF ya es usable y consistente

---

## Día 31 — Ajuste fino de exportación

- [x] Comparar el resultado con el estándar esperado
- [x] Revisar visualmente varios casos de prueba
- [x] Ajustar detalles tipográficos
- [x] Confirmar que sea compartible profesionalmente

### Validación

- [x] El PDF ya representa bien el producto

---

# FASE 10 — Free / Premium

## Día 32 — Reglas del plan

- [x] Definir exactamente qué incluye free
- [x] Definir exactamente qué incluye premium
- [x] Evitar bloquear escritura esencial
- [x] Definir qué requiere cuenta obligatoriamente

**Free**

- Editor y formato profesional completos, sin límites artificiales en la escritura.
- Exportación PDF **sin restricciones** (misma calidad que premium).
- Proyectos **solo en el dispositivo** (p. ej. almacenamiento local): **no** guardado ni sincronización de proyectos en la base de datos.

**Premium**

- Todo lo del plan free.
- **Persistencia y sincronización** de proyectos en la base de datos (multi-dispositivo, backup en servidor según lo implementado).

**Cuenta y límites**

- **Premium** requiere cuenta autenticada (pago / estado `premium` en perfil).
- **Free** puede operar sin depender del backend para proyectos; si existe cuenta en free, no habilita guardado de proyectos en BD hasta upgrade (definir en implementación si el registro es obligatorio solo al pasar a premium o si hay flujo “local first”).

### Validación

- [x] La monetización no rompe la propuesta de valor (el valor del PDF y del editor es pleno en free; el upgrade paga por nube/respaldo/sincronización)

---

## Día 33 — Stripe

- [ ] Diseñar planes en Stripe
- [ ] Crear producto y precios
- [ ] Implementar checkout
- [ ] Implementar portal de cliente si aplica
- [ ] Implementar webhooks
- [ ] Actualizar estado premium del usuario
- [ ] Manejar renovaciones
- [ ] Manejar cancelaciones
- [ ] Manejar errores de pago

### Validación

- [ ] El sistema premium funciona técnicamente

---

## Día 34 — UX de monetización

- [ ] Diseñar pantalla de pricing
- [ ] Diseñar mensajes claros de upgrade
- [ ] Evitar dark patterns
- [ ] Explicar bien el valor premium

### Validación

- [ ] La monetización se entiende y no molesta

---

# FASE 11 — Ajustes y configuración

## Día 35 — Ajustes básicos

- [x] Cambiar nombre visible
- [x] Cambiar contraseña (reautenticación + `updateUser`, más enlace a recuperación)
- [x] Cerrar sesión de forma segura (sesión local y opción global en todos los dispositivos)
- [x] Ver estado del plan
- [x] Ver correo vinculado

### Validación

- [x] La cuenta tiene control básico suficiente

---

## Día 36 — Preferencias del editor

- [x] Definir si habrá preferencias en V1 — **Sí:** ayudas del editor (on/off, nivel, glosario), autoguardado, tema persistido en `profiles.preferences.theme` además de cookie/local.
- [x] Permitir activar/desactivar ayudas
- [x] Onboarding guiado: **no aplica en V1**; la fila se omitió en Ajustes hasta existir recorrido. `onboarding_completed_at` permanece en el modelo para futuro.

### Validación

- [x] Las preferencias útiles existen sin volver compleja la app

---

# FASE 12 — Testing y QA

## Día 37 — Testing funcional principal

- [x] Probar creación de cuenta — *Auditoría runtime (2026-04-14): `scripts/run-roadmap-runtime-audit.mjs` crea usuario real en Supabase y redirige a `/projects`.*
- [x] Probar login — *Auditoría runtime: logout en Ajustes + login con la misma cuenta, con proyecto visible en `/projects`.*
- [x] Probar creación de proyecto — *Auditoría runtime: «+ Nuevo proyecto» abre `/projects/project_…` y carga el editor real.*
- [x] Probar escritura de guion corto — *Auditoría runtime: encabezado, acción y diálogo escritos en Lexical; escena detectada en sidebar.*
- [x] Probar escritura de guion largo — *Vitest: stress de layout con 80 escenas; la UI runtime quedó verificada en flujo corto y persistencia real.*
- [x] Probar exportación PDF — *Auditoría runtime: modal Exportar → PDF listo → descarga real del archivo.*
- [x] Probar recuperación tras cierre accidental — *Auditoría runtime: borrador local recuperado tras reload; Vitest `editor-draft` mantiene cobertura de almacenamiento local.*
- [x] Probar comportamiento offline — *Auditoría runtime: contexto offline real en Playwright, estado «Guardado en local» y edición disponible sin red.*
- [x] Probar sincronización al reconectar — *Auditoría runtime: volver online + «Guardar» sincroniza el contenido y lo deja visible tras nueva sesión.*

### Validación

- [x] El flujo principal ya funciona extremo a extremo — *Auditoría runtime 2026-04-14: register → proyecto → editor → save → export PDF → reload → offline/reconnect → logout/login → recuperación → ownership cross-user.*

---

## Día 38 — Casos borde del editor

- [x] Pegar texto grande — *Inserción por trozos (`chunkStringForPaste`, `DEFAULT_PLAIN_TEXT_PASTE_CHUNK_SIZE`) en `ScreenplayPlainTextGuardPlugin`; Vitest `plain-text-paste-chunks.test.ts`.*
- [x] Borrar múltiples bloques — *MCP: foco en editor + Ctrl+A + Suprimir sin error visible.*
- [x] Navegar escenas largas — *Vitest: layout con 80 escenas + acción; respeto de `bodyHeightLines`.*
- [x] Exportar documentos extensos — *Vitest: PDF multipágina (~60 escenas, umbral de tamaño en bytes).*
- [x] Probar caracteres especiales — *Vitest + una línea en UI con tildes y ««»».*
- [x] Probar diálogos extensos — *Vitest existente: diálogo largo con `(MORE)` / `(CONT'D)`.*
- [x] Probar escenas vacías — *Vitest: solo `scene-heading` en export.*
- [x] Probar documento dañado o inconsistente — *Vitest: `editor-draft` JSON inválido / payload mal formado + normalización de bloques vacíos.*

### Validación

- [x] El editor resiste mal uso razonable — *Vitest reforzado + E2E borrado masivo y export; pegado grande cubierto por troceado + tests de chunk.*

---

## Día 39 — QA visual

- [x] Revisar consistencia visual general
- [x] Revisar responsive web básico
- [x] Revisar errores de foco
- [x] Revisar estados de carga/error/vacío
- [x] Revisar coherencia de tipografía y espaciado

### Validación

- [x] La app se siente limpia y consistente — *2026-04-11: pase sobre landing (público), layouts, `StatePanel` (404/errores), dashboard; ajustes de foco en nav pública/dashboard, botones de error a ancho completo en ≤640px, `prefers-reduced-motion` vía `useSyncExternalStore`; `npm run lint` + `npm run typecheck` OK.*

---

## Día 40 — Seguridad y robustez

- [ ] Revisar reglas RLS
- [ ] Revisar exposición de claves
- [ ] Revisar validaciones críticas
- [ ] Revisar protección de webhooks
- [ ] Revisar permisos de acceso a documentos
- [ ] Revisar comportamiento ante errores de red

### Validación

- [ ] No quedan agujeros graves evidentes

---

# FASE 13 — Beta cerrada

## Día 41 — Preparación de beta

- [ ] Seleccionar beta testers
- [ ] Definir objetivo de beta
- [ ] Definir formulario de feedback
- [ ] Definir canal de bugs
- [ ] Preparar mensaje de bienvenida

### Validación

- [ ] La beta tiene estructura mínima seria

---

## Día 42 — Ejecución de beta

- [ ] Invitar testers
- [ ] Observar uso del editor
- [ ] Registrar bugs reportados
- [ ] Registrar fricciones de UX
- [ ] Registrar dudas frecuentes
- [ ] Detectar confusiones en principiantes

### Validación

- [ ] Ya existe feedback real de uso

---

## Día 43 — Corrección post-beta

- [ ] Priorizar bugs críticos
- [ ] Corregir errores del editor
- [ ] Corregir errores de persistencia
- [ ] Corregir errores de exportación
- [ ] Corregir errores de onboarding
- [ ] Revalidar con testers

### Validación

- [ ] Los problemas más importantes ya fueron resueltos

---

# FASE 14 — Pre-lanzamiento

## Día 44 — Estabilidad final

- [ ] Confirmar estabilidad del editor
- [ ] Confirmar autosave
- [ ] Confirmar modo offline básico
- [ ] Confirmar PDF profesional
- [ ] Confirmar pagos
- [ ] Confirmar restricciones free/premium

### Validación

- [ ] El producto ya puede salir

---

## Día 45 — Preparación pública

- [ ] Escribir copy principal
- [ ] Escribir landing
- [ ] Escribir FAQ inicial
- [ ] Escribir términos básicos si aplica
- [ ] Escribir política de privacidad si aplica
- [ ] Preparar branding público mínimo

### Validación

- [ ] Ya existe material mínimo de lanzamiento

---

## Día 46 — Analítica básica

- [ ] Definir métricas mínimas
- [ ] Medir registros
- [ ] Medir proyectos creados
- [ ] Medir exportaciones
- [ ] Medir conversión a premium
- [ ] Medir abandono en onboarding

### Validación

- [ ] El producto ya puede aprender de uso real

---

# FASE 15 — Cierre de V1

## Checklist de salida

- [ ] El usuario puede registrarse
- [ ] El usuario puede crear proyectos
- [ ] El usuario puede escribir un guion completo
- [ ] El formato se mantiene consistente
- [ ] El usuario puede navegar escenas
- [ ] El usuario puede guardar sin perder información
- [ ] El usuario puede exportar PDF profesional
- [ ] El usuario puede usar la app con comodidad
- [ ] El producto se ve limpio y confiable
- [ ] El plan premium funciona técnicamente
- [ ] No hay bugs críticos abiertos
- [ ] No hay pérdidas de datos conocidas
- [ ] No hay problemas graves de seguridad detectados
- [ ] El flujo principal completo está validado
- [ ] La experiencia general cumple la visión original

---

# Bloque extra — Orden recomendado realista si querés ir más rápido

## MVP mínimo brutal

- [ ] Setup del proyecto
- [ ] UI base
- [ ] Modelo interno del documento
- [ ] Integración del editor
- [ ] Bloques de guion
- [ ] Reglas de teclado
- [ ] Sidebar de escenas
- [ ] Autosave local
- [ ] Guardado en nube
- [ ] Exportación PDF
- [ ] Testing funcional del flujo principal

---

# Notas de avance

## Bugs encontrados

- 2026-04-14: drift remoto de Supabase detectado durante auditoría (`public.profiles.preferences`, `public.projects.export_title_page` y trigger de perfil desalineados); reparado con `20260414022000_remote_schema_drift_repair.sql` y `20260414023000_resilient_profile_trigger.sql`.

## Decisiones tomadas

- [x] Día 3: V1 queda cerrada a `Scene Heading`, `Action`, `Character`, `Dialogue`, `Parenthetical` y `Transition`
- [x] Día 4: V1 fija una matriz cerrada de `Enter`, `Tab`, `Shift + Tab`, pegado, selección y borrado en `SCREENPLAY_WRITING_RULES_V1.md`
- [x] Día 5: el formato profesional queda cerrado en `SCREENPLAY_FORMAT_RULES_V1.md` y `src/features/screenplay/format-rules.ts` con métricas, mayúsculas y paginación deterministas
- [x] Día 6: el documento interno queda definido en `SCREENPLAY_DOCUMENT_MODEL_V1.md` y `src/features/screenplay/document-model.ts` con `blockOrder` canónico, bloques por id, índice de escenas derivado y envelopes separados para `schema`, `document`, `project`, `sync` y `extensions`
- [x] Día 7: el stack oficial queda fijado en `TECH_DECISIONS_DAY7.md` con `Next.js 16`, `React 19`, `TypeScript 5`, `Lexical`, `npm`, estrategia de entorno centralizada y compatibilidad futura con Supabase y Stripe
- [x] Día 8: la arquitectura frontend queda fijada en `FRONTEND_ARCHITECTURE_DAY8.md` con grupos de rutas `public`, `authenticated` e `internal`, shell de dashboard, shell de editor, y fronteras claras para estado, formularios y errores de UI
- [x] Día 9: la persistencia MVP queda fijada en `DATA_ARCHITECTURE_DAY9.md` y `src/features/data/data-architecture.ts` con `profiles`, `projects`, `document_snapshots`, ownership 1:N por usuario, snapshots append-only y `projects.current_snapshot_id` como puntero al documento persistido activo
- [x] Día 10: la base de seguridad queda fijada en `SECURITY_BASE_DAY10.md` y `src/features/security/security-base.ts` con email/password + cookie session, RLS para las 3 tablas con ownership estricto, validación de inputs críticos, estrategia de secretos y política de backups
- [x] Día 11: las pantallas principales quedan especificadas en `SCREENS_DAY11.md` con layout, zonas, jerarquia de contenido, estados y comportamiento para landing, login, registro, lista de proyectos, editor, sidebar de escenas, ajustes y modal de exportacion
- [x] Día 13 (auditoría): el acento de marca pasa de azul (#284c7a) a verde botella profundo (#1e4d2b) — literario, cinematográfico, sin azul frío; decisión registrada en DESIGN.md y reflejada en `globals.css`, favicon y tokens
- [x] Día 13 (auditoría): la paleta CSS evoluciona desde los valores sugeridos iniciales de DESIGN.md a los valores implementados en `globals.css` (background #e8e2d9, surface #f0ebe3, etc.); DESIGN.md y SCREENS_DAY11.md actualizados para reflejar los valores reales
- [x] Día 13 (auditoría): el modo oscuro se establece como tema por defecto del producto; la paleta oscura usa sage desaturado (#c0caad) como acento para mantener identidad cálida
- [x] Día 13 (auditoría): el idioma de la interfaz de usuario queda fijado en español (`lang="es"` en el HTML root); los identificadores y comentarios de código se mantienen en inglés según Day 7
- [x] Día 15: tabla `public.profiles` (migración `supabase/migrations`), trigger post-registro en `auth.users`, RLS alineada con Day 10, tipos `Database` en `src/lib/supabase/types.ts`, módulo `src/features/user/profile.ts` (`ensureUserProfile`, preferencias JSON, plan, onboarding, fechas), sincronización en layout autenticado y `auth/callback`, y ajustes leyendo/escribiendo perfil real
- [x] Día 16: middleware alineado con `securityBaseProtectedRoutePrefixes`, bloqueo de `/projects` y `/settings` sin sesión (también si falta config pública de Supabase), `next` sanitizado (`getSafeRedirectPath`), comprobación de propiedad en `projects/[projectId]` con tabla `public.projects` + RLS (`canAccessProjectEditor`), demos de editor acotadas por `authenticatedEditorPrototypeProjectIds`
- [x] Pre-Día 17: migración `document_snapshots` agregada con RLS (`SELECT/INSERT` owner-only), inmutabilidad por diseño (sin `UPDATE/DELETE` grants), unicidad por `(project_id, revision)` y FK diferida `projects(id,current_snapshot_id) -> document_snapshots(project_id,id)` para asegurar que el snapshot activo pertenezca al mismo proyecto
- [x] Día 17–19: módulo `src/features/projects/projects.ts` con CRUD completo contra `public.projects` (create, list, get, rename, updateMetadata, archive/unarchive, delete soft), `projects-screen.tsx` reescrito de datos preview a datos reales vía Supabase, acciones inline (menú ⋯ con renombrar, detalles, archivar, eliminar), modales de rename/delete/metadata, filtro Todos/Activos/Archivados, `DashboardLayout` usa perfil real del usuario en lugar de `previewUser`, page server-side fetcha proyectos y determina viewState, build y lint pasan sin errores
- [x] Día 24: sidebar de escenas operativo en `editor-screen.tsx` + `editor-derived-state.ts` (escenas desde bloques `scene-heading`, lista, clic con foco y `scrollIntoView` en el lienzo, escena activa desde el cursor, resaltado y pie de página); completado con panel lateral con scroll interno, `scrollIntoView` de la fila activa en la lista (`nearest` + `auto`) y ellipsis en títulos largos según Day 11
- [x] Día 25: preferencia `editorTipsEnabled` en `profiles.preferences` con `resolveEditorTipsEnabled` (por defecto ayudas visibles); definiciones en tooltips tras ~0,7s de hover (`HoverDelayTip`) sobre selector de bloque, pie, título Escenas e icono de lista; glosario completo vía botón «?» en el editor y «Ver glosario completo» en Ajustes → Editor (`editor-help/glossary.ts`, enlaces en modal); «Ocultar ayudas» discreto bajo el header

## Cosas que NO entrarían en V1

- [ ] Colaboración en tiempo real
- [ ] Anotaciones avanzadas
- [ ] Seguimiento de personajes
- [ ] Producción
- [ ] Features secundarias no esenciales
