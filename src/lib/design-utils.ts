// Ocho tonos medios, todos por encima de 5,7:1 contra la crema del texto. La
// paleta anterior incluía #201e1d, #2d2b2b y #444141: en la parrilla, junto a
// fotos reales, esos casi negros se leían como imágenes que no cargaron.
const PLATE_COLORS = [
  "#00566e",
  "#6b2f52",
  "#1c4f7c",
  "#8a3324",
  "#3f5d3a",
  "#4a3b6b",
  "#00695c",
  "#5b4636",
];

/**
 * El color de la placa de un libro, derivado de su identificador.
 *
 * Antes cada sitio lo calculaba de una cosa distinta —la posición en la lista,
 * el largo del título, el índice del estante—, así que el mismo libro salía azul
 * en el catálogo y granate en su propia ficha. Una portada es parte de cómo se
 * reconoce un libro: tiene que ser la misma en todas partes.
 */
export function plateFor(key: string): string {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return PLATE_COLORS[Math.abs(hash) % PLATE_COLORS.length];
}
