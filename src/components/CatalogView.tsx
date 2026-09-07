import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BookCondition } from "./BookCondition";
import { BookCover } from "./BookCover";
import { BookRowsSkeleton } from "./BookGridSkeleton";
import { QueryState } from "./QueryState";
import { DistanceLabel } from "./DistanceLabel";
import { Reputation } from "./Reputation";

interface CatalogItem {
  cover: string | null;
  reserved: boolean;
  href: string;
  t: string;
  a: string;
  cat: string;
  cond: string;
  desc: string;
  owner: string;
  barrio: string;
  dist: number | null;
  rating: number | null;
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
  /** Libros que coinciden con los filtros actuales. */
  count: number;
  /** Total de libros disponibles, filtros aparte — para «X de Y» cuando algo está filtrando. */
  totalBooks: number;
  /** El catálogo oculta los libros de quien mira: hay que decirlo, o parece que su publicación falló. */
  hidesMine: boolean;
  query: string;
  setQuery: (v: string) => void;
  searching: boolean;
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="size-5">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M16.5 16.5 13 13" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="size-3">
      <path d="M1 1.5 6 6.5 11 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CatalogView({
  loading,
  error,
  items,
  empty,
  count,
  totalBooks,
  hidesMine,
  query,
  setQuery,
  searching,
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Una categoría con cero libros no lleva a ninguna parte: seis de las nueve
  // ocupaban una pantalla entera en móvil sin ofrecer nada.
  const usableCats = catOptions.filter((o) => o.n > 0 || o.active);

  // Cuenta solo lo que estrecha el resultado (categoría, estado, distancia).
  // El orden no filtra nada — reordena el mismo conjunto — así que no suma al
  // badge de «Filtros · N».
  const activeCat = catOptions.find((o) => o.active);
  const activeCond = condOptions.find((o) => o.active);
  // El valor inicial del control es 5 km, no el máximo del rango (8):
  // "sin filtrar" se compara contra el arranque real, no contra el tope del slider.
  const distanceIsDefault = maxDist === 5;
  const activeFilterCount =
    (activeCat && activeCat.label !== "Todas" ? 1 : 0) +
    (activeCond && activeCond.label !== "Todos" ? 1 : 0) +
    (hasLocation && !distanceIsDefault ? 1 : 0);

  // La frase de arriba dice lo que de verdad está pasando en vez de un
  // técnico «5 de 5 · ordenados por distancia»: un número si no hay nada
  // filtrando, «X de Y» solo cuando la búsqueda o los filtros lo justifican.
  const countLine = loading
    ? "Buscando libros…"
    : error
      ? "No se pudo cargar el catálogo"
      : searching
        ? `${count} de ${totalBooks} libros coinciden con «${query.trim()}»`
        : activeFilterCount > 0
          ? `${count} de ${totalBooks} libros con estos filtros`
          : `${count} libro${count === 1 ? "" : "s"} ${hidesMine ? "de otros lectores " : ""}esperando un nuevo lector`;

  const categoryGroup = (
    <div>
      <h3 className="font-sans text-label uppercase text-muted-foreground mb-2">Categoría</h3>
      <div className="flex flex-col">
        {usableCats.map((o) => (
          <FilterButton key={o.label} option={o} count={o.n} />
        ))}
      </div>
    </div>
  );

  const conditionGroup = (
    <div>
      <h3 className="font-sans text-label uppercase text-muted-foreground mb-2">Estado</h3>
      <div className="flex flex-col">
        {condOptions.map((o) => (
          <FilterButton key={o.label} option={o} />
        ))}
      </div>
    </div>
  );

  const distanceGroup = hasLocation && (
    <div>
      <h3 className="font-sans text-label uppercase text-muted-foreground mb-2">Distancia máxima</h3>
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
  );

  const sortGroup = (
    <div>
      <h3 className="font-sans text-label uppercase text-muted-foreground mb-2">Ordenar</h3>
      <div className="flex flex-col">
        {sortOptions.map((o) => (
          <FilterButton key={o.label} option={o} />
        ))}
      </div>
    </div>
  );

