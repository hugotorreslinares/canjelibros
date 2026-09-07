# Pendientes de diseño — Librocambio

Estado a 3 de septiembre de 2026, versión 0.4.0. Continúa [DESIGN-AUDIT.md](DESIGN-AUDIT.md)
(la auditoría original) y [UI-PLAN.md](UI-PLAN.md) (el plan que la respondió, ya
ejecutado). Aquí solo va lo que sigue abierto, medido sobre el código y sobre la
aplicación desplegada, no sobre impresiones.

## Si solo se hacen tres cosas

1. ~~Terminar la migración al sistema de diseño.~~ **Hecho** el 3 de septiembre.
2. ~~Dejar de inventar reputación y distancia.~~ **Hecho** el 3 de septiembre.
3. ~~Dar URL propia a cada libro.~~ **Hecho** el 4 de septiembre.

---

## 1. Sistema de diseño

**Migrado el 3 de septiembre de 2026.** `MapView`, `ModerationView`, `PoliciesView`
y `LeafletMap` pasaron a tokens, a los seis pasos de tipografía y a la rejilla de
4 px. Los colores escritos a mano bajaron de **52 a 3** y los tamaños de texto
arbitrarios de **69 a 12**. `DistanceLabel` ya se usa en los cuatro sitios donde
se escribe una distancia, y `Reputation` centraliza las estrellas.

Lo que queda no es deuda sino composición, y conviene que siga así:

- [ ] Dejarlo escrito en `AGENTS.md`: la escala gobierna la tipografía de
      interfaz, no las composiciones. Las placas de `BookCover` (12/17/24 px con
      su crema), el logotipo del encabezado (21/26/30 px), el selector de
      estrellas y el numeral de intercambios son piezas dibujadas, y forzarlas a
      la escala las empeora. Sin esa frase, el próximo que cuente creerá que
      siguen siendo deuda.

## 2. Decisiones que quedaron a medias

- [ ] **La paleta oscura completa es código muerto.** `globals.css` define unos
      veinte tokens bajo `.dark` y **nada en la aplicación aplica esa clase**.
      Peor: `layout.tsx` declara `colorScheme: "light dark"`, así que quien tiene
      el sistema en oscuro recibe controles de formulario y barras de scroll
      oscuros sobre una página crema. Hay que elegir: activarlo de verdad
      (respetando `prefers-color-scheme` y con conmutador) o quitar la paleta y
      la declaración. Lo que no se sostiene es el estado actual.
- [ ] **Los enlaces del encabezado miden 26 px de alto** (unos 35 con el tamaño
      de letra por defecto), bajo el mínimo de 44 que el propio sistema
      documenta. Todos los demás objetivos táctiles ya cumplen; estos no, y
      subirlos cambia la altura del encabezado, así que es una decisión de
      diseño, no un parche.

## 3. Confianza

**Resuelto el 3 de septiembre.** El promedio de calificaciones devuelve `null` en
vez de 5, así que quien no tiene calificaciones lo dice en lugar de lucir cinco
estrellas; de nueve lectores, dos tienen reputación real. Y la distancia se
escribe según la escala —«en tu misma zona», «a menos de 1 km», «a 3,4 km», «a
8.477 km»— en vez de publicar el resultado crudo de la fórmula.

## 4. Usabilidad del canje

- [ ] **No existe «aceptar una oferta».** El ciclo va de proponer a confirmar el
      encuentro; no hay estado intermedio, así que no se puede elegir entre
      varias ofertas ni rechazar ninguna. Analizado a fondo en la conversación:
      exige decidir si la oferta pasa a ser una colección propia o se parchea el
      hilo actual, y una regla nueva de Firestore.
- [x] ~~**No se puede rechazar.**~~ Hecho el 4 de septiembre: el mismo botón
      sirve para rechazar y para retirar, cierra el hilo, avisa por él y libera
      el libro reservado.
- [x] ~~**No hay búsqueda.**~~ Hecha el 4 de septiembre, por título y autor,
      indiferente a tildes y mayúsculas.
- [ ] **La identidad del lector es delgada.** Sin foto ni marca personal, todos
      los perfiles se ven iguales, y hay que confiar en alguien para quedar con
      él en persona.

