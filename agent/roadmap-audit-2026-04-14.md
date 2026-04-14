# Roadmap Audit — 2026-04-14

## Alcance y método

Auditoría sobre lo marcado como completado en `agent/ROADMAP.md`, más el código ya implementado que generaba drift documental o de entorno.

Evidencia ejecutada:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run validate:screenplay`
- `npm run validate:data-architecture`
- `npm run validate:security-base`
- `node scripts/run-roadmap-runtime-audit.mjs`

Artifact runtime principal:

- `agent/audit-artifacts/roadmap-audit-2026-04-14T02-40-08-915Z/`

Resultado base del repo al cierre de esta auditoría:

- lint: OK
- typecheck: OK
- tests: 38/38 OK
- build: OK
- validaciones de specs: OK

## Hallazgos

### Sin hallazgos bloqueantes abiertos en el alcance auditado

Estado: cerrado.

Evidencia:

- La línea base técnica quedó en verde: lint, typecheck, tests, build y validaciones de specs.
- La auditoría runtime completó con éxito el flujo autenticado completo contra Supabase real:
  - redirect anónimo a `/login?next=/projects`
  - registro
  - login / logout
  - creación de proyecto
  - escritura en editor
  - guardado manual
  - exportación PDF
  - recuperación de borrador tras reload
  - edición offline + reconexión
  - recuperación del contenido tras nueva sesión
  - bloqueo de acceso cross-user
  - cleanup del proyecto temporal
- Los artifacts quedaron guardados en `runtime-audit-results.json`, screenshots y PDFs dentro del directorio runtime principal.

### Hallazgo resuelto durante la auditoría — Drift remoto de Supabase

Estado: resuelto.

Evidencia inicial:

- `supabase-js` devolvía `500 unexpected_failure: Database error saving new user`.
- Los logs de Auth en Supabase mostraban `column "preferences" of relation "profiles" does not exist`.
- La base remota estaba corrida respecto del repo:
  - faltaba `public.profiles.preferences`
  - faltaba `public.projects.export_title_page`
  - el trigger `private.handle_new_user_profile` seguía insertando columnas ya no alineadas
  - `public.save_project_snapshot` seguía con la firma vieja

Corrección aplicada:

- `supabase/migrations/20260414023000_resilient_profile_trigger.sql`
- `supabase/migrations/20260414022000_remote_schema_drift_repair.sql`
- Ambas migraciones quedaron aplicadas al proyecto remoto durante esta auditoría.

Resultado:

- El alta de usuarios volvió a funcionar.
- El perfil puede autocurarse en el primer request autenticado mediante `ensureUserProfile`.
- El RPC de snapshots quedó alineado con el esquema actual del proyecto.

### Hallazgo resuelto durante la auditoría — Redirect autenticado sin `next`

Estado: resuelto.

Evidencia:

- Antes del fix, `/projects` terminaba en `/login` sin preservar destino.
- Había redirects server-side directos a `routes.login` que competían con el middleware.

Corrección aplicada:

- Se centralizó la construcción del destino seguro con `buildLoginRedirectPath`.
- Se retiró la redirección agresiva del layout autenticado.
- Se movió el control de login faltante a las páginas protegidas concretas (`projects`, `settings`, `projects/[projectId]`).

Resultado:

- La auditoría runtime ahora verifica `http://localhost:3000/login?next=%2Fprojects`.

### Nota operativa — En dev, la auditoría debe usar `localhost`, no `127.0.0.1`

Estado: documentado.

Evidencia:

- Next.js 16 bloquea recursos dev/HMR desde `127.0.0.1` si `allowedDevOrigins` no lo incluye.
- Esto no es bug del producto desplegado, pero sí afecta auditorías y automatizaciones locales.

## Matriz del roadmap auditado

