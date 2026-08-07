import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "El Canje",
  description: "Intercambia libros usados con lectores cerca de ti en Bogotá. Sin dinero, sin publicidad.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sourceSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-serif" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
