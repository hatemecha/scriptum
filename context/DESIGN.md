# Diseno de Producto y UI de SCRIPTUM

## 1. Proposito

SCRIPTUM existe para ayudar a escribir guiones cinematograficos sin friccion.

El diseno del producto debe sostener una promesa central:

> abrir la app, abrir un guion y empezar a escribir de inmediato con formato profesional por defecto.

Si una decision de interfaz interrumpe el flujo creativo, compite con el texto o agrega complejidad innecesaria, va en contra del producto.

---

## 2. North Star del diseno

> El editor debe desaparecer para que el guion aparezca.

SCRIPTUM no debe sentirse como un panel tecnico ni como una suite de produccion.
Debe sentirse como un espacio de escritura claro, moderno, estable y confiable.

---

## 3. Principios de diseno

- Simplicidad antes que cantidad de features.
- Formato profesional por defecto, sin depender del usuario.
- Flujo de teclado primero.
- Claridad visual por encima del adorno.
- Consistencia en interacciones, bloques y estados.
- Ayuda opcional para principiantes, sin molestar a usuarios avanzados.
- Foco en escribir, no en configurar.

---

## 4. Objetivo del MVP

La primera version debe resolver una sola tarea extremadamente bien:

> escribir un guion completo y exportarlo en PDF con formato profesional.

El MVP debe incluir:

- Editor de guion funcional.
- Formato automatico.
- Navegacion basica por escenas.
- Exportacion a PDF profesional.
- Base para escribir sin internet.

El MVP no debe priorizar:

- Colaboracion en tiempo real.
- Anotaciones complejas.
- Seguimiento de personajes.
- Herramientas de produccion.
- Personalizacion visual excesiva.

---

## 5. Usuarios objetivo y consecuencias de UX

| Usuario | Necesidad principal | Respuesta de diseno |
| --- | --- | --- |
| Principiantes | Entender como se escribe un guion sin perderse | Interfaz limpia, guia opcional, glosario opcional, feedback claro |
| Estudiantes de cine | Aprender formato profesional rapido | Estructura visible, reglas consistentes, navegacion por escenas |
| Guionistas | Velocidad y precision | Atajos confiables, transiciones automaticas, minima friccion |
| Escritores casuales | Empezar sin curva de aprendizaje alta | Pocos pasos, estados obvios, lenguaje simple |

La experiencia debe adaptarse sin partirse en dos productos distintos.
La complejidad debe estar oculta por defecto y disponible solo cuando aporta valor.

---

## 6. Personalidad del producto

SCRIPTUM debe sentirse como:

- Minimalista.
- Claro.
- Profesional.
- Amable.
- Sobrio.
- Moderno.

SCRIPTUM no debe sentirse como:

- Un dashboard empresarial.
- Una app recargada.
- Un editor experimental.
- Una herramienta nostalgica o retro.
- Un software "para expertos solamente".

La voz del producto debe ser breve, tranquila y precisa.
El tono de ayuda debe acompanar, no infantilizar.

---

## 7. Experiencia principal

La secuencia ideal es:

1. El usuario entra a la app.
2. Ve sus proyectos o crea uno nuevo sin friccion.
3. Abre el guion.
4. El cursor ya esta listo para escribir.
5. El sistema resuelve formato y transiciones de bloque.
6. La sidebar permite saltar entre escenas.
7. El usuario exporta un PDF profesional sin tocar opciones avanzadas.

La sensacion general debe ser de continuidad.
La app no debe obligar al usuario a "administrar" el documento para poder escribir.

---

## 8. Arquitectura de pantallas

### Pantallas del producto

- Landing basica.
- Login.
- Registro.
- Lista de proyectos.
- Editor principal.
- Ajustes minimos.
- Modal o flujo de exportacion.

### Pantalla mas importante: el editor

El editor es el centro absoluto del producto.
Todas las decisiones visuales deben subordinarse a esa pantalla.

La estructura base recomendada para desktop es:

- Header superior discreto con nombre del proyecto, estado de guardado y accion de exportar.
- Sidebar izquierda con escenas.
- Lienzo central de escritura.
- Paneles secundarios ocultos por defecto o mostrados solo cuando sean necesarios.

No debe existir una barra de herramientas invasiva fija sobre el area de escritura.

---

## 9. Layout del editor

### Zonas

#### 9.1 Sidebar de escenas

- Debe permitir ver el mapa general del guion.
- Debe ser rapida de escanear.
- Debe priorizar nombres de escena y orden.
- Debe poder colapsarse para modo foco.

