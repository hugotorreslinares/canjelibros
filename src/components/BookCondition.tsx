const ORDER = ["Como nuevo", "Bueno", "Aceptable", "Muy leído"];

interface BookConditionProps {
  cond: string;
  className?: string;
}

/**
 * El estado de un ejemplar como un punto, no solo como texto.
 *
 * No es un semáforo de cuatro colores — eso obliga a memorizar una leyenda
 * antes de leer nada. Solo el mejor estado se destaca (verde apagado, relleno
 * completo); el resto se distingue por cuánto se llena el punto y, en el
 * último escalón, por ser un anillo hueco en vez de un disco. La forma
 * transmite el orden sin depender solo del color, y el texto de al lado —
 * nunca opcional— es lo que de verdad lo hace accesible.
 */
export function BookCondition({ cond, className = "" }: BookConditionProps) {
  const step = Math.max(0, ORDER.indexOf(cond));

  return (
    <span className={`inline-flex items-center gap-1.5 font-sans text-small text-muted-foreground ${className}`}>
      <span
        aria-hidden="true"
        className={
          step === 0
            ? "size-2 rounded-full bg-status-good"
            : step === 3
              ? "size-2 rounded-full border-[1.5px] border-muted-foreground"
              : "size-2 rounded-full bg-muted-foreground"
        }
        style={step === 1 ? { opacity: 0.75 } : step === 2 ? { opacity: 0.5 } : undefined}
      />
      {cond}
    </span>
  );
}
