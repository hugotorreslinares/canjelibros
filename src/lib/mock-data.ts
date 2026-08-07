import type { AppUser, MyBook, ThreadEntry } from "./types";

export const categories = [
  "Todas",
  "Novela",
  "Ensayo",
  "Poesía",
  "Historia",
  "Ciencia",
  "Infantil",
  "Cómic",
  "Oficios",
];

export const conds = ["Todos", "Como nuevo", "Bueno", "Aceptable", "Muy leído"];
export const formCats = ["Novela", "Ensayo", "Poesía", "Historia", "Ciencia", "Infantil", "Cómic", "Oficios"];
export const formConds = ["Como nuevo", "Bueno", "Aceptable", "Muy leído"];
export const tagList = ["Puntual", "El libro estaba como decía", "Buena conversación", "Recomendó otro libro"];

export const myRatingSeed = 4.6;

export const initialMyBooks: MyBook[] = [
  { t: "La vorágine", a: "José Eustasio Rivera", cat: "Novela", cond: "Aceptable" },
  { t: "Breve historia del tiempo", a: "Stephen Hawking", cat: "Ciencia", cond: "Bueno", resUid: "ana" },
  { t: "El olvido que seremos", a: "Héctor Abad", cat: "Memoria", cond: "Como nuevo" },
  { t: "Cien años de soledad", a: "Gabriel García Márquez", cat: "Novela", cond: "Muy leído" },
  { t: "Cocina bogotana de olla", a: "Marta Bonilla", cat: "Oficios", cond: "Bueno" },
];

export const users: AppUser[] = [
  {
    id: "ana",
    name: "Ana Restrepo",
    barrio: "Chapinero Alto",
    dist: 0.8,
    x: 34,
    y: 30,
    online: true,
    trades: 14,
    rating: 4.8,
    bio: "Traduzco manuales técnicos; leo poesía para compensar.",
    spot: "Café de la 60 con 7, tardes",
    books: [
      { t: "Los detectives salvajes", a: "Roberto Bolaño", cat: "Novela", cond: "Bueno", desc: "Tapa blanda con el lomo vencido de tanto ir y venir en TransMilenio. Se lee perfecto." },
      { t: "Tratado de jardinería urbana", a: "Lucía Vélez", cat: "Oficios", cond: "Como nuevo", desc: "Regalo repetido. Capítulos de balcones y sombra parcial, muy útil para Bogotá." },
      { t: "Antología de Blanca Varela", a: "Blanca Varela", cat: "Poesía", cond: "Aceptable", desc: "Subrayado a lápiz. Prefiero que siga circulando antes que juntar polvo." },
      { t: "El infinito en un junco", a: "Irene Vallejo", cat: "Ensayo", cond: "Bueno", desc: "Sobre bibliotecas y la terquedad de los libros por sobrevivir." },
    ],
  },
  {
    id: "julian",
    name: "Julián Mora",
    barrio: "La Macarena",
    dist: 1.4,
    x: 58,
    y: 46,
    online: false,
    trades: 9,
    rating: 4.5,
    bio: "Cocino y presto libros de cocina, con manchas incluidas.",
    spot: "Parque de la Macarena, sábados en la mañana",
    books: [
      { t: "Cocina criolla ilustrada", a: "Sofía Ospina", cat: "Oficios", cond: "Muy leído", desc: "Mancha honesta de ajiaco en la página 84. Las recetas funcionan." },
      { t: "Sapiens", a: "Yuval N. Harari", cat: "Historia", cond: "Bueno", desc: "Lo terminé en dos semanas de lluvia. Sin subrayados." },
      { t: "Rayuela", a: "Julio Cortázar", cat: "Novela", cond: "Aceptable", desc: "Edición de bolsillo, con el capítulo 7 marcado por otra persona hace años." },
    ],
  },
  {
    id: "dani",
    name: "Daniela Cifuentes",
    barrio: "Teusaquillo",
    dist: 2.1,
    x: 18,
    y: 62,
    online: true,
    trades: 21,
    rating: 4.9,
    bio: "Maestra de primaria. Cambio infantiles por lo que sea.",
    spot: "Biblioteca Virgilio Barco, entrada norte",
    books: [
      { t: "Donde viven los monstruos", a: "Maurice Sendak", cat: "Infantil", cond: "Bueno", desc: "Ya lo leyeron tres cursos. Aguanta uno más, o diez." },
      { t: "Mujeres que corren con los lobos", a: "C. P. Estés", cat: "Ensayo", cond: "Como nuevo", desc: "Duplicado. Solo pido que lo devuelvan al mundo cuando lo terminen." },
      { t: "La casa grande", a: "Álvaro Cepeda Samudio", cat: "Novela", cond: "Aceptable", desc: "Delgadito, de una sentada. Bananeras y silencio." },
      { t: "Física conceptual", a: "Paul Hewitt", cat: "Ciencia", cond: "Bueno", desc: "Sirve para el colegio y para entender por qué se cae el pan del lado de la mantequilla." },
      { t: "Cuentos de Chapinero", a: "Varios autores", cat: "Novela", cond: "Como nuevo", desc: "Antología local de una editorial de garaje. Vale por el prólogo." },
    ],
  },
  {
    id: "samir",
    name: "Samir Peña",
    barrio: "La Candelaria",
    dist: 3.2,
    x: 74,
    y: 70,
    online: true,
    trades: 4,
    rating: 4.2,
    bio: "Estudio filosofía y arriendo un cuarto lleno de tomos.",
    spot: "Chorro de Quevedo, después de clase",
    books: [
      { t: "Vigilar y castigar", a: "Michel Foucault", cat: "Ensayo", cond: "Muy leído", desc: "Anotado en tres colores distintos por tres dueños distintos." },
      { t: "Cómic: Maus", a: "Art Spiegelman", cat: "Cómic", cond: "Bueno", desc: "Los dos tomos. Cuidado, no se presta para siempre a nadie." },
      { t: "Manual de radio comunitaria", a: "Colectivo Onda Corta", cat: "Oficios", cond: "Aceptable", desc: "Fotocopiado y anillado, como debe ser." },
    ],
  },
  {
    id: "mile",
    name: "Milena Arias",
    barrio: "Galerías",
    dist: 4.6,
    x: 46,
    y: 14,
    online: false,
    trades: 12,
    rating: 4.7,
    bio: "Enfermera de turno nocturno; leo entre rondas.",
    spot: "Panadería de la 53, cualquier día",
    books: [
      { t: "El cuerpo lleva la cuenta", a: "Bessel van der Kolk", cat: "Ciencia", cond: "Bueno", desc: "Denso pero claro. Lo cambio por cualquier novela corta." },
      { t: "Los abismos", a: "Pilar Quintana", cat: "Novela", cond: "Como nuevo", desc: "Lo leí en un turno de noche entero. Impecable." },
      { t: "Historia doble de la costa", a: "Orlando Fals Borda", cat: "Historia", cond: "Aceptable", desc: "Tomo I. Pesa, avisa antes de venir por él." },
    ],
  },
];

