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

- [ ] Implementar registro
- [ ] Implementar login
- [ ] Implementar logout
- [ ] Implementar persistencia de sesión
- [ ] Implementar recuperación de contraseña
- [ ] Implementar verificación de correo si aplica

### Validación

- [ ] Un usuario nuevo puede entrar y salir sin problemas

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

- [ ] Implementar crear proyecto
- [ ] Implementar listar proyectos
- [ ] Implementar abrir proyecto
- [ ] Implementar renombrar proyecto
- [ ] Implementar eliminar proyecto
- [ ] Implementar archivado si entra en V1
- [ ] Ordenar por fecha de edición

### Validación

- [ ] El ciclo completo de proyecto ya funciona

---

## Día 18 — Metadatos del proyecto

- [ ] Guardar título del guion
- [ ] Guardar autor
- [ ] Guardar descripción opcional
- [ ] Guardar fecha de modificación
- [ ] Guardar estado del proyecto

### Validación

- [ ] Los proyectos tienen información útil y consistente

---

## Día 19 — UX del dashboard

- [ ] Asegurar carga rápida
- [ ] Mostrar proyectos recientes
- [ ] Mostrar estado vacío claro
- [ ] Mostrar botón claro de nuevo proyecto

### Validación

- [ ] El dashboard no estorba
- [ ] El usuario entiende qué hacer en segundos

---

# FASE 6 — Editor base

## Día 20 — Integración del editor

- [ ] Integrar Lexical
- [ ] Crear instancia base del editor
- [ ] Configurar tema visual del editor
- [ ] Implementar documento inicial vacío
- [ ] Implementar render básico
- [ ] Verificar estabilidad mínima de edición

### Validación

- [ ] El editor abre
- [ ] El cursor funciona bien
- [ ] No hay glitches graves

---

## Día 21 — Implementación de bloques

- [ ] Implementar `Scene Heading`
- [ ] Implementar `Action`
- [ ] Implementar `Character`
- [ ] Implementar `Dialogue`
- [ ] Implementar `Parenthetical`
- [ ] Implementar `Transition`
- [ ] Implementar conversión entre bloques
- [ ] Verificar estilos correctos de cada bloque

### Validación

- [ ] Todos los bloques renderizan correctamente
- [ ] El documento conserva estructura válida

---

## Día 22 — Teclado y flujo

- [ ] Implementar `Enter`
- [ ] Implementar `Tab`
- [ ] Implementar `Shift + Tab`
- [ ] Implementar navegación con flechas
- [ ] Implementar borrado consistente
- [ ] Implementar creación automática del siguiente bloque
- [ ] Implementar casos borde iniciales

### Validación

- [ ] Se puede escribir sin pelear con el editor
- [ ] El flujo se siente natural

---

## Día 23 — Experiencia real de escritura

- [ ] Eliminar latencia perceptible
- [ ] Asegurar foco correcto del cursor
- [ ] Corregir inconsistencias entre bloques
- [ ] Eliminar saltos visuales molestos
- [ ] Probar sesiones de escritura largas

### Validación

- [ ] El editor ya se siente cómodo de verdad

---

# FASE 7 — Navegación y ayudas

## Día 24 — Sidebar de escenas

- [ ] Detectar escenas automáticamente
- [ ] Mostrar lista de escenas
- [ ] Permitir navegación por clic
- [ ] Sincronizar con posición del documento
- [ ] Resaltar escena actual
- [ ] Probar con documentos largos

### Validación

- [ ] La navegación ayuda y no molesta

---

## Día 25 — Ayudas opcionales

- [ ] Implementar glosario básico
- [ ] Implementar ayudas contextuales mínimas
- [ ] Implementar opción para ocultarlas
- [ ] Verificar que no interrumpan a usuarios expertos

### Validación

- [ ] Las ayudas son opcionales
- [ ] No rompen el flujo principal

---

# FASE 8 — Guardado y persistencia

## Día 26 — Guardado local

- [ ] Diseñar autosave local
- [ ] Guardar borradores temporales
- [ ] Recuperar cambios no sincronizados
- [ ] Evitar pérdida ante refresh o cierre accidental

### Validación

- [ ] El usuario no pierde trabajo localmente

---

## Día 27 — Guardado en nube

