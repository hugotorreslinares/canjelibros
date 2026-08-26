import type { Metadata } from "next";
import { Archivo, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/lib/auth-context";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, siteJsonLd } from "@/lib/seo";
import "./globals.css";

// Los nombres de variable no repiten los tokens (--font-serif / --font-sans):
// `@theme inline` apunta a estas, y llamarlas igual las volvería circulares.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  // metadataBase resuelve las rutas relativas de canonical y openGraph.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Intercambio de libros usados en Bogotá`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "intercambio de libros",
    "canje de libros",
    "libros usados Bogotá",
    "trueque de libros",
    "biblioteca vecinal",
    "libros de segunda mano",
  ],
  authors: [{ name: SITE_NAME }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "es_CO",
    url: SITE_URL,
    title: `${SITE_NAME} · Intercambio de libros usados en Bogotá`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · Intercambio de libros usados en Bogotá`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "books",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${sourceSerif.variable} ${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Va dentro del HTML servido, así que un buscador o un modelo entiende
            qué es este sitio sin ejecutar JavaScript ni esperar a Firestore. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }}
        />
        <AuthProvider>{children}</AuthProvider>
        {/* Analítica sin cookies ni identificadores por persona: cuenta visitas
            de página, no lectores. Solo emiten en el despliegue de Vercel; en
            local no envían nada. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