export const threadData: Record<string, ThreadEntry> = {
  ana: {
    deal: "Los detectives salvajes ⇄ Breve historia del tiempo",
    state: "Esperando confirmación de ambos",
    time: "18:40",
    msgs: [
      { me: false, text: "Hola Camila, vi que tienes el Hawking. Te dejo el Bolaño si te sirve.", time: "17:02" },
      { me: true, text: "Me sirve muchísimo. ¿Te queda bien mañana en el café de la 60?", time: "17:15" },
      { me: false, text: "Perfecto. A las 6:30. Llevo el libro en una bolsa de papel para la lluvia.", time: "17:31" },
      { me: true, text: "Hecho. Cuando nos veamos lo marcamos como realizado en la app.", time: "18:40" },
    ],
  },
  dani: {
    deal: "La casa grande ⇄ La vorágine",
    state: "Propuesta enviada",
    time: "Ayer",
    msgs: [
      { me: true, text: "Hola Daniela, te propuse La vorágine por La casa grande. Los dos son cortos, buen trato.", time: "Ayer 20:11" },
      { me: false, text: "Me encanta la idea. Déjame ver si alcanzo el viernes en la Virgilio Barco.", time: "Ayer 21:03" },
    ],
  },
  samir: {
    deal: "Maus ⇄ Cien años de soledad",
    state: "Canje cerrado · calificado",
    time: "Mar 12",
    msgs: [
      { me: false, text: "Gracias por el García Márquez, era el que me faltaba.", time: "Mar 12" },
      { me: true, text: "Y Maus llegó impecable. Le puse cinco estrellas.", time: "Mar 12" },
    ],
  },
};
