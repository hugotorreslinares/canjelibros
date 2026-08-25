# Auditoría de diseño — El Canje

Revisión de interfaz, 25 de agosto de 2026. Solo diagnóstico: **no se corrigió nada**.

## Método y alcance

Revisé la aplicación corriendo en `localhost:3000` a 1280×720 y a 375×812, más el código de cada vista. Medí contrastes, tamaños de área táctil y escala tipográfica sobre el DOM real, no a ojo.

**Lo que no vi renderizado:** mi sesión de navegador no tiene cuenta iniciada, así que Mi estante, Publicar, Mensajes y Moderación los evalué leyendo el código. Esos hallazgos van marcados `(por código)` y conviene confirmarlos en pantalla antes de actuar.

## Diagnóstico en una frase

El problema no es el gusto: es que **no hay sistema**. Hay 62 valores de espaciado distintos, 12 tamaños de letra en una sola pantalla y 17 colores escritos a mano, así que cada vista se ve como un boceto separado. Encima, la interfaz afirma datos que no tiene ("0 km", "Chapinero Alto", "Racha 4"), y eso es lo que la hace sentir barata más que cualquier decisión estética.

---

## 1. Sistema visual: no existe

### 1.1 La escala tipográfica es un charco, no una escala — **Alto**

En la vista de catálogo conviven 12 tamaños: 11, 12, 13, 14, 15, 16, 17, 18, 19, 25, 30 y 52 px. Los pasos de 13/14/15 y 16/17/18/19 son indistinguibles entre sí: no comunican jerarquía, solo delatan que cada componente eligió su número por separado.

Una escala editorial de 5 o 6 pasos con saltos perceptibles haría, sola, la mitad del trabajo de "verse bien".

### 1.2 Espaciado sin ritmo — **Alto**

62 valores de píxel distintos en `src/components/` y `src/lib/ui.ts`: `[8px]` aparece 44 veces, `[14px]` 40, `[15px]` 34, `[17px]` 22, `[13px]` 12, `[19px]` 5. No hay múltiplo común. El ojo lee esa irregularidad como descuido aunque no sepa nombrarla.

### 1.3 Diecisiete colores sin tokens — **Medio**

`#004961 #006786 #0088b0 #1186ac #201e1d #2d2b2b #444141 #605d5d #7d7979 #aa0b56 #cbeeff #d6006c #d7d3d3 #d82071 #eae7e7 #f3f2f2 #f8f4f4`, todos escritos a mano en los componentes. Cuatro grises casi iguales (`#444141`, `#605d5d`, `#7d7979`, `#2d2b2b`) y tres teales. Sin variables no hay forma de cambiar el tono de la marca ni de agregar modo oscuro.

### 1.4 El magenta significa dos cosas opuestas — **Alto**

`#d6006c` es a la vez el color de "Eliminar" ([ShelfView.tsx:172](src/components/ShelfView.tsx)), el de "Reservado", el del contador de mensajes y el del botón **"Marcar intercambio como realizado"** ([ChatView.tsx:139](src/components/ChatView.tsx)). El mismo color dice "peligro, borras algo" y "felicidades, cerraste el canje". El usuario no puede aprender el código de color porque es contradictorio.

---

## 2. Jerarquía y llamados a la acción

### 2.1 El peso visual está invertido en el chat — **Alto**

"Enviar", la acción que se repite cien veces, usa `outlineBtn` (secundaria). "Marcar intercambio como realizado", que es **irreversible** —transfiere los dos libros—, es un botón magenta lleno, el elemento más llamativo de la pantalla. Está al revés: lo frecuente debe ser cómodo, lo irreversible debe costar un poco.

### 2.2 "Proponer intercambio" es una caja débil que parte la palabra — **Alto**

En las tarjetas del catálogo el CTA es un rectángulo con borde fino y texto centrado que **envuelve a dos líneas** ("Proponer / intercambio") en todos los anchos que probé, incluso a 1280 px. Es la acción central del producto y parece un campo de formulario deshabilitado.

### 2.3 El enlace del dueño compite con el CTA — **Medio**

Debajo de las etiquetas, el nombre del lector aparece en azul enlace, justo encima del botón. Dos llamados de peso similar, uno sobre otro, sin distinción de rol.

### 2.4 La página no tiene `<h1>` ni `<main>` — **Medio**

En la vista de mapa —la portada de la aplicación— el encabezado de mayor rango es un `<h2>` ("7 lectores en 3 km") y no existe landmark `<main>`. La estructura del documento no refleja la jerarquía visual.

---

## 3. Layout y responsive

### 3.1 El encabezado se come el 30 % de la pantalla en móvil — **Crítico**

