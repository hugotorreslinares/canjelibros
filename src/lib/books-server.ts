import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, type Firestore } from "firebase/firestore";
import type { Book } from "./types";

/**
 * Lectura de libros desde el servidor, para las fichas de `/libro/[slug]`.
 *
 * Usa el SDK web, no el Admin: las reglas ya permiten lectura pública de
 * `books` y `readers`, así que no hace falta credencial de servicio ni un
 * secreto más en el despliegue. Y no cuesta plan de pago: Firestore entra en el
 * plan gratuito con 50.000 lecturas al día, muy por encima de lo que gasta una
 * ficha regenerada cada hora.
 *
 * Instancia propia, con nombre propio, para no arrastrar `getAuth` —que es cosa
 * del navegador— al paquete del servidor.
 */
const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const NOMBRE = "librocambio-servidor";

function baseDeDatos(): Firestore | null {
  if (!config.apiKey || !config.projectId) return null;
  const app = getApps().find((a) => a.name === NOMBRE) ?? initializeApp(config, NOMBRE);
  return getFirestore(app);
}

export interface BookPage {
  book: Book;
  owner: { id: string; name: string; trades: number } | null;
}

function mapBook(id: string, data: Record<string, unknown>): Book {
  return {
    id,
    ownerId: String(data.ownerId ?? ""),
    t: String(data.t ?? ""),
    a: String(data.a ?? ""),
    cat: String(data.cat ?? ""),
    cond: String(data.cond ?? ""),
    desc: String(data.desc ?? ""),
    cover: typeof data.cover === "string" ? data.cover : null,
    resUid: typeof data.resUid === "string" ? data.resUid : null,
    createdAt: 0,
  };
}

export async function fetchBook(id: string): Promise<BookPage | null> {
  const db = baseDeDatos();
  if (!db) return null;

  const snap = await getDoc(doc(db, "books", id));
  if (!snap.exists()) return null;
  const book = mapBook(snap.id, snap.data());

  let owner: BookPage["owner"] = null;
  if (book.ownerId) {
    const r = await getDoc(doc(db, "readers", book.ownerId));
    if (r.exists()) {
      const d = r.data();
      owner = {
        id: r.id,
        // Solo el nombre de pila. La ficha es pública e indexable, y el barrio
        // de una persona no tiene por qué acabar en un buscador.
        name: String(d.name ?? "").split(" ")[0] || "Un lector",
        trades: Number(d.trades ?? 0),
      };
    }
  }

  return { book, owner };
}

/** Todos los libros, para generar las fichas y el sitemap. Una sola lectura de colección. */
export async function fetchAllBooks(): Promise<Book[]> {
  const db = baseDeDatos();
  if (!db) return [];
  const snap = await getDocs(collection(db, "books"));
  return snap.docs.map((d) => mapBook(d.id, d.data()));
}
