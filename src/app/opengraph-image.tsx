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
          background: "#f3f2f2",
          color: "#201e1d",
          padding: 72,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 30, letterSpacing: 8, color: "#605d5d" }}>BOGOTÁ</div>
          <div style={{ fontSize: 128, fontWeight: 600, letterSpacing: -3 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 44, lineHeight: 1.25, maxWidth: 900, color: "#444141" }}>
            Intercambio vecinal de libros usados. Libro por libro, sin dinero.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 220, height: 10, background: "#00769a" }} />
          <div style={{ fontSize: 28, color: "#605d5d" }}>Publica los que ya leíste · Encuentra los que te faltan</div>
        </div>
      </div>
    ),
    size
  );
}
