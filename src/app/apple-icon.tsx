import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS aplica sus propias esquinas redondeadas al agregar a pantalla de
// inicio, así que este va sin borderRadius y con fondo sólido (no transparente).
// Dos lomos de libro de altura distinta, no una inicial: a este tamaño (y en
// el de 512) se lee como objeto, no como letra — ver el comparativo en
// PLAN.md si hace falta recordar por qué se eligió.
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
        <svg width="115" height="115" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="10" width="5.4" height="16" rx="1.4" fill="#f8f4f4" />
          <rect x="17.6" y="6.5" width="6" height="19.5" rx="1.4" fill="#f8f4f4" />
        </svg>
      </div>
    ),
    size
  );
}