| Bloque | Estado | Evidencia | Nota |
| --- | --- | --- | --- |
| Día 1 | Verificado | setup, README, scripts, checks base | Línea base limpia |
| Día 2 | Verificado | layouts, UI base, estilos, componentes reutilizables | Coherente con el repo actual |
| Día 3 | Verificado | `validate:screenplay`, bloques y docs V1 | Lista de bloques cerrada |
| Día 4 | Verificado | `validate:screenplay`, writing rules | Reglas cerradas y tipadas |
| Día 5 | Verificado | `validate:screenplay`, `screenplay-layout`, `screenplay-pdf` | Formato y paginación consistentes |
| Día 6 | Verificado | `document-model`, `document-validation` | Modelo extensible y validado |
| Día 7 | Verificado | `README.md`, `package.json`, `src/config/env.ts` | Stack y estrategia de entorno claros |
| Día 8 | Verificado | route groups, layouts, pantallas | Arquitectura frontend ordenada |
| Día 9 | Verificado | `validate:data-architecture`, migraciones | Modelo de datos coherente |
| Día 10 | Verificado | `validate:security-base`, RLS y RPCs | Base de seguridad definida |
| Día 11 | Verificado | landing, auth, dashboard, editor, settings | Pantallas principales presentes |
| Día 12 | Verificado | view states + runtime prototype (`offline`, `save-error`) | Estados críticos renderizan |
| Día 13 | Verificado | docs, tokens, CSS, branding implementado | Sin desalineación evidente |
| Día 14 | Verificado | registro/login/logout/recovery en runtime real | Drift documental corregido |
| Día 15 | Verificado | `profiles`, trigger reparado, `ensureUserProfile` | Perfil persistente operativo |
| Día 16 | Verificado | middleware + runtime cross-user | Ownership ejercido en vivo |
| Días 17–19 | Parcial | create/open/delete reales + lectura de código para rename/archive/metadata | El CRUD central pasó; no toda la superficie del dashboard se ejerció en runtime |
| Días 20–25 | Verificado | editor runtime en playground, sidebar, export | Buen nivel de evidencia funcional |
| Día 26 | Verificado | reload con borrador local recuperado | Sin pérdida de trabajo local |
| Días 27–28 | Verificado | save real, offline/reconnect, persistencia post-login | Persistencia autenticada comprobada |
| Días 29–31 | Verificado | export PDF estático + runtime prototype | PDF usable y consistente |
| Día 32 | Verificado | reglas free/premium documentadas | Sin contradicción visible en código actual |
| Días 35–36 | Parcial | shell de Ajustes, logout y perfil cargado; preferencias y password revisadas sobre todo en estático | Falta una pasada runtime dedicada a mutaciones de ajustes |
| Día 37 | Verificado | auditoría runtime reproducible | Roadmap sincronizado con evidencia actual |
| Día 38 | Verificado | Vitest 38/38 + casos editor | Casos borde bien cubiertos |
| Día 39 | Verificado | estados visuales y consistencia general | Apoyado por runtime prototype y checks |
| Día 40 | Parcial | RLS, ownership y errores de red revisados | Webhooks/pagos siguen fuera de alcance actual |

## Cobertura runtime real alcanzada

Verificado en ejecución:

- redirect anónimo a login
- preservación de `next` en redirect a login
- registro real en Supabase
- login y logout
- recuperación de contraseña
- creación, apertura y borrado de proyecto
- ownership cross-user
- escritura en editor
- guardado manual
- persistencia tras nueva sesión
- recuperación tras reload
- edición offline y sincronización al reconectar
- render del editor prototype
- detección de escenas en sidebar
- exportación PDF
- estado visual offline
- estado visual de error al guardar

No cubierto en esta pasada:

- Stripe / webhooks (Días 33–34)
- endurecimiento final de seguridad de D40 para servicios que todavía no existen
- limpieza automática de usuarios temporales de auditoría (sin service role en este entorno)

## Recomendación inmediata

1. Mantener `scripts/run-roadmap-runtime-audit.mjs` como smoke test reproducible antes de tocar auth, persistencia o editor.
2. Asegurar que cualquier entorno remoto aplique las migraciones del repo para evitar repetir drift de Supabase.
3. Dejar D40 abierto hasta revisar webhooks, exposición de claves y servicios aún no implementados.