  return (
    <div id="catalogo" className="w-full mx-auto max-w-shell px-6 sm:px-10 pt-8 pb-16 scroll-mt-16">
      {/* Espacio y tipografía en vez de una línea gruesa: el filete doble que
          llevaba esta cabecera era justo la «acumulación de líneas» que se
          pidió reducir en el rediseño. */}
      <div className="flex items-baseline justify-between gap-8 flex-wrap mb-8" data-reveal>
        <h2 className="font-display text-title sm:text-display m-0 text-foreground">Explora el catálogo</h2>
        <p className="font-sans text-small text-muted-foreground m-0">{countLine}</p>
      </div>

      {recommended.items.length > 0 && (
        <section className="mb-10" aria-label={recommended.title} data-reveal>
          <h3 className="font-sans text-label uppercase text-muted-foreground mb-3">
            {recommended.title}
            {recommended.note && <span className="ml-2 normal-case tracking-normal">· {recommended.note}</span>}
          </h3>
          <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="-ml-4">
              {recommended.items.map((b, i) => (
                <CarouselItem key={i} className="pl-4 basis-[150px]">
                  <div className="flex flex-col gap-2 group">
                    <BookCover
                      cover={b.cover}
                      plate={b.plate}
                      title={b.t}
                      author={b.a}
                      size="md"
                      className="h-[225px] w-[150px] rounded-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg"
                    />
                    <div className="font-serif text-body leading-tight truncate">{b.t}</div>
                    <div className="font-sans text-small text-muted-foreground truncate">{b.a}</div>
                    <BookCondition cond={b.cond} />
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
        </section>
      )}

      {/* Buscador grande y con protagonismo propio, en su propia fila — antes
          vivía metido en la barra lateral, del mismo tamaño que un filtro más. */}
      <div className="relative mb-4">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <SearchIcon />
        </span>
        <input
          id="buscar-libro"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar título, autor o tema…"
          aria-label="Buscar título, autor o tema"
          className="w-full h-14 min-h-[44px] pl-12 pr-4 rounded-sm border border-input bg-card font-sans text-body text-foreground placeholder:text-placeholder focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {/* Filtros como barra horizontal en escritorio (antes: columna fija de
          230px). En móvil se pliegan en un único botón con drawer, para que la
          fila de resultados no empiece a media pantalla. */}
      <div className="hidden min-[768px]:flex items-center gap-2 mb-8 flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={`flex h-11 min-h-[44px] items-center gap-1.5 px-3.5 rounded-sm border font-sans text-small ${
                activeCat && activeCat.label !== "Todas"
                  ? "border-primary text-primary bg-accent"
                  : "border-input text-foreground bg-card"
              }`}
            >
              {activeCat && activeCat.label !== "Todas" ? `Categoría: ${activeCat.label}` : "Categoría"}
              <ChevronIcon />
            </button>
          </PopoverTrigger>
          <PopoverContent>{categoryGroup}</PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className={`flex h-11 min-h-[44px] items-center gap-1.5 px-3.5 rounded-sm border font-sans text-small ${
                activeCond && activeCond.label !== "Todos"
                  ? "border-primary text-primary bg-accent"
                  : "border-input text-foreground bg-card"
              }`}
            >
              {activeCond && activeCond.label !== "Todos" ? `Estado: ${activeCond.label}` : "Estado"}
              <ChevronIcon />
            </button>
          </PopoverTrigger>
          <PopoverContent>{conditionGroup}</PopoverContent>
        </Popover>

        {hasLocation && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`flex h-11 min-h-[44px] items-center gap-1.5 px-3.5 rounded-sm border font-sans text-small ${
                  !distanceIsDefault ? "border-primary text-primary bg-accent" : "border-input text-foreground bg-card"
                }`}
              >
                {!distanceIsDefault ? `Distancia: ${maxDistLabel}` : "Distancia"}
                <ChevronIcon />
              </button>
            </PopoverTrigger>
            <PopoverContent>{distanceGroup}</PopoverContent>
          </Popover>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <button className="flex h-11 min-h-[44px] items-center gap-1.5 px-3.5 rounded-sm border border-input bg-card text-foreground font-sans text-small">
              Ordenar: {sortLabel}
              <ChevronIcon />
            </button>
          </PopoverTrigger>
          <PopoverContent>{sortGroup}</PopoverContent>
        </Popover>
      </div>

      <div className="flex min-[768px]:hidden mb-8">
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <button className="flex h-11 min-h-[44px] items-center gap-2 px-4 rounded-sm border border-input bg-card font-sans text-small text-foreground">
              Filtros
              {activeFilterCount > 0 && (
                <span className="font-sans text-small text-primary">· {activeFilterCount}</span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-background max-h-[80vh] overflow-auto">
            <SheetHeader>
              <SheetTitle className="font-serif text-title">Filtros</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6 px-4 pb-4">
              {categoryGroup}
              {conditionGroup}
              {distanceGroup}
              {sortGroup}
              <Button onClick={() => setFiltersOpen(false)} className="w-full">
                Ver resultados
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <QueryState
        loading={loading}
        error={error}
        isEmpty={empty}
        skeleton={<BookRowsSkeleton />}
        emptyTitle="Nada con esos filtros"
        emptyDescription={
          searching
            ? `Ningún título ni autor coincide con «${query.trim()}». Prueba con menos palabras.`
            : "Prueba con otra categoría, otro estado o un radio más amplio."
        }
      >
        <div className="flex flex-col gap-6">
          {items.map((b, i) => (
            <article
              key={i}
              data-reveal
              className="group grid grid-cols-1 min-[640px]:grid-cols-[74px_minmax(0,1fr)_minmax(0,200px)] gap-5 min-[640px]:gap-6 items-start bg-card rounded-sm p-4 sm:p-5 border border-border/60"
            >
              {/* La portada es lo primero que se lee: grande en móvil, donde
                  cada resultado ocupa toda su propia tarjeta, y compacta desde
                  640px, donde vuelve a leerse como una fila. */}
              <BookCover
                cover={b.cover}
                plate={b.plate}
                title={b.t}
                size="sm"
                className="w-32 h-[192px] min-[640px]:w-[74px] min-[640px]:h-[111px] rounded-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg"
              />
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2.5 flex-wrap items-baseline">
                  {/* Enlace real, no un manejador: así se puede compartir, abrir
                      en otra pestaña e indexar. Sale de la aplicación de una
                      sola página, y el botón «atrás» devuelve aquí. */}
                  <h3 className="font-serif text-title m-0">
                    <Link href={b.href} className="text-foreground no-underline hover:underline underline-offset-4">
                      {b.t}
                    </Link>
                  </h3>
                  <span className="font-sans text-small text-muted-foreground">{b.a}</span>
                </div>
                <p className="font-serif text-body text-foreground/85 max-w-[46em]">{b.desc}</p>
                <div className="flex gap-3 flex-wrap items-center mt-0.5">
                  <Badge variant="secondary">{b.cat}</Badge>
                  <BookCondition cond={b.cond} />
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
                  {b.dist !== null && (
                    <>
                      {" · "}
                      <DistanceLabel km={b.dist} />
                    </>
                  )}{" · "}
                  <Reputation rating={b.rating} />
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
  );
}
