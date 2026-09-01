import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BookCover } from "./BookCover";
import { BookRowsSkeleton } from "./BookGridSkeleton";
import { QueryState } from "./QueryState";

interface CatalogItem {
  cover: string | null;
  reserved: boolean;
  t: string;
  a: string;
  cat: string;
  cond: string;
  desc: string;
  owner: string;
  barrio: string;
  dist: number | null;
  starsLabel: string;
  plate: string;
  selectOwner: () => void;
  propose: () => void;
}

interface RecommendedItem {
  cover: string | null;
  t: string;
  a: string;
  cat: string;
  cond: string;
  plate: string;
  owner: string;
  selectOwner: () => void;
  propose: () => void;
}

interface Option {
  label: string;
  active: boolean;
  pick: () => void;
}

interface CatalogViewProps {
  loading: boolean;
  error: boolean;
  items: CatalogItem[];
  empty: boolean;
  count: string;
  /** El catálogo oculta los libros de quien mira: hay que decirlo, o parece que su publicación falló. */
  hidesMine: boolean;
  sortLabel: string;
  hasLocation: boolean;
  recommended: { title: string; note: string | null; items: RecommendedItem[] };
  catOptions: (Option & { n: number })[];
  condOptions: Option[];
  sortOptions: Option[];
  maxDist: number;
  maxDistLabel: string;
  setDist: (v: number) => void;
}

function FilterButton({ option, count }: { option: Option; count?: number }) {
  return (
    <button
      onClick={option.pick}
      aria-pressed={option.active}
      className={`flex h-11 min-h-[44px] items-center gap-2 bg-transparent border-none text-left font-serif text-body ${
        option.active ? "text-primary" : "text-foreground"
      }`}
    >
      {option.label}
      {count !== undefined && <span className="font-sans text-small text-muted-foreground">{count}</span>}
    </button>
  );
}

