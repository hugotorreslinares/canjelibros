import type { Metadata } from "next";
import { Archivo, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
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
  title: "El Canje",
  description: "Intercambia libros usados con lectores cerca de ti en Bogotá. Sin dinero, sin publicidad.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sourceSerif.variable} ${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        {/* Analítica sin cookies ni identificadores por persona: cuenta visitas
            de página, no lectores. Solo emite en el despliegue de Vercel; en
            local no envía nada. */}
        <Analytics />
      </body>
    </html>
  );
}
