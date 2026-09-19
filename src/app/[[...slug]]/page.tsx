import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ElCanjeApp } from "@/components/ElCanjeApp";
import type { NearbyItem } from "@/components/NearbyBooks";
import { pathForBook } from "@/lib/book-slug";
import { fetchRecentBooks } from "@/lib/books-server";
import { plateFor } from "@/lib/design-utils";
import { isKnownPath, locationFromPath } from "@/lib/routes";
import { ROUTE_SEO, SITE_NAME } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

// La portada se rehace cada diez minutos: las primeras portadas del HTML llegan
// de Firestore, y sin esto cada visita las leería de nuevo. El navegador
// corrige lo que haya cambiado desde entonces en cuanto llega su instantánea.
export const revalidate = 600;

export function generateStaticParams() {
  return [{ slug: [] }];
}

function pathnameFrom(slug: string[] | undefined): string {
  return slug?.length ? `/${slug.join("/")}` : "/";
}

// «Cerca de ti» sin ubicación son los últimos libros publicados y libres, y
// enseña ocho: el HTML trae esos mismos, para que la fila ya esté ahí antes de
// que el navegador abra Firestore. Se piden más de ocho porque los reservados
// no cuentan. La imagen va por `/portada/[id]`, no como data URL: incrustar
// ocho fotos duplicaría ~300 KB en el HTML y otra vez en el payload de React.
async function primerasPortadas(): Promise<NearbyItem[]> {
  try {
    const libros = await fetchRecentBooks(16);
    return libros
      .filter((b) => !b.resUid)
      .slice(0, 8)
      .map((b) => ({
        id: b.id,
        t: b.t,
        a: b.a,
        cover: b.cover ? `/portada/${b.id}` : null,
        plate: plateFor(b.id),
        dist: null,
        href: pathForBook(b),
      }));
  } catch (err) {
    // Sin esto la portada sigue funcionando: solo llega sin lista en el HTML.
    console.error("no se pudieron leer las primeras portadas", err);
    return [];
  }
}

// Una sola página sirve todas las vistas, así que el título y la descripción de
// cada una salen de aquí: sin esto, buscadores y modelos verían siete
// direcciones distintas con el mismo título y la misma descripción.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const pathname = pathnameFrom((await params).slug);
  const { route, readerId } = locationFromPath(pathname);

  if (readerId) {
    return {
      title: "Estante de un lector",
      description: "El estante de un lector de Librocambio en Bogotá.",
      alternates: { canonical: pathname },
      // El perfil es de una persona y su contenido llega por JavaScript: no hay
      // nada que indexar y sí una privacidad que respetar.
      robots: { index: false, follow: true },
    };
  }

  const seo = ROUTE_SEO[route];
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: pathname },
    robots: seo.index ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${seo.title} · ${SITE_NAME}`,
      description: seo.description,
      url: pathname,
      type: "website",
    },
    twitter: { title: `${seo.title} · ${SITE_NAME}`, description: seo.description },
  };
}

export default async function Page({ params }: PageProps) {
  const pathname = pathnameFrom((await params).slug);
  if (!isKnownPath(pathname)) notFound();
  return <ElCanjeApp initialNearby={pathname === "/" ? await primerasPortadas() : []} />;
}
