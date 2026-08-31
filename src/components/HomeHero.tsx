import { Button } from "@/components/ui/button";
import { BookCover } from "./BookCover";

interface HeroCover {
  id: string;
  cover: string | null;
  plate: string;
  t: string;
  a: string;
}

interface HomeHeroProps {
  covers: HeroCover[];
  goMap: () => void;
}

// Un giro y un desplazamiento distintos por portada: tres rectángulos
// perfectamente alineados leen como una plantilla, no como libros sobre una
// mesa.
const STACK = [
  "z-30 -rotate-6 translate-y-2",
  "z-20 rotate-2 -translate-y-3",
  "z-10 rotate-8 translate-y-4",
];

export function HomeHero({ covers, goMap }: HomeHeroProps) {
  // El botón lleva al catálogo que ya está debajo, así que es un salto dentro
  // de la página, no una navegación: cambiar de ruta aquí no llevaría a ningún
  // sitio nuevo.
  const scrollToCatalog = () => {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="px-6 sm:px-10 pt-8 pb-8 sm:pt-14 sm:pb-16 border-b border-border">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 items-center">
        <div>
          <h1 className="font-serif text-display sm:text-hero m-0 text-foreground">
            Cambia libros.
            <br />
            Comparte <span className="text-accent-warm">historias.</span>
          </h1>

          <div className="h-0.5 w-24 bg-accent-warm mt-5 mb-5 sm:mt-6 sm:mb-6" />

          <p className="font-sans text-body text-muted-foreground m-0 max-w-[46ch]">
            Conecta con lectores cerca de ti, descubre nuevos libros y haz que las historias sigan su
            camino.
          </p>

          <div className="flex flex-wrap gap-3 mt-6 sm:mt-8">
            <Button onClick={goMap}>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                className="size-5"
              >
                <path d="M10 18s6-5.2 6-9.4A6 6 0 0 0 4 8.6C4 12.8 10 18 10 18Z" />
                <circle cx="10" cy="8.5" r="2.2" />
              </svg>
              Ver lectores cerca
            </Button>
            <Button variant="outline" onClick={scrollToCatalog}>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                className="size-5"
              >
                <path d="M10 5.5S8.3 4 5.6 4H3v11h2.6c2.7 0 4.4 1.5 4.4 1.5m0-11S11.7 4 14.4 4H17v11h-2.6c-2.7 0-4.4 1.5-4.4 1.5m0-11v11" />
              </svg>
              Explorar catálogo
            </Button>
          </div>
        </div>

        {/* Portadas reales del catálogo, no una fotografía de archivo: lo que
            enseña la portada es el contenido que de verdad hay publicado. Si
            todavía no hay libros, la columna entera desaparece en vez de dejar
            un hueco decorado. */}
        {covers.length > 0 && (
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="absolute inset-x-6 inset-y-0 bg-accent" />
            <div className="relative flex items-center justify-center gap-4 py-12">
              {covers.slice(0, 3).map((b, i) => (
                <BookCover
                  key={b.id}
                  cover={b.cover}
                  plate={b.plate}
                  title={b.t}
                  author={b.a}
                  size="md"
                  className={`w-[7.5rem] aspect-2/3 shadow-lg ${STACK[i]}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
