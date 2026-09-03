interface DistanceLabelProps {
  km: number | null;
  className?: string;
}

/**
 * Escribe una distancia como se dice, no como sale de la fórmula.
 *
 * El cálculo entrega kilómetros con decimales, y publicarlos tal cual producía
 * dos mentiras a la vez: un «0 km» que parecía medido cuando en realidad los dos
 * perfiles comparten el punto que dio el dispositivo, y un «8476.6 km» con una
 * precisión de un metro que nadie puede usar. La cercanía es el argumento del
 * sitio; escribirla mal lo desarma.
 */
export function formatDistance(km: number | null): string | null {
  if (km === null) return null;

  // Mismo punto registrado. Los perfiles se crean con la ubicación del
  // dispositivo, así que esto es habitual y no significa «pared con pared».
  if (km < 0.05) return "en tu misma zona";

  if (km < 1) return "a menos de 1 km";

  // Con un decimal solo mientras el decimal signifique algo al caminar.
  if (km < 10) return `a ${km.toLocaleString("es-CO", { maximumFractionDigits: 1 })} km`;

  return `a ${Math.round(km).toLocaleString("es-CO")} km`;
}

export function DistanceLabel({ km, className }: DistanceLabelProps) {
  const texto = formatDistance(km);
  if (texto === null) return null;
  return <span className={className}>{texto}</span>;
}
