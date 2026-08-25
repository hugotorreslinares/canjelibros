# Plan de interfaz — shadcn/ui sobre El Canje

Plan para cerrar los hallazgos de [DESIGN-AUDIT.md](DESIGN-AUDIT.md) apoyándonos en shadcn/ui. Cada tarea cita el identificador del hallazgo que cierra (`4.1`, `5.2`, …) para poder verificar al final que no quedó nada suelto.

Estado: **dirección A elegida** («Papel y tinta»). Fases 0 a 4 hechas — ver §7.1.

## 1. La decisión de fondo, antes de instalar nada

shadcn/ui no es una librería de componentes: copia código fuente a tu repositorio y tú lo mantienes. Eso lo hace ideal aquí **por sus primitivas de comportamiento y accesibilidad**, no por su estética.

El riesgo real es el contrario al que parece: si adoptamos el aspecto por defecto de shadcn (esquinas de 10 px, grises neutros, tipografía de interfaz genérica), El Canje pierde lo único que hoy tiene a favor —una voz editorial con serif y esquinas de 2 px— y termina pareciéndose a cualquier panel de administración. La auditoría no pidió otra estética: pidió **un sistema**.

Por eso la regla de este plan:

> Tomamos de shadcn el **comportamiento** (foco atrapado, Escape, `role`, `aria-*`, teclado, portales, z-index) y lo vestimos con los tokens de El Canje. El aspecto por defecto de shadcn no llega a producción en ninguna pantalla.

Dos consecuencias que conviene aceptar ahora:

- **Se rompe la paridad con `design_source/El Canje.dc.html`.** Hoy los valores en píxeles copian ese archivo exacto; a partir de aquí manda la escala. Hay que decidir si el diseño original pasa a ser referencia histórica (mi recomendación) o si seguimos atados a él.
- **`src/lib/ui.ts` desaparece.** Esas cadenas de clases (`primaryBtn`, `chip`, `modalOverlay`…) son un sistema de componentes a medias; se reemplazan por componentes reales con variantes.

## 2. Prerrequisitos

1. **Node ≥ 20 en el shell.** Hoy `node -v` da `v14.21.3` y con eso ni el CLI de shadcn ni `next dev` arrancan. `nvm alias default 20` (o 24) antes de empezar.
2. **Inicialización no interactiva**, con Radix como base:

```bash
npx shadcn@latest init -d --base radix
```

3. Revisar lo que el `init` toca: crea `components.json`, `src/lib/utils.ts` con `cn()`, e **reescribe `src/app/globals.css`**. Nuestro `globals.css` actual tiene el `@keyframes breathe` de los pines y los estilos del marcador de Leaflet: hay que reponerlos después del init.
4. El proyecto es Tailwind v4 sin `tailwind.config.ts`; los tokens viven en `@theme inline` dentro de `globals.css`. En `@theme inline` las fuentes van con **nombre literal**, nunca `var(--font-...)`: la variable que inyecta `next/font` se resuelve en tiempo de ejecución y ahí ya es tarde.
5. No adoptamos `form` (react-hook-form + zod) por ahora: los formularios son pequeños y su estado ya vive en `use-app-state.ts`. Meter otra fuente de verdad para tres campos complica más de lo que resuelve. Sí adoptamos `field`, que es solo la estructura visual etiqueta/descripción/error.

## 3. Fase 0 — El sistema (hallazgos 1.1, 1.2, 1.3, 1.4)

Sin esto, cualquier arreglo posterior vuelve a divergir. Es la única fase que no toca ninguna pantalla.

### Color, con contraste verificado