- [ ] Guardar documento en Supabase
- [ ] Guardar cambios de forma eficiente
- [ ] Evitar guardados excesivos
- [ ] Mostrar estado de guardado
- [ ] Manejar errores de persistencia
- [ ] Reintentar sincronización

### Validación

- [ ] El documento persiste sin comportamiento raro

---

## Día 28 — Offline-first básico

- [ ] Permitir seguir escribiendo sin conexión
- [ ] Detectar estado online/offline
- [ ] Mantener cola de sincronización básica
- [ ] Sincronizar al reconectar
- [ ] Validar conflictos simples

### Validación

- [ ] El usuario puede seguir escribiendo si se corta internet

---

# FASE 9 — Exportación PDF

## Día 29 — Definición del exportador

- [ ] Definir formato exacto del PDF
- [ ] Definir tamaño de página
- [ ] Definir márgenes
- [ ] Definir fuente
- [ ] Definir paginación
- [ ] Definir encabezados si aplican

### Validación

- [ ] Ya existe una especificación clara de exportación

---

## Día 30 — Implementación PDF

- [ ] Generar PDF desde documento estructurado
- [ ] Verificar consistencia con formato profesional
- [ ] Verificar saltos de página correctos
- [ ] Verificar textos largos
- [ ] Verificar diálogos largos
- [ ] Verificar escenas largas
- [ ] Verificar exportación de proyectos completos

### Validación

- [ ] El PDF ya es usable y consistente

---

## Día 31 — Ajuste fino de exportación

- [ ] Comparar el resultado con el estándar esperado
- [ ] Revisar visualmente varios casos de prueba
- [ ] Ajustar detalles tipográficos
- [ ] Confirmar que sea compartible profesionalmente

### Validación

- [ ] El PDF ya representa bien el producto

---

# FASE 10 — Free / Premium

## Día 32 — Reglas del plan

- [ ] Definir exactamente qué incluye free
- [ ] Definir exactamente qué incluye premium
- [ ] Evitar bloquear escritura esencial
- [ ] Definir qué requiere cuenta obligatoriamente

### Validación

- [ ] La monetización no rompe la propuesta de valor

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

- [ ] Cambiar nombre visible
- [ ] Cambiar contraseña
- [ ] Cerrar sesión de forma segura
- [ ] Ver estado del plan
- [ ] Ver correo vinculado

### Validación

- [ ] La cuenta tiene control básico suficiente

---

## Día 36 — Preferencias del editor

- [ ] Definir si habrá preferencias en V1
- [ ] Permitir activar/desactivar ayudas
- [ ] Permitir elegir comportamiento de onboarding si aplica

### Validación

- [ ] Las preferencias útiles existen sin volver compleja la app

---

# FASE 12 — Testing y QA

## Día 37 — Testing funcional principal

- [ ] Probar creación de cuenta
- [ ] Probar login
- [ ] Probar creación de proyecto
- [ ] Probar escritura de guion corto
- [ ] Probar escritura de guion largo
- [ ] Probar exportación PDF
- [ ] Probar recuperación tras cierre accidental
- [ ] Probar comportamiento offline
- [ ] Probar sincronización al reconectar

### Validación

- [ ] El flujo principal ya funciona extremo a extremo

---

## Día 38 — Casos borde del editor

- [ ] Pegar texto grande
- [ ] Borrar múltiples bloques
- [ ] Navegar escenas largas
- [ ] Exportar documentos extensos
- [ ] Probar caracteres especiales
- [ ] Probar diálogos extensos
- [ ] Probar escenas vacías
- [ ] Probar documento dañado o inconsistente

### Validación

- [ ] El editor resiste mal uso razonable

---

## Día 39 — QA visual

- [ ] Revisar consistencia visual general
- [ ] Revisar responsive web básico
- [ ] Revisar errores de foco
- [ ] Revisar estados de carga/error/vacío
- [ ] Revisar coherencia de tipografía y espaciado

### Validación

- [ ] La app se siente limpia y consistente

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

_(ninguno registrado hasta la fecha)_

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

## Cosas que NO entrarían en V1

- [ ] Colaboración en tiempo real
- [ ] Anotaciones avanzadas
- [ ] Seguimiento de personajes
- [ ] Producción
- [ ] Features secundarias no esenciales
