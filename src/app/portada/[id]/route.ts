import { fetchCover } from "@/lib/books-server";

// El CDN guarda la imagen un día; si el dueño cambia la foto, el navegador la
// ve al cabo de una hora. Cada libro son unos 40 KB: sin esta caché, cada
// visita a la portada volvería a leerlos de Firestore.
const CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400";

export async function GET(_req: Request, ctx: RouteContext<"/portada/[id]">) {
  const { id } = await ctx.params;
  // Los identificadores de Firestore son alfanuméricos; cualquier otra cosa
  // (una `/` incluida) rompería la ruta del documento.
  if (!/^[A-Za-z0-9]+$/.test(id)) return new Response(null, { status: 404 });

  const cover = await fetchCover(id);
  if (!cover) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(cover.bytes), {
    headers: { "Content-Type": cover.type, "Cache-Control": CACHE },
  });
}
