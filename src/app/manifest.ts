import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

// Sin esto, "Agregar a pantalla de inicio" muestra el dominio y un ícono
// genérico en vez del nombre y la marca de Librocambio.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} · Intercambio de libros usados en Bogotá`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f3f2f2",
    // El mismo crema que el `themeColor` del layout: en el navegador manda el
    // meta y en la app instalada manda esto, así que si no coinciden la misma
    // app tiene una barra de un color en Chrome y de otro en el ícono.
    theme_color: "#f3f2f2",
    lang: "es-CO",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
