import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Vistas personales: su contenido es del lector, llega por JavaScript y
        // no aporta nada a un índice.
        disallow: ["/estante", "/publicar", "/mensajes", "/moderacion", "/lector/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