## 5. Atractivo

- [x] ~~**Cada libro necesita su página.**~~ Hecha el 4 de septiembre en
      `/libro/[slug]`, con lectura desde el servidor y regeneración cada hora. El
      contenido va ahora en el HTML servido, así que el trabajo de SEO por fin
      alcanza a los libros. Se indexa solo lo que tiene descripción de verdad
      (60 caracteres): de nueve fichas, seis. Queda pendiente que la ficha
      permita proponer el canje sin volver al catálogo.
- [ ] **La marca no está terminada.** El logotipo es solo texto; el ícono de la
      aplicación es una «L» y la imagen para compartir sale en la sans de
      repuesto de Satori, no en la Source Serif de la marca. Falta incrustar la
      fuente en esas rutas y dibujar un signo, aunque sea mínimo.
- [x] ~~**Las placas tipográficas son la mitad del catálogo.**~~ Hecho el 4 de
      septiembre: cuerpo del título según su longitud, filete doble de la casa
      como sello, y grano de papel en CSS. De paso se arregló que el color salía
      de siete cálculos distintos y el mismo libro cambiaba de portada según la
      vista.
- [ ] **La fila del catálogo tiene poca jerarquía.** Portada, título, autor,
      descripción, etiquetas, dueño, distancia, estrellas y botón compiten casi
      al mismo peso.
- [x] ~~**La aparición al hacer scroll no escalona.**~~ Hecho el 4 de septiembre:
      60 ms de desfase, de arriba abajo, con tope de cuatro escalones.
- [ ] **Faltan estados de primer uso.** Hay estados de carga, error y vacío
      genéricos, pero no un recorrido pensado para quien llega sin libros, que es
      exactamente quien decide si se queda.

---

## Lo que ya está resuelto y no hay que volver a mirar

Sistema de tokens y seis pasos de tipografía; contraste AA en primario y
destructivo; 44 px en todos los objetivos táctiles salvo los enlaces del
encabezado; modales sobre Dialog con foco atrapado; estados de carga, error y
vacío; URL propia por vista con 404 real; agrupación de pines; metadatos, sitemap
y JSON-LD; aparición al hacer scroll; ancho máximo en pantallas grandes; y la
maquetación ya no depende del tamaño de letra del navegador.

---

## 6. Rediseño editorial de la portada (6 de septiembre de 2026)

A partir de un documento de especificación externo (`librocambio-redesign-spec.md`,
aportado por el usuario) para transmitir "una comunidad local de lectores donde los
libros encuentran un nuevo lector" — editorial, cálido, con la proximidad como
argumento visual. Implementado y verificado en build + navegador contra datos reales
de Firestore; **queda pendiente el resultado de una revisión adversarial en curso**
(workflow en segundo plano) al momento de escribir esto.

### Hecho

- Paleta editorial cálida completa (marfil, terracota, azul tinta, verde apagado,
  gris suave), en luz y oscuro, con contraste WCAG calculado y verificado (no
  supuesto): terracota/marfil 4,70:1, terracota/blanco 5,17:1, azul-tinta/marfil
  8,82:1, negro/marfil 16,32:1. `--accent-warm` se alinea al nuevo `--primary` para
  no tener dos acentos cálidos casi iguales compitiendo.
- Tipografía: Playfair Display como `--font-display` (nuevo, séptima excepción a los
  seis pasos — reservada a titulares grandes, igual que `--text-hero`), Manrope
  reemplaza a Archivo como `--font-sans`, Source Serif 4 sigue siendo la serif de
  lectura.
- Header: CTA "Publicar libro" ya sale en terracota por los tokens; rótulo
  "Catálogo"→"Explorar"; algo más de aire vertical (68px).
- Hero: copy nuevo ("Cambia libros. Descubre historias."), CTAs reasignados
  (primario = explorar catálogo, secundario = publicar — el mapa se mudó a su propia
  invitación más abajo), caption "Bogotá · N libros en circulación" bajo la pila de
  portadas.
