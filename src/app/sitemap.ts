import type { MetadataRoute } from "next";
import { fetchAllBooks } from "@/lib/books-server";
import { pathForBook } from "@/lib/book-slug";
import { ROUTE_SEO, SITE_URL } from "@/lib/seo";
import { pathForRoute } from "@/lib/routes";
import type { Route } from "@/lib/types";

// Solo las vistas públicas. Los estantes de cada lector no entran: son
// personales y su contenido no está en el HTML.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const vistas = (Object.entries(ROUTE_SEO) as [Route, (typeof ROUTE_SEO)[Route]][])
    .filter(([, seo]) => seo.index)
    .map(([route, seo]) => ({
      url: `${SITE_URL}${pathForRoute(route)}`,
      lastModified,
      changeFrequency: seo.changeFrequency,
      priority: seo.priority,
    }));

  // Solo las fichas que se indexan. Un libro sin descripción escrita por su
  // dueño lleva `noindex`, y listar en el sitemap algo que se pide no indexar es
  // una contradicción que los buscadores reportan.
  const fichas = (await fetchAllBooks())
    .filter((b) => b.desc.trim().length >= 60)
    .map((b) => ({
      url: `${SITE_URL}${pathForBook(b)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [...vistas, ...fichas];
}
