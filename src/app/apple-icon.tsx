import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS aplica sus propias esquinas redondeadas al agregar a pantalla de
// inicio, así que este va sin borderRadius y con fondo sólido (no transparente).
// El símbolo del logotipo (ver `Logo.tsx`), el mismo de la pestaña y del icono
// de 512 px: dos marcapáginas, uno que baja y otro que sube.
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
          background: "#b84a32",
        }}
      >
        <svg width="84" height="108" viewBox="4 4 142 182" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6 H58 V126 L32 102 L6 126 Z" fill="#f8f4f4" />
          <path d="M92 64 L118 88 L144 64 V184 H92 Z" fill="rgba(248, 244, 244, 0.72)" />
        </svg>
      </div>
    ),
    size
  );
}