- Nueva sección **"Cerca de ti"** (`NearbyBooks.tsx`) entre el hero y el catálogo,
  con un derivado propio en el hook (`nearby`, ordenado por distancia real, no por
  interés) — distinto del carrusel existente de recomendados, que se conserva sin
  tocar. Sin ubicación, el título cae a "Recién publicados" en vez de fingir
  cercanía que no se puede medir — mismo principio que ya regía `DistanceLabel`.
- Catálogo: buscador grande con ícono, filtros como barra horizontal con `Popover`
  (categoría/estado/distancia/orden) en vez de la columna fija de 230px, un botón
  "Filtros · N" con drawer (`Sheet` de abajo) en móvil, copia del contador sin jerga
  ("9 libros esperando un nuevo lector" / "5 de 9 libros con estos filtros" / "1 de 9
  coinciden con «X»" según el caso), condición como punto+etiqueta
  (`BookCondition.tsx`, nunca solo color), portada más grande y dominante en móvil
  (128×192), superficie de tarjeta (`bg-card`, sin filete ni `border-t` entre filas —
  la "acumulación de líneas" que el pedido señaló), CTA "Proponer canje" en terracota,
  elevación sutil de la portada al pasar el cursor.
- Nueva sección **"Descubre libros cerca de ti"** (`MapDiscovery.tsx`) antes del pie,
  con un teaser decorativo en SVG (no un segundo Leaflet cargado en la misma página)
  y un número real de libros, enlazando a `/mapa`.
- `MapView.tsx` y los generadores de ícono/OG (Satori no puede leer CSS, así que
  llevan hex a mano) se actualizaron a la paleta nueva — si no, el mapa y la tarjeta
  para compartir habrían quedado con el teal/magenta viejo justo al lado del resto ya
  rediseñado.
- Nuevo componente base `src/components/ui/popover.tsx`, siguiendo el mismo patrón
  de `sheet.tsx` (Radix vía el paquete unificado `radix-ui`, ya era una dependencia).

### Verificado, no solo escrito

`tsc`/`eslint`/`build` en verde. En el navegador, contra Firestore real: paleta y
tipografías resueltas por `getComputedStyle` (marfil, terracota, Playfair, Manrope);
filtro por categoría de punta a punta (abre popover, cuenta baja de 9 a 5, el rótulo
del botón cambia a "Categoría: Novela"); búsqueda de punta a punta ("brujeria" sin
tilde encuentra "brujería", "1 de 9 coinciden"); drawer de filtros en móvil con sus
tres grupos y sin el de distancia cuando no hay ubicación; portada de 128×192 en
375px sin desborde horizontal; encabezado sin colisión a 1024px (93px de aire) ni a
320px (18px); alt text de portadas y aria-label del buscador presentes; la ficha de
un libro (`/libro/[slug]`) hereda la paleta.

### Adaptado a propósito frente al documento (y por qué)

- **Las cards no duplican el markup vertical/horizontal del spec literal.** En vez de
  dos composiciones separadas (póster vs. fila), una sola estructura con la portada
  respondiendo por tamaño de forma responsiva (128×192 bajo 640px, 74×111 desde ahí)
  y el resto del layout compartido. Menos riesgo de mantenimiento y reutiliza el
  breakpoint en píxeles (`min-[640px]:`) que ya existe en este archivo por el bug de
  `rem` que se corrigió antes en este mismo proyecto — un breakpoint nuevo en `sm:`/
  `md:` habría reintroducido exactamente ese problema.
- **Los popovers de filtro no se cierran solos al elegir una opción.** Comportamiento
  no controlado de Radix por defecto: cerrar automáticamente exige estado controlado
  por cada popover. Se dejó así a propósito — permite comparar el conteo entre
  opciones sin reabrir — pero es una simplificación real frente a lo que un usuario
  podría esperar.
- **El teaser del mapa es un SVG decorativo fijo, no un mapa en miniatura real.**
  Cargar una segunda instancia de Leaflet en la portada solo para decorar es peso
  real sin beneficio; el mapa de verdad sigue siendo `/mapa`.
- **El header conserva su estructura de tres grupos (logo · nav con todo · acciones
  móviles), no la rejilla de tres columnas del spec.** Reestructurarla arriesgaba
  reabrir la colisión a 1024px que ya costó varias iteraciones corregir en este mismo
  proyecto (ver commits anteriores sobre el menú montándose sobre el logotipo). Se
  optó por más aire vertical en su lugar; el spec permite "centrada O próxima al
  centro", así que esto sigue dentro de lo pedido.
- **Solo se tocó la página de catálogo**, tal como titula el propio documento
  ("Rediseño integral de la página de catálogo"): Header, Hero, Cerca de ti,
  Catálogo, Descubre el mapa, pie. `Mi estante`, `Publicar`, `Mensajes`,
  `Moderación` y `Políticas` heredan la paleta por los tokens compartidos (ya no se
  ven con los colores viejos), pero no se revisaron uno por uno contra el spec —
  quedan visualmente coherentes por herencia, no rediseñados a propósito.
- **La paleta oscura se actualizó con los mismos huecos de contraste verificados**,
  pero sigue sin poder activarse — es el mismo hallazgo ya anotado en la sección 2 de
  este documento, sin resolver en esta tanda.

### Revisión adversarial (6 de septiembre, commit de seguimiento)

Cuatro agentes independientes revisaron el diff del commit anterior contra AGENTS.md
y contra el propio spec, cada uno buscando fallar de una forma distinta; sus
hallazgos pasaron después por un intento de refutación cada uno (sesgo por defecto:
descartar, no confirmar). De 16 hallazgos crudos, 9 sobrevivieron. Corregidos todos:

- **El chip de filtro activo (Categoría/Estado/Distancia) daba 4,38:1**, por debajo
  de AA — usaba `text-primary` en vez de `text-accent-foreground`, que es el patrón
  que ya seguían los otros cinco lugares con "seleccionado" en la app (8,21:1). Era
  justo la única combinación que el commit anterior nunca calculó porque en el resto
  del código no existía.
- **`MapSkeleton` seguía con hex sueltos**, ya actualizados al color correcto pero
  sin tokenizar — mismo commit que ya probaba la alternativa correcta en
  `MapDiscovery.tsx`, a metros de distancia. Ahora usa `var(--color-*)`.
- **Los pines reales de `/mapa` seguían en el teal viejo.** El commit anterior solo
  tocó el esqueleto de carga (`MapSkeleton`, lo que se ve antes de que Leaflet
  cargue); `ink`/`haloInk` en el hook y el halo del clúster en `LeafletMap.tsx`
  nunca se tocaron. Es justo lo que el mensaje de ese commit decía haber evitado.
- **El esqueleto de carga del catálogo no se había tocado**: seguía con la línea
  divisoria y la portada pequeña de siempre, contradiciendo "menos líneas" y
  "portada dominante" durante el primer instante de cada visita a `/`. Ahora
  comparte superficie y proporciones con la tarjeta real.
- **La categoría del libro desapareció del carrusel de recomendados** al meter
  `BookCondition` — nadie lo pidió, era un efecto colateral. Restaurada junto al
  punto de condición.
- Altura arbitraria del encabezado (`h-[4.25rem]`) donde la utilidad nombrada
  `h-17` ya cubre el mismo valor exacto en la rejilla de 4px — cambiado.
- `id="catalogo-distancia"` se repetía si el drawer de filtros móvil quedaba abierto
  al cruzar el punto de quiebre y se abría también el desplegable de escritorio —
  cada contexto tiene ahora su propio id.

Verificado tras corregir: `tsc`/`eslint`/build en verde; el chip "Categoría: Novela"
resuelve a azul tinta sobre fondo azul claro (8,2:1, confirmado con
`getComputedStyle`); la categoría vuelve a aparecer junto al punto de condición en
el carrusel; el halo del clúster en `/mapa` sale en terracota, no en teal.

### Sin verificar

Todo lo que exige sesión iniciada (proponer un canje real, publicar, ver "Mi
estante"), porque nadie ha podido probar esos flujos de punta a punta en ninguna
sesión anterior tampoco. Y el caso exacto del `id` duplicado (drawer móvil abierto +
cambio de ancho + popover de escritorio) no se pudo reproducir en vivo en esta
verificación porque exige tener ubicación — el arreglo se confirmó leyendo el
código, no viéndolo fallar y luego dejar de fallar.
