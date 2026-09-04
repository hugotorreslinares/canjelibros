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