export function CatalogView({
  loading,
  error,
  items,
  empty,
  count,
  hidesMine,
  sortLabel,
  hasLocation,
  recommended,
  catOptions,
  condOptions,
  sortOptions,
  maxDist,
  maxDistLabel,
  setDist,
}: CatalogViewProps) {
  // Una categoría con cero libros no lleva a ninguna parte: seis de las nueve
  // ocupaban una pantalla entera en móvil sin ofrecer nada.
  const usableCats = catOptions.filter((o) => o.n > 0 || o.active);

  return (
    <div id="catalogo" className="w-full mx-auto max-w-shell px-6 sm:px-10 pt-8 pb-16 scroll-mt-16">
      <div className="flex items-baseline justify-between gap-8 flex-wrap mb-2">
        <h2 className="font-serif text-display m-0">Catálogo</h2>
        <p className="font-sans text-small text-muted-foreground">
          {loading
            ? "Cargando libros…"
            : error
              ? "No se pudo cargar el catálogo"
              : `${count} libros ${hidesMine ? "de otros lectores" : "disponibles"} · ordenados por ${sortLabel}`}
        </p>
      </div>
      <div className="h-[5px] bg-foreground mt-4 mb-0.5" />
      <div className="h-px bg-foreground mb-6" />

      {recommended.items.length > 0 && (
        <section className="mb-8" aria-label={recommended.title}>
          <h2 className="font-sans text-label uppercase text-muted-foreground mb-3">
            {recommended.title}
            {recommended.note && <span className="ml-2 normal-case tracking-normal">· {recommended.note}</span>}
          </h2>
          {/* Antes era un desplazamiento horizontal sin ninguna pista: en
              escritorio nada decía que hubiera más libros a la derecha. */}
          <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="-ml-4">
              {recommended.items.map((b, i) => (
                <CarouselItem key={i} className="pl-4 basis-[150px]">
                  <div className="flex flex-col gap-2">
                    <BookCover
                      cover={b.cover}
                      plate={b.plate}
                      title={b.t}
                      author={b.a}
                      size="md"
                      className="h-[225px] w-[150px] rounded-sm"
                    />
                    <div className="font-serif text-body leading-tight truncate">{b.t}</div>
                    <div className="font-sans text-small text-muted-foreground truncate">{b.a}</div>
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge variant="secondary">{b.cat}</Badge>
                      <Badge variant="outline">{b.cond}</Badge>
                    </div>
                    <Button onClick={b.propose} className="w-full">
                      Proponer canje
                    </Button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4" />
            <CarouselNext className="hidden sm:flex -right-4" />
          </Carousel>
          <div className="border-t border-border mt-6" />
        </section>
      )}

      {/* El corte va en px a propósito, no con el breakpoint `md`. Los breakpoints
          de Tailwind se declaran en `rem`, así que se mueven con el tamaño de letra
          del navegador: con la fuente en 12px, `md` deja de valer 768px y vale 576,
          y a esa anchura la barra de 230px y las filas de la lista ya no caben
          juntas. Un ancho fijo en píxeles no puede depender de una medida que el
          visitante cambia. */}
      <div className="grid grid-cols-1 min-[768px]:[grid-template-columns:230px_minmax(0,1fr)] gap-11 items-start">
        <div className="flex flex-col gap-6 md:sticky md:top-20">
          <div>
            <h2 className="font-sans text-label uppercase text-muted-foreground mb-2">Categoría</h2>
            <div className="flex flex-col">
              {usableCats.map((o) => (
                <FilterButton key={o.label} option={o} count={o.n} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-sans text-label uppercase text-muted-foreground mb-2">Estado</h2>
            <div className="flex flex-col">
              {condOptions.map((o) => (
                <FilterButton key={o.label} option={o} />
              ))}
            </div>
          </div>
          {hasLocation && (
            <div>
              <h2 className="font-sans text-label uppercase text-muted-foreground mb-2">Distancia máxima</h2>
              <label className="font-serif text-body mb-1.5 block" htmlFor="catalogo-distancia">
                {maxDistLabel}
              </label>
              <input
                id="catalogo-distancia"
                type="range"
                min={0.5}
                max={8}
                step={0.5}
                value={maxDist}
                onChange={(e) => setDist(parseFloat(e.target.value))}
                className="w-full h-11 accent-primary"
              />
            </div>
          )}
          <div>
            <h2 className="font-sans text-label uppercase text-muted-foreground mb-2">Orden</h2>
            <div className="flex flex-col">
              {sortOptions.map((o) => (
                <FilterButton key={o.label} option={o} />
              ))}
            </div>
          </div>
        </div>

        <QueryState
          loading={loading}
          error={error}
          isEmpty={empty}
          skeleton={<BookRowsSkeleton />}
          emptyTitle="Nada con esos filtros"
          emptyDescription="Prueba con otra categoría, otro estado o un radio más amplio."
        >
          <div className="flex flex-col">
            {items.map((b, i) => (
              <article
                key={i}
                className="grid grid-cols-1 min-[640px]:grid-cols-[74px_minmax(0,1fr)_minmax(0,200px)] gap-5 border-t border-border py-6 items-start"
              >
                <BookCover
                  cover={b.cover}
                  plate={b.plate}
                  title={b.t}
                  size="sm"
                  className="h-[111px] w-[74px] rounded-sm"
                />
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-2.5 flex-wrap items-baseline">
                    <h3 className="font-serif text-title m-0">{b.t}</h3>
                    <span className="font-sans text-small text-muted-foreground">{b.a}</span>
                  </div>
                  <p className="font-serif text-body text-foreground/85 max-w-[46em]">{b.desc}</p>
                  <div className="flex gap-2 flex-wrap mt-0.5">
                    <Badge variant="secondary">{b.cat}</Badge>
                    <Badge variant="outline">{b.cond}</Badge>
                    {/* Reservado no es destructivo: es «ahora no». Va en el gris
                        de los metadatos, no en el magenta de eliminar. */}
                    {b.reserved && <Badge variant="outline">Reservado</Badge>}
                  </div>
                </div>
                {/* El dueño baja a metadato: antes era un enlace del mismo peso
                    que el llamado a la acción, justo encima de él. */}
                <div className="flex flex-col gap-2 items-start">
                  <p className="font-sans text-small text-muted-foreground">
                    <button onClick={b.selectOwner} className="bg-transparent border-none p-0 text-primary underline-offset-4 hover:underline">
                      {b.owner}
                    </button>
                    <br />
                    {b.barrio}
                    {b.dist !== null && <> · {b.dist} km</>} · {b.starsLabel}
                  </p>
                  {b.reserved ? (
                    <div className="flex flex-col gap-1 items-start">
                      <Button disabled>Reservado</Button>
                      <span className="font-sans text-small text-muted-foreground max-w-[20em]">
                        Vuelve a estar libre si la propuesta no cierra.
                      </span>
                    </div>
                  ) : (
                    <Button onClick={b.propose}>Proponer canje</Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </QueryState>
      </div>
    </div>
  );
}
