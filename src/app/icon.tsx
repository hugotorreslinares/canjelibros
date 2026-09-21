import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// El favicon que create-next-app deja por defecto nunca se reemplazó: la
// pestaña del navegador mostraba el logo de Next, no el de Librocambio.
// El símbolo del logotipo (ver `Logo.tsx`): dos marcapáginas, uno que baja y
// otro que sube. Sin letra, así que no depende de ninguna tipografía, y a 16 px
// siguen leyéndose como dos formas distintas gracias al desnivel.
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
        <svg width="17" height="22" viewBox="4 4 142 182" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6 H58 V126 L32 102 L6 126 Z" fill="#f8f4f4" />
          <path d="M92 64 L118 88 L144 64 V184 H92 Z" fill="rgba(248, 244, 244, 0.72)" />
        </svg>
      </div>
    ),
    size
  );
}
