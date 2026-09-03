interface ReputationProps {
  /** Promedio de las calificaciones recibidas, o null si todavía no tiene ninguna. */
  rating: number | null;
  className?: string;
}

function estrellas(n: number): string {
  const llenas = Math.round(n);
  return "★★★★★".slice(0, llenas) + "☆☆☆☆☆".slice(0, 5 - llenas);
}

/**
 * La reputación de un lector, o la ausencia de ella.
 *
 * Antes el promedio devolvía 5 cuando no había ninguna calificación, así que
 * todo el mundo lucía cinco estrellas: la señal no distinguía a quien tenía diez
 * canjes impecables de quien acababa de llegar, y además prometía una confianza
 * que nadie había ganado. Decir que no hay calificaciones es información real, y
 * de paso invita a ser quien deje la primera.
 */
export function Reputation({ rating, className }: ReputationProps) {
  if (rating === null) {
    return <span className={className}>sin calificaciones todavía</span>;
  }
  return (
    <span className={className}>
      <span aria-hidden="true">{estrellas(rating)}</span>{" "}
      <span className="sr-only">Calificación:</span>
      {rating.toLocaleString("es-CO", { maximumFractionDigits: 1 })} de 5
    </span>
  );
}
