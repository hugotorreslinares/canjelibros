interface DistanceLabelProps {
  km: number | null;
  className?: string;
}

// Sin ubicación no hay distancia, y entonces no se escribe nada: el «0 km» que
// aparecía junto a cada lector no era un dato, era el valor por defecto del
// cálculo. Un hueco honesto se lee mejor que un cero falso.
export function DistanceLabel({ km, className }: DistanceLabelProps) {
  if (km === null) return null;
  return <span className={className}>{km} km</span>;
}

export function formatDistance(km: number | null): string | null {
  return km === null ? null : `${km} km`;
}
