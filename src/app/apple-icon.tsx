import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS aplica sus propias esquinas redondeadas al agregar a pantalla de
// inicio, así que este va sin borderRadius y con fondo sólido (no transparente).
export default function AppleIcon() {
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
          color: "#f8f4f4",
          fontFamily: "Georgia, serif",
          fontSize: 96,
          fontWeight: 700,
        }}
      >
        L
      </div>
    ),
    size
  );
}