| Rol | Token | Valor | Contraste |
|---|---|---|---|
| Marca / acción principal | `--primary` | `#00769a` | 5,17:1 con blanco · 4,63:1 sobre papel |
| Marca decorativa (hover, pines) | `--primary-soft` | `#0088b0` | solo superficies, nunca texto |
| Destructivo | `--destructive` | `#aa0b56` | 7,26:1 con blanco |
| Texto | `--foreground` | `#201e1d` | |
| Texto secundario | `--muted-foreground` | `#605d5d` | 5,83:1 |
| Marcador de posición | `--placeholder` | `#5f5b5b` | reemplaza `#7d7979`, que da 3,94:1 |
| Papel / superficie / borde | `--background` `--card` `--border` | `#f3f2f2` `#f8f4f4` `rgba(32,30,29,.16)` | |

El teal actual `#0088b0` da **4,08:1** sobre blanco y por eso el botón principal no cumple AA (`6`). `#00769a` es el ajuste más pequeño que pasa como relleno y como texto.

`--destructive` y `--primary` resuelven el hallazgo `1.4`: el magenta deja de significar «cerrar canje» y queda solo para acciones destructivas. **«Marcar intercambio como realizado» pasa a `primary`**, que es lo que es: una confirmación, no un borrado.

`--radius: 2px`, conservando la esquina viva del diseño original.

### Tipografía: seis pasos, no doce

| Paso | Tamaño | Uso |
|---|---|---|
| `display` | 44 px (fluido hasta 52) | título de vista |
| `title` | 28 px | encabezado de sección |
| `subtitle` | 21 px | título de libro en tarjeta |
| `body` | 17 px | texto corrido |
| `small` | 15 px | metadatos, pie de tarjeta |
| `label` | 12 px, versalitas con `letter-spacing` | rótulos |

Hoy conviven 11, 12, 13, 14, 15, 16, 17, 18, 19, 25, 30 y 52 px en una sola pantalla. Cualquier tamaño fuera de esta tabla es un error a partir de la fase 0.

Dos familias: **Source Serif 4** para lectura y títulos (la voz que ya tiene la aplicación) y una monoespaciada para cifras, distancias y contadores, donde `tabular-nums` importa.

### Espaciado: múltiplos de 4

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Hoy hay 62 valores distintos, con 13, 14, 15, 17 y 19 px conviviendo. Un `eslint` o una revisión manual debería rechazar valores arbitrarios nuevos.

**Hecho cuando:** los tokens están en `globals.css`, `src/lib/ui.ts` está vacío de colores literales y ninguna vista importa un hex a mano.

## 4. Componentes de shadcn que reutilizamos

| Componente | Reemplaza | Cierra |
|---|---|---|
| `button` | `primaryBtn`, `outlineBtn`, `smallOutlineBtn`, `smallPrimaryBtn`, `linkBtn` de `ui.ts` | 2.1, 2.2, 6.1 |
| `dialog` | los tres modales escritos a mano (`AuthModal`, `OfferModal`, `RatingModal`) | 6.2, 8.3 |
| `alert-dialog` | `window.confirm` + `window.prompt` de moderación y borrado de estante | 6.2 |
| `sonner` | `Toast.tsx` | 5.2, 5.3 |
| `skeleton` + `spinner` | nada: hoy no existe estado de carga | 5.1 |
| `empty` | el vacío de catálogo, estante y bitácora | 5.4 |
| `alert` | estado de error, que hoy no se distingue del vacío | 5.1, 5.4 |
| `input`, `textarea`, `label`, `field` | campos de publicar, moderar y sesión | 6.2 |
| `input-group` | el compositor del chat (campo + enviar) | 2.1 |
| `badge` | `tagPill`, `condPill` | 1.3 |
| `toggle-group` | chips de estado, categoría e intereses | 6.1 |
| `select` o `native-select` | selector de orden del catálogo | 6.1 |
| `slider` | radio de distancia | 6.1 |
| `sheet` | navegación móvil colapsada | 3.1 |
| `separator` | los `divider` a mano | 1.2 |
| `aspect-ratio` | recuadros de portada | 7.1 |
| `carousel` | fila de recomendados, con flechas y estado de desplazamiento | 8.2 |
| `tabs` | panel de moderación: publicaciones / bitácora | — |
| `table` | bitácora de moderación | — |
| `item` | filas de catálogo y de conversaciones | 1.2 |
| `message`, `bubble`, `marker`, `message-scroller` | la lista de mensajes del chat | 8.1 |