A 375 px de ancho, el `<header>` mide **243 px de alto**: la navegación envuelve en tres filas, "Publicar libro" queda encajado entre "Mi estante" y un separador vertical suelto, e "Iniciar sesión" cae solo en la tercera fila. Sumado al pie, el contenido arranca casi a mitad de pantalla. No hay menú colapsado, barra inferior ni encabezado fijo.

Es lo primero que ve alguien en el teléfono, y es donde la aplicación se ve peor.

### 3.2 El filtro de categorías ocupa una pantalla entera en móvil — **Medio**

Nueve categorías en lista vertical a 32 px de alto cada una, **incluidas las que tienen 0 libros** (Poesía 0, Historia 0, Ciencia 0, Infantil 0, Cómic 0, Oficios 0). Seis de nueve opciones no llevan a ninguna parte y aun así consumen el espacio.

### 3.3 La tarjeta "Tu zona" choca con la atribución del mapa — **Bajo**

En móvil la tarjeta flotante queda pegada al borde inferior del mapa, encima del crédito de Leaflet/OpenStreetMap, que es obligatorio mostrar legible.

### 3.4 El mapa a todo color pelea con la paleta — **Medio**

Las teselas de OpenStreetMap traen verdes, amarillos y rojos saturados dentro de una interfaz de grises cálidos y un teal. El mapa es el elemento más grande de la portada y es el único que no obedece a la marca. Un estilo de teselas neutro (o una capa de desaturación) alinearía las dos mitades de la pantalla.

### 3.5 Las etiquetas de los pines se encaballan — **Alto**

Con cinco lectores en zonas cercanas, las etiquetas permanentes ("Growth Hacker / en línea ahora") se superponen entre sí y con los pines. No hay agrupación por proximidad ni etiqueta bajo demanda. Con veinte lectores el mapa será ilegible.

---

## 4. Honestidad de los datos (lo que más abarata la interfaz)

### 4.1 "0 km" para todo el mundo — **Crítico**

Sin sesión iniciada, `readerDist` devuelve 0 y la interfaz muestra "0 km" junto a cada lector, además de "7 lectores en 3 km" y "ordenados por distancia". El dato no existe y la interfaz lo presenta como cierto. Debería ocultarse o pedir ubicación, nunca inventar un cero.

### 4.2 "Chapinero Alto · radio de 600 m" está escrito a mano — **Alto**

[MapView.tsx:108](src/components/MapView.tsx). Le dice a cualquier visitante que vive en Chapinero Alto.

### 4.3 "Racha: 4" es un número fijo — **Alto**

[ShelfView.tsx:116](src/components/ShelfView.tsx) `(por código)`. Una métrica inventada, presentada con el mismo tamaño de 60 px que los cupos y los intercambios reales.

### 4.4 "0 km" también en la cabecera del chat — **Medio**

`dist: 0` fijo en [use-app-state.ts:999](src/hooks/use-app-state.ts) `(por código)`: el encabezado de la conversación dice "Bogotá · 0 km · en línea ahora".

### 4.5 Todas las calificaciones son ★★★★★ 5 — **Medio**

El promedio por defecto para quien no tiene calificaciones es 5, así que la lista de lectores es una columna de cinco estrellas idénticas. Un indicador que nunca varía es ruido visual: no informa y ocupa una línea en cada tarjeta.

### 4.6 "en línea ahora" / "visto hace 2 h" — **Medio**

`online` se escribe `true` al crear el perfil y no cambia nunca; el "visto hace 2 h" es literal, no calculado.

---

## 5. Estados: faltan los tres importantes

### 5.1 No hay estado de carga — **Alto**

`useReaders()` y `useBooks()` exponen `loading` y `error`, y [use-app-state.ts:95](src/hooks/use-app-state.ts) descarta ambos. Mientras Firestore responde, el usuario ve "0 lectores en 3 km" y un catálogo vacío: la aplicación se ve rota durante el primer segundo, y **exactamente igual de rota** si la conexión falla.

### 5.2 El vacío por filtros y el vacío por error son el mismo — **Medio**

"Nada con esos filtros. Amplía la distancia o cambia de categoría" ([CatalogView.tsx:200](src/components/CatalogView.tsx)) aparece también cuando no hay datos porque la consulta falló.

### 5.3 El aviso se pierde detrás de los modales — **Alto**

`Toast` está en `z-40` ([Toast.tsx:9](src/components/Toast.tsx)) y `modalOverlay` en `z-[1100]` ([ui.ts](src/lib/ui.ts)). Los avisos que se disparan **con un modal abierto** quedan tapados: "Elige cuántas estrellas" al calificar y "Elige uno de tus libros para ofrecer" al proponer un canje. El usuario pulsa el botón, no pasa nada visible y no sabe por qué.

### 5.4 El aviso es el único canal de retroalimentación y dura 3,8 s — **Medio**

Errores de guardado, de permisos y de foto se comunican solo por ahí, sin forma de recuperarlos, sin `aria-live` y sin variante de error (todos son la misma caja negra).

