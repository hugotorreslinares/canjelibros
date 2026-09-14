import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// El favicon que create-next-app deja por defecto nunca se reemplazó: la
// pestaña del navegador mostraba el logo de Next, no el de Librocambio.
// Un marcapáginas en vez de una inicial: es «libro» sin depender de una
// letra, y su silueta aguanta los 16 px reales de una pestaña — ver el
// comparativo en PLAN.md si hace falta recordar por qué se eligió.
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
          background: "#b84a32",
          borderRadius: "50%",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 6 H21 V26 L16 21 L11 26 Z" fill="#f8f4f4" />
        </svg>
      </div>
    ),
    size
  );
}
