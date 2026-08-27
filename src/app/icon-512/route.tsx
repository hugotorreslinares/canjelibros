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
          background: "#00769a",
          color: "#f8f4f4",
          fontFamily: "Georgia, serif",
          fontSize: 280,
          fontWeight: 700,
        }}
      >
        L
      </div>
    ),
    size
  );
}