Sobre el conjunto de chat: `message-scroller` es un contenedor con `role="log"` y `aria-relevant="additions"` que sigue el borde vivo de la conversación y suelta el seguimiento cuando el usuario sube a leer. Es exactamente el hallazgo `8.1`, ya resuelto y probado por otros.

**Ojo con el nombre `marker`:** en shadcn es un separador de eventos dentro de una conversación, **no** un pin de mapa. El pin de Leaflet lo construimos nosotros (§5.4).

**Qué NO tomamos:** `card`. La identidad de El Canje es de reglas finas y filetes, no de tarjetas con sombra; apilar `Card` dentro de `Card` es justo el aspecto genérico que queremos evitar. `avatar` tampoco: los lectores no tienen foto de perfil y no vamos a inventarla.

Instalación de una sola vez, una vez aprobado el plan:

```bash
npx shadcn@latest add button dialog alert-dialog sonner skeleton spinner empty alert input textarea label field input-group badge toggle-group select slider sheet separator aspect-ratio carousel tabs table item message bubble marker message-scroller
```

## 5. Componentes que hay que crear

Ninguno de estos existe en shadcn: son el dominio de la aplicación. Todos se apoyan en las primitivas de arriba y viven en `src/components/`, no en `src/components/ui/`.

### 5.1 `BookCover` — reconstruir el que ya existe

Sobre `aspect-ratio` en proporción **2:3**, que es la de un libro. Hoy los recuadros son apaisados (190×130, 74×106, 250×150) y el recorte centrado se come el título.

```tsx
<BookCover cover={string | null} title={string} size="sm" | "md" | "lg" />
```

Sin foto, delega en `TypePlate`. Cierra `7.1`.

### 5.2 `TypePlate` — la portada tipográfica

Placa de color con el título compuesto de verdad: tamaño según el ancho disponible, no 11 px fijos que se cortan en la segunda palabra. Paleta nueva sin los tres tonos casi negros (`#201e1d`, `#2d2b2b`, `#444141`) que hoy se leen como imágenes rotas. Cierra `7.2`, `7.3`, `7.4`.

### 5.3 `CoverField` — subir la foto

Envuelve `field` + `button` + la compresión que ya existe en `src/lib/image.ts`. Estados: vacío, procesando (`spinner`), con foto (previsualización + quitar), error (`alert` en línea, no un aviso que se va en 3,8 s). Evaluar si `attachment` del registro sirve de base; si no encaja, es propio.

### 5.4 `ReaderMarker` y `MarkerCluster` — los pines del mapa

`divIcon` de Leaflet con nuestros tokens. La etiqueta con el nombre deja de ser permanente: aparece al pasar el cursor, al enfocar con teclado y en el pin seleccionado. Agrupación por proximidad cuando dos pines se solapan a la escala actual. Cierra `3.3`.

### 5.5 `DistanceLabel` — el que arregla la mentira

Recibe `km: number | null`. Con `null` **no muestra nada** y ofrece «activa tu ubicación». Nunca imprime `0 km`. Se usa en mapa, catálogo y cabecera del chat, que son los tres sitios donde hoy aparece el cero inventado. Cierra `4.1` y la mitad de `4.5`.

### 5.6 `PresenceDot` — estado real o nada

