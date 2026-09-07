import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

export const alt = "Librocambio · Intercambio de libros usados en Bogotá";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// La imagen que se ve cuando alguien comparte el enlace en WhatsApp o en una
// red. Sin ella, el enlace aparece como una tarjeta gris sin nada.
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f4ed",
          color: "#171717",
          padding: 72,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 30, letterSpacing: 8, color: "#6b645c" }}>BOGOTÁ</div>
          <div style={{ fontSize: 128, fontWeight: 600, letterSpacing: -3 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 44, lineHeight: 1.25, maxWidth: 900, color: "#171717" }}>
            Intercambio vecinal de libros usados. Libro por libro, sin dinero.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 220, height: 10, background: "#b84a32" }} />
          <div style={{ fontSize: 28, color: "#6b645c" }}>Publica los que ya leíste · Encuentra los que te faltan</div>
        </div>
      </div>
    ),
    size
  );
}
