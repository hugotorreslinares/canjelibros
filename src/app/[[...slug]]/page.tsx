import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ElCanjeApp } from "@/components/ElCanjeApp";
import { isKnownPath, locationFromPath } from "@/lib/routes";
import { ROUTE_SEO, SITE_NAME } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

function pathnameFrom(slug: string[] | undefined): string {
  return slug?.length ? `/${slug.join("/")}` : "/";
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
      description: "El estante de un lector de Circular en Bogotá.",
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
  };
}

export default async function Page({ params }: PageProps) {
  const pathname = pathnameFrom((await params).slug);
  if (!isKnownPath(pathname)) notFound();
  return <ElCanjeApp />;
}
