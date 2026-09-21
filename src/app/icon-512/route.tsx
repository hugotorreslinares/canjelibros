import { ImageResponse } from "next/og";

const size = { width: 512, height: 512 };

// La imagen es la misma en cada petición, así que se prerenderiza en el build
// en vez de generarse cada vez. Sin esto es la única ruta dinámica del sitio.
export const dynamic = "force-static";

// `size` y `contentType` como exports son de la convención de iconos
// (icon.tsx, apple-icon.tsx), no de un route handler: aquí no harían nada.
// El tipo lo pone ImageResponse por su cuenta.

// Chrome en Android pide un ícono de 512×512 para el prompt de "instalar
// app" y para el splash screen; sin este, el manifest queda incompleto.
// Mismo glifo que `apple-icon.tsx`: el símbolo del logotipo.
export function GET() {
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
        <svg width="240" height="308" viewBox="4 4 142 182" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6 H58 V126 L32 102 L6 126 Z" fill="#f8f4f4" />
          <path d="M92 64 L118 88 L144 64 V184 H92 Z" fill="rgba(248, 244, 244, 0.72)" />
        </svg>
      </div>
    ),
    size
  );
}
