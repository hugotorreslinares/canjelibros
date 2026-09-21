import { ImageResponse } from "next/og";
import { bookIdFromSlug } from "@/lib/book-slug";
import { fetchBookOnly } from "@/lib/books-server";
import { plateFor } from "@/lib/design-utils";
import { SITE_NAME } from "@/lib/seo";

export const alt = "Un libro para intercambiar en Librocambio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COVER = { width: 340, height: 510 };

function recortar(texto: string, max: number): string {
  return texto.length > max ? `${texto.slice(0, max - 1).trimEnd()}…` : texto;
}

// Lo que se ve cuando alguien comparte la ficha en Facebook, WhatsApp o una red:
// la portada del libro y la invitación a intercambiar. Los colores van en hex
// porque Satori no lee variables CSS; son los mismos tokens del sitio.
export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const book = await fetchBookOnly(bookIdFromSlug((await params).slug));

  // Un libro borrado devuelve 404 en la ficha; su imagen, la tarjeta del sitio.
  if (!book) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
            background: "#f7f4ed",
            color: "#171717",
            padding: 72,
          }}
        >
          <div style={{ fontSize: 128, fontWeight: 600, letterSpacing: -3 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 44 }}>Intercambio vecinal de libros usados en Bogotá.</div>
        </div>
      ),
      size
    );
  }

  const titulo = recortar(book.t, 90);
  const cuerpo = titulo.length <= 24 ? 76 : titulo.length <= 44 ? 62 : 50;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          background: "#f7f4ed",
          color: "#171717",
          padding: "60px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: COVER.width,
            height: COVER.height,
            flexShrink: 0,
            boxShadow: "0 18px 40px rgba(23, 23, 23, 0.3)",
          }}
        >
          {book.cover ? (
            <img src={book.cover} width={COVER.width} height={COVER.height} style={{ objectFit: "cover" }} alt="" />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                width: COVER.width,
                height: COVER.height,
                background: plateFor(book.id),
                color: "#f8f4f4",
                padding: 32,
                fontSize: 40,
                lineHeight: 1.1,
              }}
            >
              {recortar(book.t, 60)}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 22 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#6b645c" }}>PARA INTERCAMBIAR · BOGOTÁ</div>
          <div style={{ fontSize: cuerpo, fontWeight: 600, lineHeight: 1.08 }}>{titulo}</div>
          {book.a ? <div style={{ fontSize: 36, color: "#6b645c" }}>{recortar(book.a, 50)}</div> : null}
          <div style={{ width: 160, height: 8, background: "#b84a32" }} />
          <div style={{ fontSize: 38, lineHeight: 1.25 }}>Cámbialo por otro libro usado. Sin dinero.</div>
          <div style={{ fontSize: 36, fontWeight: 600, color: "#933b28" }}>librocambio.com</div>
        </div>
      </div>
    ),
    size
  );
}