#### 9.2 Lienzo de escritura

- Debe ser el elemento mas importante de la pantalla.
- Debe tener ancho y ritmo visual cercanos a una pagina de guion.
- Debe sentirse limpio, estable y silencioso.
- Debe evitar marcos, adornos y ruido visual.

#### 9.3 Header o barra de estado

- Debe ser baja en jerarquia visual.
- Solo muestra lo necesario: proyecto, guardado, sincronizacion, exportacion.
- No debe competir con el documento.

### Prioridades de layout

- El texto siempre manda.
- La navegacion acompana, no lidera.
- Las herramientas viven en segundo plano.
- El espacio en blanco es parte funcional del producto.

---

## 10. Modelo de escritura

SCRIPTUM trabaja con bloques estructurados.

Tipos de bloque del MVP:

- `Scene Heading`
- `Action`
- `Character`
- `Dialogue`
- `Parenthetical`
- `Transition`

Referencia cerrada para reglas, alcance y exclusiones:

- [SCREENPLAY_BLOCKS_V1.md](SCREENPLAY_BLOCKS_V1.md)
- [SCREENPLAY_WRITING_RULES_V1.md](SCREENPLAY_WRITING_RULES_V1.md)

Reglas de producto para el editor:

- Cada bloque tiene un tipo claro y una funcion concreta.
- No hay texto libre con estilos arbitrarios.
- No se permite mezclar formatos.
- El sistema sugiere el siguiente bloque correcto.
- `Enter` avanza el flujo natural.
- `Tab` cambia el tipo de bloque.
- `Shift + Tab` revierte el cambio.
- Pegar contenido debe normalizarse al modelo del documento.
- Los errores de formato deben prevenirse antes de aparecer en el PDF.

El usuario debe sentir que escribe, no que configura nodos o componentes.

---

## 11. Direccion visual

La direccion visual debe derivar del producto, no imponer una estetica ajena.

### Palabras clave

- Editorial.
- Minimal.
- Calma.
- Concentracion.
- Confianza.
- Precision.

### Lo que se debe evitar

- Interfaces oscuras y dramaticas como identidad obligatoria.
- Efectos llamativos que compitan con el texto.
- Exceso de bordes, paneles y contenedores.
- Iconografia decorativa de cine.
- Apariencia de software antiguo.

### Direccion recomendada para el MVP web

Una estetica "paper-first" y luminosa:

- Fondo general calido y neutro.
- Superficies suaves, con contraste moderado.
- Lienzo del guion cercano al papel.
- Acento de color sobrio y funcional.
- Jerarquia marcada por espaciado, tono y tipografia, no por ruido grafico.

Esta direccion encaja mejor con la promesa de claridad, simpleza y escritura sin friccion.

---

## 12. Sistema visual base

### Color

El sistema de color debe ser discreto.
La paleta debe ayudar a leer y orientarse, no a "vender" energia.

Tokens sugeridos para MVP:

- `background`: fondo general calido y muy claro.
- `surface`: superficies de interfaz.
- `paper`: fondo del documento o canvas de escritura.
- `foreground`: texto principal.
- `muted`: texto secundario y metadata.
- `accent`: foco, links y accion primaria.
- `success`: guardado, sincronizado, exportacion correcta.
- `warning`: estados intermedios o atencion suave.
- `danger`: errores y bloqueos.
- `border-subtle`: separaciones minimas cuando hagan falta.

Referencia cromatica sugerida:

- `background`: `#f4efe8`
- `surface`: `#fbf8f4`
- `paper`: `#fffdf9`
- `foreground`: `#1c1a18`
- `muted`: `#6a645c`
- `accent`: `#284c7a`
- `success`: `#2f6b4f`
- `warning`: `#9a6a1d`
- `danger`: `#a23d3d`
- `border-subtle`: `#d8d1c8`

El modo oscuro puede existir mas adelante, pero no debe condicionar el MVP.

### Tipografia

La tipografia debe separar claramente interfaz y contenido.

- UI: sans serif limpia, legible y sobria.
- Editor: tipografia asociada al estandar de guion, idealmente `Courier Prime` o equivalente.

Reglas:

- La UI no debe parecer literaria ni decorativa.
- El guion si debe comunicar formato profesional.
- Los titulos de interfaz deben ser sobrios.
- La legibilidad debe ser prioritaria por encima del estilo.

### Espaciado

El sistema debe apoyarse en un ritmo consistente:

- Base recomendada: escala de 4, 8, 12, 16, 24, 32 y 48 px.
- El editor debe respirar mas que el resto de la app.
- La densidad visual debe ser baja.

