import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// El favicon que create-next-app deja por defecto nunca se reemplazó: la
// pestaña del navegador mostraba el logo de Next, no el de Librocambio.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#00769a",
          borderRadius: "50%",
          color: "#f8f4f4",
          fontFamily: "Georgia, serif",
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        L
      </div>
    ),
    size
  );
}
