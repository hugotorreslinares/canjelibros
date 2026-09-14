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
// Mismo glifo que `apple-icon.tsx` — dos lomos de libro, no una inicial.
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
        <svg width="327" height="327" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="10" width="5.4" height="16" rx="1.4" fill="#f8f4f4" />
          <rect x="17.6" y="6.5" width="6" height="19.5" rx="1.4" fill="#f8f4f4" />
        </svg>
      </div>
    ),
    size
  );
}