Solo pinta «en línea» si hay un `lastSeenAt` reciente. Sin ese dato, no dice nada: se acabó el «visto hace 2 h» literal. Cierra `4.5`. Depende de que el perfil escriba un latido, que es tarea de datos, no de interfaz (ver [PLAN.md](PLAN.md) P0 #2).

### 5.7 `SlotMeter` y `StatBlock` — el estante

`SlotMeter` son los cupos como marcas, con texto alternativo real («3 de 5 cupos usados»), no seis `div` decorativos. `StatBlock` unifica las cifras grandes del estante y **elimina la tarjeta de racha**, que hoy muestra un 4 constante con el mismo peso que los datos verdaderos. Cierra `4.3`.

### 5.8 `StarRating` — calificar con teclado

Sobre `radio-group`: cinco opciones reales, navegables con flechas, con etiqueta accesible. Hoy son cinco botones sueltos sin agrupar. Aprovechamos para decidir qué pasa con las etiquetas de calificación, que se recogen y se descartan.

### 5.9 `AppShell`, `SiteHeader`, `MobileNav` — el encabezado

El hallazgo crítico `3.1`: 243 px de alto en móvil, tres filas de navegación. Debajo de `md`, la navegación se colapsa en un `sheet` con un disparador de 44 px; el encabezado queda en una sola fila y se vuelve fijo. El `AppShell` aporta además el landmark `<main>` que hoy no existe y el `aria-current` de la vista activa. Cierra `3.1`, `2.4`, parte de `6.2`.

### 5.10 `QueryState` — carga, error y vacío en un solo sitio

```tsx
<QueryState loading={…} error={…} isEmpty={…} skeleton={<BookGridSkeleton />} empty={…}>
```

Envuelve catálogo, mapa, estante y bitácora. Hoy `useReaders()` y `useBooks()` exponen `loading` y `error` y `use-app-state.ts:95` los tira, así que cargando y roto se ven igual: un catálogo vacío. Cierra `5.1` y `5.4`.

### 5.11 `ReasonDialog` — moderar con motivo

`alert-dialog` + `textarea`, en reemplazo del `window.prompt` que hoy pide el motivo de una eliminación. El navegador no deja estilar ese diálogo, no es accesible y se pierde en móvil.

### 5.12 `ThreadListItem` y `MessageComposer`

Sobre `item` e `input-group`. El compositor invierte el peso actual: «Enviar» pasa a ser el botón fuerte del bloque, y «Marcar intercambio como realizado» baja a secundario con confirmación por `alert-dialog`, porque transfiere los dos libros y no se puede deshacer. Cierra `2.1`.

### 5.13 `BookCard` y `BookRow`

Las dos presentaciones del catálogo. El llamado a la acción deja de partirse en dos líneas: texto más corto («Proponer canje») y ancho mínimo calculado, no un rectángulo que envuelve. El nombre del dueño baja a metadato y deja de competir con el botón. Cierra `2.2` y `2.3`.

## 6. Tarea estructural, fuera de componentes

Rutas reales de Next para al menos `/politicas`, `/catalogo` y `/libro/[id]` (hallazgo `8.4`). Hoy todo es estado de cliente en una sola URL: no se puede compartir un libro ni citar las políticas, y el botón «atrás» saca de la aplicación. Es la tarea más invasiva del plan porque toca `use-app-state.ts`, y por eso va al final: conviene hacerla cuando los componentes ya estén estables.

## 7. Orden de trabajo

| Fase | Contenido | Cierra | Tamaño |
|---|---|---|---|
| 0 | Tokens, escala, espaciado, `init` de shadcn | 1.1–1.4, 6 (contraste) | M |
| 1 | `button`, `badge`, `separator`, `item` y barrido de `ui.ts` | 2.2, 2.3, 6.1 | M |
| 2 | `AppShell` + `SiteHeader` + `MobileNav` | 3.1, 2.4 | M |
| 3 | `sonner`, `QueryState`, `empty`, `alert`, `skeleton` | 5.1–5.4 | M |
| 4 | Los tres modales a `dialog` / `alert-dialog` + `ReasonDialog` | 6.2, 8.3 | M |
| 5 | `DistanceLabel`, `PresenceDot`, `StatBlock` (fuera la racha) | 4.1–4.5 | S |
| 6 | `BookCover`, `TypePlate`, `CoverField`, `carousel` | 7.1–7.4, 8.2 | L |
| 7 | Chat: conjunto `message-*`, `MessageComposer` | 8.1, 2.1 | M |
| 8 | `ReaderMarker` + agrupación de pines | 3.3 | L |
| 9 | Rutas reales de Next | 8.4 | L |

Las fases 0 a 3 son las que cambian la primera impresión. De la 4 en adelante es lo que la sostiene.

### 7.1 Estado al 25 de agosto de 2026

**Fases 0 a 4 hechas.** `shadcn init` con base Radix; tokens de la dirección A en `globals.css` (escala de seis pasos, rejilla de 4 px, radio de 2 px, Source Serif 4 + Archivo); `src/lib/ui.ts` eliminado y sin consumidores; encabezado de una sola fila con `sheet` en móvil, `<main>` y `aria-current`; `sonner` en lugar del aviso propio; `QueryState` con esqueleto, error y vacío en catálogo y panel de lectores; los tres modales sobre `dialog` y los borrados sobre `alert-dialog`.

Hallazgos cerrados: 1.1–1.4, 2.1–2.4, 3.1, 3.2, 4.1–4.5, 5.1–5.4, 6.1, 6.2, 8.1 (versión provisional), 8.3, y el contraste del botón principal.

Medido en catálogo y mapa: encabezado móvil de **65 px** (eran 243), **seis** tamaños de letra (eran doce), **cero** elementos propios bajo 44 px, y ningún «0 km» inventado.

**Pendiente:**

- **Fase 6** — portadas: las placas tipográficas siguen con tres tonos casi negros que parecen imágenes rotas (7.2) y el título dentro de la placa se corta a 74 px (7.3). El recuadro ya es 2:3.
- **Fase 7** — el chat baja al último mensaje con un `scrollIntoView` provisional; falta `message-scroller`, que además suelta el seguimiento cuando el lector sube a releer.
- **Fase 8** — pines del mapa: las etiquetas siguen encaballándose (3.3).
- **Fase 9** — rutas reales de Next (8.4).
- Fuera de interfaz, y bloqueando 4.5 del todo: el latido de presencia y el conteo de canjes del otro lado, que están en [PLAN.md](PLAN.md).

## 8. Cómo verificamos cada fase

Además de `npx tsc --noEmit && npx eslint .` y `npm run build`, la auditoría dejó números medibles. Sirven de criterio de aceptación, no de opinión:

| Métrica | Hoy | Meta |
|---|---|---|
| Valores de espaciado distintos | 62 | ≤ 10 |
| Tamaños de letra en una pantalla | 12 | ≤ 6 |
| Hex escritos a mano en componentes | 17 | 0 |
| Elementos interactivos bajo 44 px | 42 de 48 | 0 en móvil |
| Alto del encabezado a 375 px | 243 px | ≤ 72 px |
| Contraste del botón principal | 4,08:1 | ≥ 4,5:1 |

Se miden con el mismo método de la auditoría: sobre el DOM real, en el navegador, a 1280×720 y 375×812.

## 9. Riesgos

- **El `init` pisa `globals.css`.** Hay que reponer `@keyframes breathe` y los estilos de `.leaflet-div-icon`. Conviene hacer el init en una rama limpia y revisar ese archivo a mano.
- **Peso.** Radix suma dependencias a una aplicación que hoy solo carga Firebase y Leaflet. Vale la pena por accesibilidad, pero conviene medir el bundle antes y después de la fase 4.
- **Deriva estética.** Cada componente que se copia trae el aspecto por defecto de shadcn. Si no se re-viste en la misma sesión en que se instala, la aplicación termina siendo mitad editorial y mitad panel genérico, que es peor que cualquiera de las dos.
- **Las fases 5 y 6 dependen de datos, no de interfaz.** `PresenceDot` necesita un latido en el perfil y `DistanceLabel` necesita ubicación pedida de verdad. Sin ese trabajo de datos, los componentes solo dejan huecos honestos donde antes había cifras falsas, que ya es mejora, pero no es la versión completa.
