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
- [ ] Crear repositorio
- [ ] Definir rama principal
- [ ] Inicializar proyecto con Next.js + TypeScript
- [ ] Instalar dependencias base
- [ ] Configurar ESLint
- [ ] Configurar Prettier
- [ ] Configurar alias de importación
- [ ] Crear estructura inicial de carpetas
- [ ] Crear `.env.example`
- [ ] Crear README técnico inicial

### Validación
- [ ] El proyecto corre localmente
- [ ] No hay errores de TypeScript
- [ ] No hay errores de lint
- [ ] La estructura base ya está definida

---

## Día 2 — Base visual
- [ ] Configurar sistema de estilos
- [ ] Crear layout general
- [ ] Crear sistema base de componentes UI
- [ ] Crear botón base
- [ ] Crear input base
- [ ] Crear modal base
- [ ] Crear toast o feedback visual base
- [ ] Crear skeleton loader base
- [ ] Definir espaciados base
- [ ] Definir tipografía base
- [ ] Definir paleta inicial

### Validación
- [ ] Existe consistencia visual mínima
- [ ] Los componentes base son reutilizables
- [ ] La UI ya puede crecer sin desorden

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
- [ ] Definir qué hace `Enter` en cada bloque
- [ ] Definir qué hace `Tab` en cada bloque
- [ ] Definir qué hace `Shift + Tab` en cada bloque
- [ ] Definir creación automática del siguiente bloque
- [ ] Definir comportamiento de bloques vacíos
- [ ] Definir comportamiento de borrado entre bloques
- [ ] Definir conversión manual de bloque
- [ ] Definir comportamiento al pegar texto
- [ ] Definir comportamiento de cortar/copiar/pegar múltiples bloques
- [ ] Definir comportamiento de selección múltiple

### Validación
- [ ] Las reglas están escritas de forma cerrada
- [ ] Se puede implementar sin improvisación

---

## Día 5 — Formato profesional
- [ ] Definir reglas exactas de `Scene Heading`
- [ ] Definir reglas exactas de `Character`
- [ ] Definir reglas exactas de `Dialogue`
- [ ] Definir reglas exactas de `Parenthetical`
- [ ] Definir reglas exactas de `Transition`
- [ ] Definir reglas para mayúsculas automáticas
- [ ] Definir sangrías visuales
- [ ] Definir ancho de página
- [ ] Definir reglas de saltos de página
- [ ] Definir continuidad visual del guion

### Validación
- [ ] Ya existe una referencia funcional cerrada del formato
- [ ] El formato ya no depende de intuición

---

## Día 6 — Documento interno
- [ ] Diseñar estructura JSON del documento
- [ ] Diseñar estructura de bloques
- [ ] Diseñar metadatos del proyecto
- [ ] Diseñar representación interna de escenas
- [ ] Diseñar identificadores únicos por bloque
- [ ] Diseñar orden lógico de bloques
- [ ] Diseñar estructura preparada para versionado futuro
- [ ] Diseñar estructura preparada para sincronización futura

### Validación
- [ ] El documento puede guardar un guion completo
- [ ] La estructura es extensible
- [ ] No hay acoplamiento innecesario

---

# FASE 2 — Arquitectura y servicios

## Día 7 — Decisiones técnicas finales
- [ ] Confirmar stack oficial
- [ ] Confirmar Next.js
- [ ] Confirmar React
- [ ] Confirmar TypeScript
- [ ] Confirmar Supabase
- [ ] Confirmar Stripe
- [ ] Confirmar Lexical
- [ ] Definir gestor de paquetes
- [ ] Definir convenciones de nombres
- [ ] Definir estrategia de variables de entorno

### Validación
- [ ] No quedan decisiones técnicas base abiertas

---

## Día 8 — Arquitectura frontend
- [ ] Diseñar árbol general de la app
- [ ] Definir rutas principales
- [ ] Definir layout público
- [ ] Definir layout autenticado
- [ ] Definir separación entre UI y lógica
- [ ] Definir estrategia de estado
- [ ] Definir estrategia de formularios
- [ ] Definir estrategia de errores en UI

### Validación
- [ ] La estructura de frontend ya puede crecer ordenadamente

---

## Día 9 — Arquitectura de datos
- [ ] Diseñar entidades principales
- [ ] Diseñar relación usuario ↔ proyectos
- [ ] Diseñar relación proyecto ↔ documento
- [ ] Diseñar tabla de perfiles
- [ ] Diseñar tabla de proyectos
- [ ] Diseñar tabla de documentos o snapshots
- [ ] Diseñar timestamps
- [ ] Diseñar soft delete o archivado

### Validación
- [ ] El modelo soporta MVP completo
- [ ] No hay dudas sobre persistencia principal

---

## Día 10 — Seguridad base
- [ ] Definir modelo de autenticación
- [ ] Definir reglas RLS en Supabase
- [ ] Definir permisos por usuario
- [ ] Asegurar aislamiento de proyectos por usuario
- [ ] Definir validación de inputs críticos
- [ ] Definir estrategia de secretos y claves
- [ ] Definir política básica de backups

### Validación
- [ ] La base de seguridad mínima existe antes de avanzar

---

# FASE 3 — UI principal del producto

## Día 11 — Pantallas principales
- [ ] Diseñar landing básica
- [ ] Diseñar login
- [ ] Diseñar registro
- [ ] Diseñar pantalla inicial
- [ ] Diseñar lista de proyectos
- [ ] Diseñar pantalla del editor
- [ ] Diseñar sidebar de escenas
- [ ] Diseñar ajustes mínimos
- [ ] Diseñar modal de exportación

### Validación
- [ ] La experiencia visual principal ya está decidida

---

## Día 12 — Estados visuales
- [ ] Diseñar estado vacío
- [ ] Diseñar estado cargando
- [ ] Diseñar estado error
- [ ] Diseñar estado sin conexión
- [ ] Diseñar estado guardando
- [ ] Diseñar estado sincronizado
- [ ] Diseñar estado de exportación en progreso

### Validación
- [ ] No faltan estados críticos de UX

---

## Día 13 — Prototipo interno
- [ ] Crear wireframes rápidos
- [ ] Crear prototipo navegable básico
- [ ] Revisar flujo de escritura completo
- [ ] Ajustar diseño antes del desarrollo fuerte

### Validación
- [ ] El flujo principal está claro antes de programar fuerte

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
- [ ] Crear perfil de usuario
- [ ] Guardar preferencias básicas
- [ ] Guardar estado free/premium
- [ ] Guardar fecha de creación
- [ ] Guardar estado de onboarding

### Validación
- [ ] El usuario ya tiene identidad persistente completa

---

## Día 16 — Protección de rutas
- [ ] Proteger rutas privadas
- [ ] Redirigir usuarios no autenticados
- [ ] Bloquear acceso a proyectos ajenos

### Validación
- [ ] La app no expone rutas privadas

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
- [ ] Bug 1
- [ ] Bug 2
- [ ] Bug 3

## Decisiones tomadas
- [ ] Decisión 1
- [ ] Decisión 2
- [ ] Decisión 3
- [x] Día 3: V1 queda cerrada a `Scene Heading`, `Action`, `Character`, `Dialogue`, `Parenthetical` y `Transition`

## Cosas que NO entrarían en V1
- [ ] Colaboración en tiempo real
- [ ] Anotaciones avanzadas
- [ ] Seguimiento de personajes
- [ ] Producción
- [ ] Features secundarias no esenciales
