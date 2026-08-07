const PLATE_COLORS = [
  "#0088b0",
  "#d6006c",
  "#201e1d",
  "#004961",
  "#aa0b56",
  "#444141",
  "#006786",
  "#2d2b2b",
];

export function plateFor(i: number): string {
  return PLATE_COLORS[((i % PLATE_COLORS.length) + PLATE_COLORS.length) % PLATE_COLORS.length];
}

export function stars(n: number): string {
  const f = Math.round(n);
  return "★★★★★".slice(0, f) + "☆☆☆☆☆".slice(0, 5 - f);
}