---

## 6. Accesibilidad

Medido sobre el DOM real:

| Comprobación | Resultado |
|---|---|
| Blanco sobre `#0088b0` (botón principal, 18 px) | **4,08:1 — no cumple AA** (requiere 4,5) |
| Marcador de posición `#7d7979` sobre `#f8f4f4` | **3,94:1 — no cumple AA** |
| `#605d5d` sobre `#f3f2f2` | 5,83:1 ✓ |
| `#006786` enlace sobre `#f3f2f2` | 5,72:1 ✓ |
| `#d6006c` sobre `#f3f2f2` | 4,61:1 ✓ (justo) |
| Elementos interactivos bajo 44 px | **42 de 48** |
| `role="dialog"` / `aria-modal` / foco atrapado / cerrar con Escape | **0 de 3 modales** |
| `aria-current` en la navegación | ninguno |
| `aria-live` en los avisos | ninguno |

Detalles que duelen en móvil: los enlaces con el nombre del dueño miden **21 px de alto**; "Iniciar sesión", 26 px; los ítems de navegación, 34 px.

Lo que sí está bien: `:focus-visible` global con contorno de 2 px, `lang="es"`, y los tres modales cierran al pulsar fuera.

---

## 7. Portadas e imágenes

### 7.1 El recuadro es apaisado y los libros son verticales — **Alto**

Las miniaturas son 190×130 en recomendados, 74×106 en la lista y 250×150 en el estante. Una foto de portada es vertical, así que `object-cover` la recorta por la mitad: en el catálogo real se ve una mano y una manzana, sin lomo ni título. El contenedor pelea contra el contenido.

### 7.2 Fotos y placas tipográficas conviven sin puente visual — **Medio**

En la misma fila hay fotos fotográficas y bloques de color plano con el título en 11 px abajo a la izquierda. Son dos lenguajes distintos, y ninguno gana.

### 7.3 Tres de las ocho placas son casi negras — **Medio**

`PLATE_COLORS` incluye `#201e1d`, `#2d2b2b` y `#444141` ([design-utils.ts](src/lib/design-utils.ts)). En la parrilla parecen imágenes que no cargaron, no portadas deliberadas.

### 7.4 El título dentro de la placa es ilegible a 74 px — **Medio**

En la lista del catálogo la placa mide 74 px de ancho y el título va en 11 px: se corta a la segunda palabra. La placa deja de ser informativa y es solo una mancha de color.

---

## 8. Detalles de interacción

- **El chat no baja al último mensaje** `(por código)`: no hay `scrollIntoView` ni ref en [ChatView.tsx](src/components/ChatView.tsx). En una conversación larga, el mensaje recién enviado queda fuera de vista.
- **El carrusel de recomendados no se anuncia como tal**: se desplaza en horizontal sin flechas ni degradado en el borde; en escritorio no hay ninguna pista de que haya más contenido a la derecha.
- **El modal de sesión tiene dos enlaces del mismo peso** ("Crear una cuenta nueva" y "Cancelar") y ningún botón de cerrar en la esquina.
- **No hay página con URL propia**: todo es estado de cliente, así que no se puede compartir un libro, un lector ni las políticas, y el botón "atrás" del navegador sale de la aplicación.

---

## Resumen por prioridad

**Crítico** — se ven en los primeros diez segundos: encabezado móvil de 243 px (3.1), "0 km" en todas partes (4.1).

**Alto** — escala tipográfica y espaciado sin sistema (1.1, 1.2), magenta contradictorio (1.4), jerarquía invertida en el chat (2.1), CTA partido en dos líneas (2.2), pines encaballados (3.5), textos inventados (4.2, 4.3), sin estado de carga (5.1), avisos tapados por los modales (5.3), recorte de portadas (7.1), contraste del botón principal (6).

**Medio y bajo** — el resto: tokens de color, áreas táctiles, semántica de modales, placas oscuras, filtros muertos, estilo del mapa.

## Orden que recomiendo

1. **Definir el sistema antes de tocar una pantalla**: escala tipográfica de 6 pasos, rejilla de espaciado de 4 px, colores como variables CSS con un rol cada uno (marca, peligro, éxito, texto, texto secundario). Sin esto, cualquier arreglo visual vuelve a divergir en la siguiente vista.
2. **Quitar todo dato inventado**, aunque deje huecos. Un hueco honesto se ve mejor que un "0 km" falso.
3. **Rehacer el encabezado en móvil.**
4. **Estados de carga y de error**, y sacar los avisos de debajo de los modales.
5. **Portadas verticales** (relación 2:3) y placas más claras.
6. Accesibilidad: subir el teal del botón principal hasta 4,5:1, áreas táctiles de 44 px, semántica de los modales.

Los puntos 1 a 3 son los que cambian la primera impresión. El resto es lo que la sostiene.