### Bordes y radios

- Bordes solo cuando aporten claridad real.
- Separaciones preferentemente por espaciado y tono.
- Radios moderados, sin exageracion.

---

## 13. Componentes base

### Boton

- Primario sobrio y claro.
- Secundario de bajo protagonismo.
- Estados visibles de hover, focus, disabled y loading.

### Input

- Legible.
- Con foco claro.
- Sin apariencia pesada.
- Con mensajes de error concretos.

### Modal

- Solo para acciones puntuales como exportacion o confirmaciones.
- No debe usarse para flujos largos.

### Toast o feedback breve

- Debe confirmar eventos como guardado, exportacion o error simple.
- Debe desaparecer sin interrumpir.

### Sidebar item

- Debe ser facil de escanear.
- Debe indicar seleccion activa con claridad.
- Debe soportar nombres largos sin romper layout.

### Estado de bloque en editor

- El tipo de bloque debe ser comprensible.
- El cambio de bloque debe sentirse natural.
- La UI del bloque debe ser casi invisible mientras se escribe.

---

## 14. Estados del producto

Los estados deben ser parte del diseno desde el inicio.

Estados minimos obligatorios:

- Vacio.
- Cargando.
- Error.
- Sin conexion.
- Guardando.
- Sincronizado.
- Exportando.
- Exportado.

Reglas:

- El estado nunca debe dejar al usuario adivinando.
- Los mensajes deben explicar que esta pasando y que puede hacer.
- "Guardando" y "sincronizado" deben ser visibles pero discretos.
- El modo offline debe dar tranquilidad, no alarma.

---

## 15. Ayuda para principiantes

SCRIPTUM debe poder acompanar a quien no conoce el formato sin molestar a quien ya lo domina.

Patrones recomendados:

- Glosario opcional de terminos cinematograficos.
- Ayudas contextuales no intrusivas.
- Microcopy claro en estados vacios.
- Explicaciones breves del tipo de bloque cuando sea necesario.

Patrones a evitar:

- Tours largos obligatorios.
- Tooltips permanentes.
- Bloqueos por tutorial.

---

## 16. Responsive y plataformas

Orden de prioridad del producto:

1. Web.
2. Desktop.
3. Mobile.

Consecuencia de diseno:

- El MVP debe optimizarse para desktop y laptop.
- Tablet puede ser usable si el layout se adapta bien.
- Mobile no debe definir la experiencia principal del editor.

En pantallas pequenas:

- La sidebar debe poder ocultarse.
- El foco debe quedar en el documento.
- Las acciones clave deben seguir accesibles.

---

## 17. Accesibilidad

Requisitos minimos:

- Navegacion total por teclado.
- Estados de foco visibles.
- Contraste suficiente.
- Tamano de texto confortable.
- Mensajes de error claros.
- Roles y labels correctos en componentes interactivos.

La accesibilidad no es extra.
Es parte de la promesa de claridad y facilidad de uso.

---

## 18. Reglas de implementacion

Para traducir este diseno a frontend:

- Mantener componentes pequenos y reutilizables.
- Separar UI, logica y modelo del documento.
- Evitar dependencias visuales innecesarias.
- Validar estados y errores desde el principio.
- Priorizar consistencia entre editor, sidebar y exportacion.

Toda decision visual debe ayudar a sostener:

- rapidez,
- claridad,
- estabilidad,
- formato profesional.

---

## 19. Guardrails del producto

No hacer:

- Agregar features que no mejoren la escritura.
- Sobrecargar la UI con controles visibles siempre.
- Permitir estilos libres que rompan el formato.
- Introducir incoherencias entre editor y PDF.
- Disenar la app como si fuera una suite de produccion.

Si hay dudas entre "mas opciones" y "menos friccion", elegir menos friccion.

---

## 20. Criterio de exito

El diseno de SCRIPTUM sera correcto si:

- un usuario nuevo puede empezar a escribir en minutos,
- un usuario experimentado puede mantener las manos en el teclado,
- el flujo no se rompe por decisiones de interfaz,
- la navegacion por escenas ahorra tiempo real,
- el PDF final representa un guion profesional,
- la app se siente simple sin verse amateur.

---

## 21. Resumen ejecutivo

SCRIPTUM no necesita una estetica llamativa ni una identidad compleja.
Necesita un sistema de diseno centrado en una idea simple:

> escribir guiones de forma profesional, moderna y sin friccion.

Todo lo que entre en conflicto con eso debe quedar fuera del MVP.
