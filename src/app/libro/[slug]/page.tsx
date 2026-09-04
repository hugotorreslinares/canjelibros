import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/BookCover";
import { bookIdFromSlug, pathForBook, slugForBook } from "@/lib/book-slug";
import { fetchAllBooks, fetchBook } from "@/lib/books-server";
import { plateFor } from "@/lib/design-utils";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// La ficha se rehace cada hora en vez de en cada visita. Con un catálogo de
// doscientos libros son unas doscientas lecturas por hora en el peor caso,
// contra un tope diario de cincuenta mil en el plan gratuito.
export const revalidate = 3600;

// Un libro necesita una descripción escrita por su dueño para merecer estar en
// un índice. Cientos de fichas con solo título y autor son contenido delgado
// —lo que las políticas de spam de Google llaman contenido a escala— y hunden
// al sitio entero, no solo a la ficha. Se publican todas; se indexan las que
// tienen algo que leer.
const MINIMO_PARA_INDEXAR = 60;

export async function generateStaticParams() {
  const books = await fetchAllBooks();
  return books.map((b) => ({ slug: slugForBook(b) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const datos = await fetchBook(bookIdFromSlug((await params).slug));
  if (!datos) return { title: "Libro no encontrado", robots: { index: false, follow: false } };

  const { book } = datos;
  const titulo = `${book.t}${book.a ? ` — ${book.a}` : ""}`;
  const descripcion = book.desc.trim()
    ? `${book.desc.trim()} · ${book.cond}, para intercambiar en Bogotá.`
    : `${book.t} en estado ${book.cond.toLowerCase()}, disponible para intercambio entre lectores de Bogotá.`;
  const ruta = pathForBook(book);

  return {
    title: `${titulo}, usado para intercambio en Bogotá`,
    description: descripcion.slice(0, 300),
    alternates: { canonical: ruta },
    robots:
      book.desc.trim().length >= MINIMO_PARA_INDEXAR ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${titulo} · ${SITE_NAME}`,
      description: descripcion.slice(0, 300),
      url: ruta,
      type: "article",
    },
  };
}

export default async function BookPage({ params }: PageProps) {
  const datos = await fetchBook(bookIdFromSlug((await params).slug));
  // Un libro se borra cuando se canjea o cuando su dueño se arrepiente, así que
  // estas direcciones mueren a diario. 404 es la respuesta correcta: deja que el
  // buscador la retire en vez de acumular páginas fantasma.
  if (!datos) notFound();

  const { book, owner } = datos;
  const reservado = Boolean(book.resUid);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.t,
    author: book.a ? { "@type": "Person", name: book.a } : undefined,
    description: book.desc || undefined,
    bookFormat: "https://schema.org/Paperback",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "COP",
      availability: reservado ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      description: "Se intercambia por otro libro. No se vende.",
      areaServed: { "@type": "City", name: "Bogotá" },
      url: `${SITE_URL}${pathForBook(book)}`,
    },
  };

  return (
    <div className="w-full mx-auto max-w-[820px] px-6 sm:px-10 pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Esta ruta vive fuera de la aplicación —es una página de verdad, no una
          vista del catch-all—, así que no hereda el encabezado. Con solo el
          enlace de volver, quien llega desde un buscador no sabe dónde está. */}
      <div className="flex items-baseline justify-between gap-4 flex-wrap border-b border-border pb-4">
        <Link
          href="/"
          className="font-serif text-subtitle font-semibold tracking-[-.02em] text-foreground no-underline"
        >
          {SITE_NAME}
        </Link>
        <Button variant="link" asChild className="px-0">
          <Link href="/">← Volver al catálogo</Link>
        </Button>
      </div>

      <div className="grid gap-8 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:gap-10 items-start mt-4">
        <BookCover
          cover={book.cover}
          plate={plateFor(book.t.length)}
          title={book.t}
          author={book.a}
          size="lg"
          className="w-full max-w-[200px] aspect-2/3"
        />

        <div>
          <p className="font-sans text-label uppercase text-muted-foreground m-0">
            {book.cat}
            {book.cond && <> · {book.cond}</>}
          </p>
          <h1 className="font-serif text-display mt-2 mb-0">{book.t}</h1>
          {book.a && <p className="font-serif text-subtitle text-muted-foreground mt-2 mb-0">{book.a}</p>}

          <div className="h-[5px] bg-foreground mt-5 mb-0.5" />
          <div className="h-px bg-foreground mb-6" />

          {book.desc && <p className="font-serif text-body text-foreground m-0">{book.desc}</p>}

          <p className="font-sans text-small text-muted-foreground mt-6 mb-0">
            {owner ? (
              <>
                Lo tiene {owner.name}, en Bogotá
                {owner.trades > 0 && <> · {owner.trades} intercambios cerrados</>}
              </>
            ) : (
              <>Publicado por un lector de Bogotá</>
            )}
          </p>

          <div className="mt-8">
            {reservado ? (
              <>
                <Button disabled>Reservado</Button>
                <p className="font-sans text-small text-muted-foreground max-w-[40ch] mt-2 mb-0">
                  Alguien ya propuso un canje por este libro. Vuelve a estar libre si la propuesta no
                  cierra.
                </p>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link href="/">Proponer un canje</Link>
                </Button>
                <p className="font-sans text-small text-muted-foreground max-w-[40ch] mt-2 mb-0">
                  El canje es libro por libro: necesitas uno publicado para ofrecer a cambio.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
