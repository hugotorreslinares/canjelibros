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

export function plateFor(i: number): string {
  return PLATE_COLORS[((i % PLATE_COLORS.length) + PLATE_COLORS.length) % PLATE_COLORS.length];
}
