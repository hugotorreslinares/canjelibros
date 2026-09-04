/**
 * La dirección de un libro: `/libro/rayuela-julio-cortazar-a3f9c1x2...`
 *
 * El identificador va al final y separado por guion. Los identificadores que
 * genera Firestore son veinte caracteres alfanuméricos, sin guiones, así que
 * cortar por el último guion siempre devuelve el identificador entero por más
 * guiones que traiga el título.
 *
 * El texto de delante no se usa para buscar nada: está para que el enlace se
 * entienda al leerlo y al compartirlo. Si alguien edita el título, la dirección
 * vieja sigue funcionando.
 */
export function slugForBook(book: { id: string; t: string; a: string }): string {
  const texto = normalizar(`${book.t} ${book.a}`);
  return texto ? `${texto}-${book.id}` : book.id;
}

export function bookIdFromSlug(slug: string): string {
  const corte = slug.lastIndexOf("-");
  return corte === -1 ? slug : slug.slice(corte + 1);
}

export function pathForBook(book: { id: string; t: string; a: string }): string {
  return `/libro/${slugForBook(book)}`;
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    // Quita los acentos sin perder la letra: «Cortázar» se comparte como
    // «cortazar» y no como «cort%C3%A1zar».
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}
