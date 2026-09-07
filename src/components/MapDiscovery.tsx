import { Button } from "@/components/ui/button";

interface MapDiscoveryProps {
  show: boolean;
  hasLocation: boolean;
  totalBooks: number;
  goMap: () => void;
}

// Puntos decorativos fijos, no aleatorios: una posición estable no salta de
// composición entre un render y el siguiente, y esto es un teaser — no
// necesita representar lectores reales, para eso está /mapa.
const DOTS = [
  { x: 22, y: 28, big: true },
  { x: 58, y: 18 },
  { x: 78, y: 40, big: true },
  { x: 14, y: 62 },
  { x: 44, y: 55, big: true },
  { x: 68, y: 70 },
  { x: 34, y: 80 },
];

/**
 * El teaser del mapa, al final de la página. No es el mapa completo —eso es
 * `/mapa`, con Leaflet y datos reales— es un motivo visual para ir: unos
 * puntos y un número real, sin cargar una segunda instancia de Leaflet en la
 * misma página solo para decorar.
 */
export function MapDiscovery({ show, hasLocation, totalBooks, goMap }: MapDiscoveryProps) {
  if (!show || totalBooks === 0) return null;

  return (
    <section className="px-6 sm:px-10 py-14 sm:py-20" data-reveal>
      <div className="w-full mx-auto max-w-shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 items-center">
        <div
          className="relative overflow-hidden rounded-sm border border-border bg-card aspect-[16/10] lg:order-2"
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
            <g stroke="var(--color-border)" strokeWidth="0.4">
              <path d="M0 25 H100 M0 50 H100 M0 75 H100" />
              <path d="M25 0 V100 M50 0 V100 M75 0 V100" />
            </g>
            {DOTS.map((d, i) => (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={d.big ? 3.2 : 2}
                fill={d.big ? "var(--color-primary)" : "var(--color-accent-foreground)"}
                opacity={d.big ? 1 : 0.7}
              />
            ))}
          </svg>
        </div>

        <div className="lg:order-1">
          <h2 className="font-display text-title sm:text-display m-0 text-foreground">
            Descubre libros cerca de ti
          </h2>
          <p className="font-serif text-body text-muted-foreground mt-3 mb-6 max-w-[46ch]">
            {hasLocation
              ? `${totalBooks} libros esperando cerca de ti, marcados en el mapa de lectores de Bogotá.`
              : `${totalBooks} libros en circulación por Bogotá. Activa tu ubicación para ver cuáles están cerca.`}
          </p>
          <Button onClick={goMap}>Explorar mapa</Button>
        </div>
      </div>
    </section>
  );
}
