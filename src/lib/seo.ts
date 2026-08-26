import type { Route } from "./types";

export const SITE_NAME = "Circular";

// En Vercel el dominio de producción llega en VERCEL_PROJECT_PRODUCTION_URL, así
// que las URL canónicas salen bien sin configurar nada. NEXT_PUBLIC_SITE_URL
// manda si algún día hay dominio propio.
export const SITE_URL = (() => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
})();

export const SITE_DESCRIPTION =
  "Circular es un intercambio vecinal de libros usados en Bogotá: publica los que ya leíste, mira los que tienen cerca de ti y acuerden el canje por mensaje. Sin dinero y sin publicidad.";

interface RouteSeo {
  title: string;
  description: string;
  /** Las vistas personales no aportan nada a un buscador: su contenido es del lector, y en el HTML no viene. */
  index: boolean;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

export const ROUTE_SEO: Record<Route, RouteSeo> = {
  map: {
    title: "Intercambio de libros usados en Bogotá",
    description: SITE_DESCRIPTION,
    index: true,
    changeFrequency: "daily",
    priority: 1,
  },
  catalog: {
    title: "Catálogo de libros disponibles para canje",
    description:
      "Mira qué libros usados tienen los lectores cerca de ti en Bogotá, filtra por categoría y estado, y propón un canje uno por uno.",
    index: true,
    changeFrequency: "daily",
    priority: 0.9,
  },
  policies: {
    title: "Políticas del sitio",
    description:
      "Qué se puede publicar en Circular y qué no: obras protegidas por derecho de autor, documentos con reserva legal, datos personales de terceros, y cómo reportar una publicación.",
    index: true,
    changeFrequency: "monthly",
    priority: 0.6,
  },
  shelf: {
    title: "Mi estante",
    description: "Tus libros publicados, tus cupos y tus intercambios cerrados.",
    index: false,
    changeFrequency: "weekly",
    priority: 0.1,
  },
  publish: {
    title: "Publicar un libro",
    description: "Pon un libro usado en circulación: título, autor, estado y una foto tuya del ejemplar.",
    index: false,
    changeFrequency: "monthly",
    priority: 0.1,
  },
  chat: {
    title: "Mensajes",
    description: "Tus conversaciones de canje.",
    index: false,
    changeFrequency: "weekly",
    priority: 0.1,
  },
  moderation: {
    title: "Moderación",
    description: "Panel de moderación de publicaciones.",
    index: false,
    changeFrequency: "weekly",
    priority: 0.1,
  },
};

// Lo que un buscador —o un modelo— necesita saber del sitio en una frase.
// Se sirve como JSON-LD en el HTML, así que no depende de que Firestore
// responda ni de que el visitante ejecute JavaScript.
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "es-CO",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        areaServed: {
          "@type": "City",
          name: "Bogotá",
          address: { "@type": "PostalAddress", addressLocality: "Bogotá", addressCountry: "CO" },
        },
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/#service`,
        name: "Intercambio de libros usados",
        serviceType: "Intercambio de libros entre vecinos",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "City", name: "Bogotá" },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "COP",
          description: "El canje es libro por libro: no se cobra ni se vende.",
        },
      },
    ],
  };
}
