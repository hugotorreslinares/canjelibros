import Link from "next/link";
import { BookCover } from "./BookCover";
import { DistanceLabel } from "./DistanceLabel";

interface NearbyItem {
  id: string;
  t: string;
  a: string;
  cover: string | null;
  plate: string;
  dist: number | null;
  href: string;
}

interface NearbyBooksProps {
  show: boolean;
  hasLocation: boolean;
  items: NearbyItem[];
  goCatalog: () => void;
}

/**
 * «Cerca de ti»: la fila entre el hero y el catálogo, y la que carga con el
 * argumento central del sitio — la proximidad, no el gusto lector. Por eso no
 * comparte orden con el carrusel de recomendados de más abajo: aquí manda la
 * distancia real.
 *
 * Sin ubicación no hay «cerca» que valga — decirlo de todas formas sería
 * inventar una cercanía que no se puede medir, el mismo error que ya se
 * corrigió en las distancias del catálogo — así que el título cambia a algo
 * que sigue siendo cierto sin saber dónde está quien mira.
 */
export function NearbyBooks({ show, hasLocation, items, goCatalog }: NearbyBooksProps) {
  if (!show) return null;

  return (
    <section className="border-b border-border px-6 sm:px-10 py-10 sm:py-14" data-reveal>
      <div className="w-full mx-auto max-w-shell">
        <div className="flex items-baseline justify-between gap-6 flex-wrap mb-1">
          <h2 className="font-display text-title sm:text-display m-0 text-foreground">
            {hasLocation ? "Cerca de ti" : "Recién publicados"}
          </h2>
          <button
            onClick={goCatalog}
            className="font-sans text-small text-primary bg-transparent border-none p-0 underline-offset-4 hover:underline shrink-0"
          >
            Ver todos →
          </button>
        </div>
        <p className="font-serif text-body text-muted-foreground mt-2 mb-8 max-w-[52ch]">
          {hasLocation
            ? "Libros que puedes intercambiar ahora, del más cercano al más lejano."
            : "Los últimos libros que llegaron a Librocambio."}
        </p>

        {/* Grilla en escritorio (4-5 visibles), carrusel de una sola fila con
            scroll táctil en móvil — sin cargar Embla aquí: son pocos elementos
            y el desplazamiento nativo del navegador ya da inercia y drag. */}
        <div className="flex gap-5 overflow-x-auto pb-2 -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible snap-x snap-mandatory sm:snap-none">
          {items.map((b) => (
            <Link
              key={b.id}
              href={b.href}
              className="group shrink-0 w-[42vw] max-w-[168px] sm:w-auto sm:max-w-none snap-start"
            >
              <BookCover
                cover={b.cover}
                plate={b.plate}
                title={b.t}
                author={b.a}
                size="md"
                className="w-full aspect-2/3 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg"
              />
              <div className="mt-3">
                <div className="font-serif text-body leading-tight truncate text-foreground">{b.t}</div>
                <div className="font-sans text-small text-muted-foreground truncate">{b.a}</div>
                {b.dist !== null && (
                  <div className="font-sans text-small text-muted-foreground mt-0.5">
                    <DistanceLabel km={b.dist} />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
