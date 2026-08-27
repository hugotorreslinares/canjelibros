import type { MetadataRoute } from "next";
import { ROUTE_SEO, SITE_URL } from "@/lib/seo";
import { pathForRoute } from "@/lib/routes";
import type { Route } from "@/lib/types";

// Solo las vistas públicas. Los estantes de cada lector no entran: son
// personales y su contenido no está en el HTML.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return (Object.entries(ROUTE_SEO) as [Route, (typeof ROUTE_SEO)[Route]][])
    .filter(([, seo]) => seo.index)
    .map(([route, seo]) => ({
      url: `${SITE_URL}${pathForRoute(route)}`,
      lastModified,
      changeFrequency: seo.changeFrequency,
      priority: seo.priority,
    }));
}
