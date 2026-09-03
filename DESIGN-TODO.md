# Pendientes de diseño — Librocambio

Estado a 3 de septiembre de 2026, versión 0.4.0. Continúa [DESIGN-AUDIT.md](DESIGN-AUDIT.md)
(la auditoría original) y [UI-PLAN.md](UI-PLAN.md) (el plan que la respondió, ya
ejecutado). Aquí solo va lo que sigue abierto, medido sobre el código y sobre la
aplicación desplegada, no sobre impresiones.

## Si solo se hacen tres cosas

1. **Terminar la migración al sistema de diseño en las tres vistas que se
   quedaron fuera.** Es lo que hace que la aplicación se sienta a medio hacer.
2. **Dejar de inventar reputación y distancia.** Hoy las dos mienten, y son
   justo los dos datos con los que alguien decide si le escribe a un
   desconocido.
3. **Dar URL propia a cada libro.** Desbloquea compartir, indexar y el resto del
   producto.

---

## 1. Sistema de diseño: la deuda que se ve

El sistema —seis pasos de tipografía, rejilla de 4 px, color solo por tokens— se
adoptó en la migración a shadcn, pero **tres vistas nunca se convirtieron**. Los
números salen de contar en `src/components/`:

| Vista | Colores en hex | Notas |
|---|---|---|
| `ModerationView` | 14 | nunca migrada |
| `LeafletMap` | 13 | parcialmente justificable: Leaflet pinta fuera de React |
| `MapView` | 13 | nunca migrada |
| `PoliciesView` | 9 | nunca migrada |
| `BookCover` | 3 | el crema de las placas, revisable |

- [ ] **52 colores escritos a mano** donde el sistema dice «sin hex en un
      componente». Cambiar un token hoy no cambia esas vistas: el modo oscuro y
      cualquier ajuste de contraste se quedan a medias.
- [ ] **21 tamaños de texto distintos** en `text-[NNpx]` (69 usos) frente a los
      seis pasos declarados. La auditoría original señaló «doce tamaños en una
      pantalla» como hallazgo grave; en el código hay 21.
- [ ] **95 espaciados arbitrarios, 41 fuera de la rejilla de 4 px** (1, 2, 3, 5,
      6, 9, 10, 14, 18, 26 px). El ritmo vertical se pierde justo donde más se
      nota: fichas y paneles.
- [ ] **`DistanceLabel` se usa en 1 de 4 sitios.** Se creó para que la distancia
      se escribiera igual en todas partes; `MapView:189`, `ChatView:110` y
      `CatalogView:257` la repiten a mano. Un componente compartido que se
      esquiva no es un sistema.

**Por qué importa más de lo que parece:** mientras esas vistas no usen tokens, el
sistema no es una fuente de verdad sino una sugerencia, y la siguiente persona
que toque el código no sabrá cuál de las dos formas es la buena.

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

## 3. Confianza: dos datos que hoy mienten

- [ ] **Todo el mundo aparece con ★★★★★ 5.** `avgRatingFor` devuelve 5 cuando no
      hay calificaciones, así que la estrella no distingue a quien tiene diez
      canjes impecables de quien acaba de llegar. Una reputación inventada es
      peor que ninguna: quita la señal y además engaña. Alternativa: no mostrar
      estrellas sin calificaciones y poner «sin canjes todavía», que es
      información real y además invita a ser el primero.
- [ ] **La distancia tampoco informa.** En los datos actuales casi todos los
      lectores salen a «0 km» —comparten coordenadas porque el perfil se crea
      con la ubicación del dispositivo— y uno aparece a «8.476,6 km» sin que nada
      lo filtre. La cercanía es el argumento del producto; hoy es ruido.
      Hace falta redondeo con sentido («a menos de 1 km», «en tu barrio»), un
      tope razonable y decidir qué hacer con quien está claramente fuera.

## 4. Usabilidad del canje

- [ ] **No existe «aceptar una oferta».** El ciclo va de proponer a confirmar el
      encuentro; no hay estado intermedio, así que no se puede elegir entre
      varias ofertas ni rechazar ninguna. Analizado a fondo en la conversación:
      exige decidir si la oferta pasa a ser una colección propia o se parchea el
      hilo actual, y una regla nueva de Firestore.
- [ ] **No se puede rechazar.** La única salida de una propuesta que no interesa
      es borrar el libro. El permiso para soltar la reserva ya existe en las
      reglas; falta el botón.
- [ ] **No hay búsqueda.** Se filtra por categoría, estado y distancia, pero no
      se puede buscar por título ni por autor. Con nueve libros no importa; con
      doscientos es lo primero que se busca.
- [ ] **La identidad del lector es delgada.** Sin foto ni marca personal, todos
      los perfiles se ven iguales, y hay que confiar en alguien para quedar con
      él en persona.

## 5. Atractivo

- [ ] **Cada libro necesita su página.** Hoy no hay forma de enlazar un libro.
      Desbloquea compartir por WhatsApp, indexar en buscadores —el trabajo de SEO
      hecho no llega al contenido— y dar sitio a descripción larga y a la ficha
      del dueño.
- [ ] **La marca no está terminada.** El logotipo es solo texto; el ícono de la
      aplicación es una «L» y la imagen para compartir sale en la sans de
      repuesto de Satori, no en la Source Serif de la marca. Falta incrustar la
      fuente en esas rutas y dibujar un signo, aunque sea mínimo.
- [ ] **Las placas tipográficas son la mitad del catálogo.** Cuando no hay foto,
      `BookCover` compone una placa de color con el título. Funcionan, pero son
      lo que más se ve y admiten bastante más trabajo: textura de papel,
      composición por longitud del título, familia según categoría.
- [ ] **La fila del catálogo tiene poca jerarquía.** Portada, título, autor,
      descripción, etiquetas, dueño, distancia, estrellas y botón compiten casi
      al mismo peso.
- [ ] **La aparición al hacer scroll no escalona.** Todo lo que entra en pantalla
      aparece a la vez. Un desfase pequeño entre elementos de una misma fila da
      sensación de materia.
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
