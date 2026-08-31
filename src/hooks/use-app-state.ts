"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { plateFor, stars } from "@/lib/design-utils";
import { distanceKm } from "@/lib/geo";
import {
  addRating,
  addReaderInterest,
  bumpReaderTrades,
  closeThread,
  createBook,
  deleteBook as deleteBookDoc,
  logModerationAction,
  openThread,
  removeReaderInterest,
  reserveBook,
  sendThreadMessage,
  transferBook,
  updateBook,
} from "@/lib/firestore-data";
import { CoverError, fileToCoverDataUrl } from "@/lib/image";
import { categories, conds, formCats, formConds, tagList } from "@/lib/mock-data";
import { locationFromPath, pathForReader, pathForRoute } from "@/lib/routes";
import {
  useBooks,
  useIsModerator,
  useModerationLog,
  useMyThreads,
  useRatings,
  usePresenceHeartbeat,
  useReaderProfileSync,
  useReaders,
  useThreadMessages,
} from "./use-firestore-data";
import type { Route, SortOption } from "@/lib/types";

const BASE_SLOTS = 5;
const RECOMMENDED_COUNT = 10;
// Un lector cuenta como presente si su último latido cabe en esta ventana.
const PRESENCE_WINDOW_MS = 5 * 60_000;
const TRADES_PER_SLOT = 3;
const ANIMATE_PINS = true;

interface FormState {
  t: string;
  a: string;
  desc: string;
  cond: string;
  cat: string;
  cover: string | null;
}

const EMPTY_FORM: FormState = { t: "", a: "", desc: "", cond: "Bueno", cat: "Novela", cover: null };

type PendingAction = { kind: "goPublish" } | { kind: "openOffer"; uid: string; bookId: string };

// Un borrado no se confirma con window.confirm: ese diálogo no se puede
// estilar, no es accesible y en moderación además tenía que pedir el motivo
// por window.prompt, que en móvil se pierde.
type PendingDelete = { scope: "shelf" | "moderation"; bookId: string; title: string; reserved: boolean };

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function formatDateTime(ms: number): string {
  if (!ms) return "hace un momento";
  return new Date(ms).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Field-by-field diff so the log says what a moderator actually touched, not just "editó".
type BookFields = { t: string; a: string; cat: string; cond: string; desc: string; cover: string | null };

function diffBook(before: BookFields, after: BookFields): string[] {
  const labels: Array<[keyof Omit<BookFields, "cover">, string]> = [
    ["t", "título"],
    ["a", "autor"],
    ["cat", "categoría"],
    ["cond", "estado"],
    ["desc", "descripción"],
  ];
  const changes = labels
    .filter(([key]) => before[key] !== after[key])
    .map(([key, label]) => `${label}: «${before[key] || "vacío"}» → «${after[key] || "vacío"}»`);
  // The cover is a data URL — log that it changed, never its contents.
  if (before.cover !== after.cover) changes.push(after.cover ? "portada: reemplazada" : "portada: retirada");
  return changes;
}

function isOnline(lastSeenAt: number | null, now: number): boolean {
  return lastSeenAt !== null && now - lastSeenAt < PRESENCE_WINDOW_MS;
}

// Sin latido no se inventa nada: antes decía «visto hace 2 h» de forma literal,
// para todo el mundo y para siempre.
function presenceLine(lastSeenAt: number | null, now: number): string {
  if (lastSeenAt === null) return "";
  if (isOnline(lastSeenAt, now)) return "en línea ahora";
  const minutes = Math.round((now - lastSeenAt) / 60_000);
  if (minutes < 60) return `visto hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `visto hace ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "visto ayer" : `visto hace ${days} días`;
}

function formatTime(ms: number): string {
  if (!ms) return "";
  return new Date(ms).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export function useAppState() {
  const { user } = useAuth();
  useReaderProfileSync(user);
  usePresenceHeartbeat(user);
  const { readers, loading: readersLoading, error: readersError } = useReaders();
  const { books, loading: booksLoading, error: booksError } = useBooks();
  const dataLoading = readersLoading || booksLoading;
  const dataError = readersError || booksError;

  const myUid = user?.uid ?? null;
  const isModerator = useIsModerator(myUid);
  const moderationLog = useModerationLog(isModerator);
  const myReader = readers.find((r) => r.id === myUid) ?? null;
  const myBooks = books.filter((b) => b.ownerId === myUid);
  const otherReaders = readers.filter((r) => r.id !== myUid);
  const { threads: myThreads } = useMyThreads(myUid);

  // Rating average per reader, computed client-side from the `ratings` collection rather
  // than stored on the reader doc: Firestore only lets a user write their own reader doc,
  // so the person being rated can't have their rater update it for them.
  const ratings = useRatings();
  // Las etiquetas se recogían en el modal y se descartaban. Ahora se guardan
  // con la calificación y se muestran en el panel del lector.
  const tagsFor = useMemo(() => {
    const byUid = new Map<string, Map<string, number>>();
    ratings.forEach((r) => {
      const counts = byUid.get(r.ratedUid) ?? new Map<string, number>();
      r.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
      byUid.set(r.ratedUid, counts);
    });
    return (uid: string) =>
      [...(byUid.get(uid) ?? new Map<string, number>()).entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([label, count]) => ({ label, count }));
  }, [ratings]);

  const avgRatingFor = useMemo(() => {
    const byUid = new Map<string, number[]>();
    ratings.forEach((r) => {
      const arr = byUid.get(r.ratedUid) ?? [];
      arr.push(r.stars);
      byUid.set(r.ratedUid, arr);
    });
    return (uid: string) => {
      const arr = byUid.get(uid);
      return arr && arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 5;
    };
  }, [ratings]);

  // `pushState` se integra con el router de Next, así que usePathname refleja
  // el cambio sin recargar ni desmontar la vista (docs: Native History API).
  const pathname = usePathname();
  const { route, readerId: sel } = locationFromPath(pathname);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) window.history.pushState(null, "", path);
  }, []);

  const setRoute = useCallback((r: Route) => navigate(pathForRoute(r)), [navigate]);
  const setSel = useCallback(
    (id: string | null) => navigate(id ? pathForReader(id) : pathForRoute("map")),
    [navigate]
  );
  const [offer, setOffer] = useState<{ uid: string; bookId: string } | null>(null);
  const [offerMineId, setOfferMineId] = useState<string | null>(null);
  const [cat, setCat] = useState("Todas");
  const [cond, setCond] = useState("Todos");
  const [maxDist, setMaxDist] = useState(5);
  const [sort, setSort] = useState<SortOption>("distancia");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [rating, setRating] = useState<string | null>(null);
  const [starsPicked, setStarsPicked] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [modQuery, setModQuery] = useState("");
  const [modEditingId, setModEditingId] = useState<string | null>(null);
  const [modForm, setModForm] = useState<FormState>(EMPTY_FORM);
  const [modReason, setModReason] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [coverBusy, setCoverBusy] = useState(false);

  // La presencia caduca sola: sin este tic, «en línea ahora» se quedaría
  // congelado hasta que llegara otro cambio de Firestore.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const activeThreadId = threadId && myThreads.some((t) => t.id === threadId) ? threadId : myThreads[0]?.id ?? null;
  const threadMessages = useThreadMessages(activeThreadId);

  // UI selection/draft state must not survive a switch to a different signed-in account in
  // the same tab, or stale selections from the previous user leak into the new session.
  // Reset during render (not in an effect) per React's "adjusting state on prop change" pattern.
  const prevUidRef = useRef(myUid);
  if (prevUidRef.current !== myUid) {
    prevUidRef.current = myUid;
    setForm(EMPTY_FORM);
    setEditingBookId(null);
    setOffer(null);
    setOfferMineId(null);
    setThreadId(null);
    setRating(null);
    setStarsPicked(0);
    setTags([]);
    setModQuery("");
    setModEditingId(null);
    setModForm(EMPTY_FORM);
    setModReason("");
    setPendingDelete(null);
    setDeleteReason("");
  }

  const [authOpen, setAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  // Sonner se monta en un portal por encima de los modales y anuncia el mensaje
  // por aria-live. El aviso anterior vivía en z-40 y quedaba tapado por la capa
  // del modal, así que «Elige cuántas estrellas» no se veía nunca.
  const showToast = useCallback((t: string) => {
    toast(t);
  }, []);

  const go = useCallback(
    (r: Route) => {
      setRoute(r);
      toast.dismiss();
    },
    [setRoute]
  );

  const runAction = useCallback(
    (action: PendingAction) => {
      if (action.kind === "goPublish") {
        setEditingBookId(null);
        setForm(EMPTY_FORM);
        go("publish");
      } else {
        setOffer({ uid: action.uid, bookId: action.bookId });
        setOfferMineId(null);
      }
    },
    [go]
  );

  const requireAuth = useCallback(
    (reason: string, action: PendingAction) => {
      if (user) {
        runAction(action);
        return;
      }
      setPendingAction(action);
      setAuthReason(reason);
      setAuthOpen(true);
    },
    [user, runAction]
  );

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    setPendingAction(null);
  }, []);

  const onAuthSuccess = useCallback(() => {
    setAuthOpen(false);
    if (pendingAction) runAction(pendingAction);
    setPendingAction(null);
  }, [pendingAction, runAction]);

  // Defense-in-depth guard for submit actions reached only through an
  // already auth-gated entry point (goPublish / openOffer). No replay here:
  // the user just retries the submit after signing in.
  const promptAuth = useCallback((reason: string) => {
    setPendingAction(null);
    setAuthReason(reason);
    setAuthOpen(true);
  }, []);

  const goPublish = useCallback(
    () => requireAuth("Inicia sesión para publicar un libro y ponerlo en circulación.", { kind: "goPublish" }),
    [requireAuth]
  );

  const openOffer = useCallback(
    (uid: string, bookId: string) =>
      requireAuth("Inicia sesión para proponer un intercambio.", { kind: "openOffer", uid, bookId }),
    [requireAuth]
  );

  const editBook = useCallback(
    (bookId: string) => {
      if (!user) {
        promptAuth("Inicia sesión para editar tu estante.");
        return;
      }
      const b = myBooks.find((x) => x.id === bookId);
      if (!b) return;
      setForm({ t: b.t, a: b.a, desc: b.desc, cond: b.cond, cat: b.cat, cover: b.cover });
      setEditingBookId(bookId);
      go("publish");
    },
    [user, promptAuth, myBooks, go]
  );

  const pickCover = useCallback(
    async (file: File) => {
      setCoverBusy(true);
      try {
        const cover = await fileToCoverDataUrl(file);
        setForm((f) => ({ ...f, cover }));
        showToast("Foto lista. Se guarda al publicar.");
      } catch (err) {
        showToast(err instanceof CoverError ? err.message : "No se pudo procesar la foto.");
      } finally {
        setCoverBusy(false);
      }
    },
    [showToast]
  );

  const clearCover = useCallback(() => setForm((f) => ({ ...f, cover: null })), []);

  const deleteBook = useCallback(
    async (bookId: string) => {
      if (!user) {
        promptAuth("Inicia sesión para eliminar un libro de tu estante.");
        return;
      }
      const b = myBooks.find((x) => x.id === bookId);
      if (!b) return;
      const reservedThread = b.resUid ? myThreads.find((t) => t.participants.includes(b.resUid as string)) : undefined;
      if (b.resUid && !reservedThread?.closed) {
        showToast("No puedes eliminar un libro reservado en un intercambio activo.");
        return;
      }
      setPendingDelete({ scope: "shelf", bookId, title: b.t, reserved: false });
    },
    [user, promptAuth, myBooks, myThreads, showToast]
  );

  const toggleInterest = useCallback(
    async (cat: string) => {
      if (!user) {
        promptAuth("Inicia sesión para elegir tus categorías de interés.");
        return;
      }
      const isActive = (myReader?.interests ?? []).includes(cat);
      try {
        await (isActive ? removeReaderInterest(user.uid, cat) : addReaderInterest(user.uid, cat));
      } catch {
        showToast("No se pudo guardar. Intenta de nuevo.");
      }
    },
    [user, promptAuth, myReader, showToast]
  );

  const moderatorName = myReader?.name ?? user?.displayName ?? user?.email ?? "Moderación";

  const modStartEdit = useCallback(
    (bookId: string) => {
      const b = books.find((x) => x.id === bookId);
      if (!b) return;
      setModForm({ t: b.t, a: b.a, desc: b.desc, cond: b.cond, cat: b.cat, cover: b.cover });
      setModReason("");
      setModEditingId(bookId);
    },
    [books]
  );

  const modCancelEdit = useCallback(() => {
    setModEditingId(null);
    setModForm(EMPTY_FORM);
    setModReason("");
  }, []);

  const modRemoveCover = useCallback(() => setModForm((f) => ({ ...f, cover: null })), []);

  const modSaveEdit = useCallback(async () => {
    if (!isModerator || !user) {
      showToast("No tienes permisos de moderación.");
      return;
    }
    if (!modEditingId) return;
    const before = books.find((x) => x.id === modEditingId);
    if (!before) return;
    if (!modForm.t.trim()) {
      showToast("El título no puede quedar vacío.");
      return;
    }
    if (!modReason.trim()) {
      showToast("Escribe el motivo: queda en la bitácora.");
      return;
    }
    const after = {
      t: modForm.t.trim(),
      a: modForm.a.trim() || "Autor sin datos",
      cat: modForm.cat,
      cond: modForm.cond,
      desc: modForm.desc.trim(),
      cover: modForm.cover,
    };
    const changes = diffBook(before, after);
    if (changes.length === 0) {
      showToast("No cambiaste nada en la publicación.");
      return;
    }
    try {
      await updateBook(modEditingId, after);
    } catch {
      showToast("No se pudo guardar. Revisa tus permisos e intenta de nuevo.");
      return;
    }
    setModEditingId(null);
    setModForm(EMPTY_FORM);
    setModReason("");
    try {
      await logModerationAction({
        action: "edit",
        bookId: before.id,
        bookTitle: before.t,
        ownerId: before.ownerId,
        ownerName: readers.find((r) => r.id === before.ownerId)?.name ?? "Lector sin perfil",
        moderatorUid: user.uid,
        moderatorName,
        reason: modReason.trim(),
        changes,
      });
      showToast("Publicación editada y registrada en la bitácora.");
    } catch {
      showToast("Publicación editada, pero no se pudo registrar en la bitácora.");
    }
  }, [modEditingId, user, isModerator, books, modForm, modReason, readers, moderatorName, showToast]);

  const modDelete = useCallback(
    async (bookId: string) => {
      if (!isModerator || !user) {
        showToast("No tienes permisos de moderación.");
        return;
      }
      const b = books.find((x) => x.id === bookId);
      if (!b) return;
      setDeleteReason("");
      setPendingDelete({ scope: "moderation", bookId, title: b.t, reserved: !!b.resUid });
    },
    [user, isModerator, books, showToast]
  );

  const cancelDelete = useCallback(() => {
    setPendingDelete(null);
    setDeleteReason("");
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const { scope, bookId } = pendingDelete;

    if (scope === "shelf") {
      try {
        await deleteBookDoc(bookId);
        if (editingBookId === bookId) {
          setEditingBookId(null);
          setForm(EMPTY_FORM);
        }
        showToast("Libro eliminado de tu estante.");
      } catch {
        showToast("No se pudo eliminar. Intenta de nuevo.");
      }
      setPendingDelete(null);
      return;
    }

    if (!user) return;
    const reason = deleteReason.trim();
    if (!reason) {
      showToast("Escribe el motivo: la bitácora no acepta un borrado sin él.");
      return;
    }
    const b = books.find((x) => x.id === bookId);
    if (!b) return;
    try {
      await deleteBookDoc(bookId);
    } catch {
      showToast("No se pudo eliminar. Revisa tus permisos e intenta de nuevo.");
      return;
    }
    setPendingDelete(null);
    setDeleteReason("");
    if (modEditingId === bookId) {
      setModEditingId(null);
      setModForm(EMPTY_FORM);
      setModReason("");
    }
    try {
      await logModerationAction({
        action: "delete",
        bookId: b.id,
        bookTitle: b.t,
        ownerId: b.ownerId,
        ownerName: readers.find((r) => r.id === b.ownerId)?.name ?? "Lector sin perfil",
        moderatorUid: user.uid,
        moderatorName,
        reason,
        changes: [],
      });
      showToast("Publicación eliminada y registrada en la bitácora.");
    } catch {
      showToast("Publicación eliminada, pero no se pudo registrar en la bitácora.");
    }
  }, [pendingDelete, deleteReason, user, books, readers, editingBookId, modEditingId, moderatorName, showToast]);

  const vals = useMemo(() => {
    const totalSlots = BASE_SLOTS + Math.floor((myReader?.trades ?? 0) / TRADES_PER_SLOT);
    const used = myBooks.length;
    const navColor = (r: Route) => (route === r ? "#201e1d" : "#605d5d");
    const navLine = (r: Route) => (route === r ? "#0088b0" : "transparent");
    const nameOf = (id: string) => readers.find((r) => r.id === id)?.name.split(" ")[0] ?? "";
    // null = no sabemos dónde está el visitante. Antes esto devolvía 0 y la
    // interfaz publicaba «0 km» como si fuera un dato medido.
    const readerDist = (r: { lat: number; lng: number }): number | null =>
      myReader ? round1(distanceKm(myReader.lat, myReader.lng, r.lat, r.lng)) : null;
    const threadForUid = (uid: string) => myThreads.find((t) => t.participants.includes(uid));

    const selUser = otherReaders.find((r) => r.id === sel) || null;

    const mappedUsers = otherReaders.map((r, i) => {
      const readerBooks = books.filter((b) => b.ownerId === r.id);
      const rating = avgRatingFor(r.id);
      return {
        ...r,
        dist: readerDist(r),
        rating,
        count: readerBooks.length,
        starsLabel: stars(rating),
        ink: isOnline(r.lastSeenAt, now) ? "#00769a" : "#7d7979",
        haloInk: isOnline(r.lastSeenAt, now) ? "rgba(0,118,154,.30)" : "rgba(32,30,29,.16)",
        pulse: isOnline(r.lastSeenAt, now) && ANIMATE_PINS ? 3.4 + i * 0.6 : 0,
        statusLine: presenceLine(r.lastSeenAt, now),
        teaser: readerBooks.slice(0, 2).map((b) => b.t).join(" · "),
        select: () => setSel(r.id),
      };
    });

    const selBooks = selUser
      ? books
          .filter((b) => b.ownerId === selUser.id)
          .map((b, i) => ({
            ...b,
            plate: plateFor(i + 1),
            propose: () => openOffer(selUser.id, b.id),
          }))
      : [];

    const catalogAll: Array<{
      id: string;
      t: string;
      a: string;
      cat: string;
      cond: string;
      desc: string;
      cover: string | null;
      owner: string;
      barrio: string;
      dist: number | null;
      starsLabel: string;
      plate: string;
      reserved: boolean;
      createdAt: number;
      selectOwner: () => void;
      propose: () => void;
    }> = [];
    otherReaders.forEach((r) => {
      books
        .filter((b) => b.ownerId === r.id)
        .forEach((b) => {
          catalogAll.push({
            id: b.id,
            t: b.t,
            a: b.a,
            cat: b.cat,
            cond: b.cond,
            desc: b.desc,
            cover: b.cover,
            owner: r.name,
            barrio: r.barrio,
            dist: readerDist(r),
            starsLabel: stars(avgRatingFor(r.id)),
            plate: plateFor(catalogAll.length),
            reserved: !!b.resUid,
            createdAt: b.createdAt,
            selectOwner: () => setSel(r.id),
            propose: () => openOffer(r.id, b.id),
          });
        });
    });
    const catalog = catalogAll.filter(
      (b) => (cat === "Todas" || b.cat === cat) && (cond === "Todos" || b.cond === cond) && (b.dist === null || b.dist <= maxDist)
    );
    // Sin ubicación no se puede ordenar por distancia: cae a lo más reciente.
    if (sort === "distancia") {
      catalog.sort((a, b) => (a.dist === null || b.dist === null ? b.createdAt - a.createdAt : a.dist - b.dist));
    }
    if (sort === "estado") catalog.sort((a, b) => formConds.indexOf(a.cond) - formConds.indexOf(b.cond));
    if (sort === "título") catalog.sort((a, b) => a.t.localeCompare(b.t));

    // Diez recomendaciones ordenadas por interés y luego por novedad: primero
    // todo lo que cae en una categoría marcada en Mi estante, y si no alcanza a
    // llenar la fila, sigue lo más reciente. Cortar solo por coincidencia dejaba
    // la fila con dos libros en cuanto los intereses eran específicos.
    const myInterests = myReader?.interests ?? [];
    const byInterest = (b: (typeof catalogAll)[number]) => (myInterests.includes(b.cat) ? 0 : 1);
    // Un libro ya reservado no se puede canjear: recomendarlo gasta el clic del
    // lector y lo lleva a una propuesta que su dueño no puede aceptar.
    const ranked = catalogAll
      .filter((b) => !b.reserved)
      .sort((a, b) => byInterest(a) - byInterest(b) || b.createdAt - a.createdAt)
      .slice(0, RECOMMENDED_COUNT);
    const matchCount = ranked.filter((b) => myInterests.includes(b.cat)).length;
    const recommended = {
      title: matchCount > 0 ? "Recomendados para ti" : "Recién publicados",
      // Cuando la fila mezcla, el rótulo dice desde dónde deja de ser por interés.
      note: matchCount > 0 && matchCount < ranked.length ? `${matchCount} por tus intereses` : null,
      items: ranked,
    };

    const counts: Record<string, number> = {};
    let totalBooks = 0;
    otherReaders.forEach((r) => {
      books
        .filter((b) => b.ownerId === r.id)
        .forEach((b) => {
          counts[b.cat] = (counts[b.cat] || 0) + 1;
          totalBooks += 1;
        });
    });

    const offerBook = offer ? books.find((b) => b.id === offer.bookId) || null : null;
    const offerUser = offer ? otherReaders.find((r) => r.id === offer.uid) || null : null;

    const pendingBook = myBooks.find((b) => b.resUid && !threadForUid(b.resUid)?.closed) || null;
    const pendingUser = pendingBook ? otherReaders.find((r) => r.id === pendingBook.resUid) || null : null;

    const mappedMyBooks = myBooks.map((b) => {
      const activelyReserved = !!b.resUid && !threadForUid(b.resUid)?.closed;
      return {
        ...b,
        plate: plateFor(myBooks.indexOf(b)),
        state: activelyReserved ? `Reservado con ${nameOf(b.resUid as string)}` : "Disponible",
        reserved: activelyReserved,
        canRemove: !activelyReserved,
        edit: () => editBook(b.id),
        remove: () => deleteBook(b.id),
      };
    });

    const slotsLeft = totalSlots - used;
    const slotNote =
      used < totalSlots
        ? `${slotsLeft === 1 ? "Te queda 1 cupo libre." : `Te quedan ${slotsLeft} cupos libres.`} Al cerrar ${
            TRADES_PER_SLOT - ((myReader?.trades ?? 0) % TRADES_PER_SLOT)
          } canjes más se abre otro.`
        : `Estante lleno. Cierra un intercambio para abrir el cupo ${totalSlots + 1}.`;

    const activeThreadDoc = activeThreadId ? myThreads.find((t) => t.id === activeThreadId) ?? null : null;
    const otherUidInThread = activeThreadDoc ? activeThreadDoc.participants.find((p) => p !== myUid) ?? null : null;
    const threadReader = otherUidInThread ? otherReaders.find((r) => r.id === otherUidInThread) ?? null : null;
    const thread =
      activeThreadDoc && threadReader
        ? {
            id: activeThreadDoc.id,
            name: threadReader.name,
            barrio: threadReader.barrio,
            dist: readerDist(threadReader),
            statusLine: presenceLine(threadReader.lastSeenAt, now),
            closed: activeThreadDoc.closed,
            dealText: activeThreadDoc.dealText,
            fromUid: activeThreadDoc.fromUid,
            toUid: activeThreadDoc.toUid,
          }
        : null;

    const threads = myThreads
      .slice()
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
      .map((t) => {
        const otherUid = t.participants.find((p) => p !== myUid) ?? t.participants[0];
        const r = otherReaders.find((x) => x.id === otherUid);
        const st = t.closed ? "Canje cerrado · calificado" : "Esperando confirmación";
        return {
          id: t.id,
          name: r?.name ?? "Lector",
          time: formatTime(t.lastMessageAt),
          last: t.lastMessage || t.dealText,
          state: st,
          closed: t.closed,
          active: t.id === activeThreadId,
          open: () => setThreadId(t.id),
        };
      });

    const messages = threadMessages.map((m) => ({
      text: m.text,
      time: formatTime(m.createdAt),
      side: m.senderId === myUid ? ("end" as const) : ("start" as const),
      mine: m.senderId === myUid,
    }));

    return {
      totalSlots,
      used,
      navColor,
      navLine,
      selUser,
      thread,
      mappedUsers,
      selBooks,
      catalog,
      catalogEmpty: catalog.length === 0,
      catCount: `${catalog.length} de ${totalBooks}`,
      counts,
      totalBooks,
      recommended,
      offerUser,
      offerBook,
      pendingBook,
      pendingUser,
      mappedMyBooks,
      slotNote,
      threads,
      messages,
    };
  }, [
    route,
    sel,
    cat,
    cond,
    maxDist,
    sort,
    offer,
    openOffer,
    editBook,
    deleteBook,
    otherReaders,
    books,
    myBooks,
    myReader,
    readers,
    myThreads,
    myUid,
    activeThreadId,
    threadMessages,
    avgRatingFor,
    setSel,
    now,
  ]);

  const moderationItems = useMemo(() => {
    const q = modQuery.trim().toLowerCase();
    const nameOf = (id: string) => readers.find((r) => r.id === id)?.name ?? "Lector sin perfil";
    return books
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((b) => {
        if (!q) return true;
        return [b.t, b.a, b.desc, b.cat, nameOf(b.ownerId)].some((field) => field.toLowerCase().includes(q));
      })
      .map((b, i) => ({
        id: b.id,
        t: b.t,
        a: b.a,
        cat: b.cat,
        cond: b.cond,
        desc: b.desc,
        cover: b.cover,
        ownerName: nameOf(b.ownerId),
        ownerId: b.ownerId,
        isMine: b.ownerId === myUid,
        reserved: !!b.resUid,
        reservedWith: b.resUid ? nameOf(b.resUid) : "",
        plate: plateFor(i),
        editing: modEditingId === b.id,
        edit: () => modStartEdit(b.id),
        remove: () => modDelete(b.id),
      }));
  }, [books, readers, modQuery, modEditingId, myUid, modStartEdit, modDelete]);

  const submitBook = useCallback(async () => {
    if (!user) {
      promptAuth("Inicia sesión para publicar un libro.");
      return;
    }
    if (!form.t) {
      showToast("Falta el título del libro.");
      return;
    }
    try {
      if (editingBookId) {
        await updateBook(editingBookId, {
          t: form.t,
          a: form.a || "Autor sin datos",
          cat: form.cat,
          cond: form.cond,
          desc: form.desc,
          cover: form.cover,
        });
        setEditingBookId(null);
        setForm(EMPTY_FORM);
        go("shelf");
        showToast("Cambios guardados.");
        return;
      }
      if (vals.used >= vals.totalSlots) {
        showToast("Sin cupos: cierra un intercambio primero.");
        return;
      }
      await createBook(user.uid, {
        t: form.t,
        a: form.a || "Autor sin datos",
        cat: form.cat,
        cond: form.cond,
        desc: form.desc,
        cover: form.cover,
      });
      setForm(EMPTY_FORM);
      go("shelf");
      showToast("Publicado. Ya aparece en el mapa y en el catálogo.");
    } catch {
      showToast("No se pudo guardar. Intenta de nuevo.");
    }
  }, [user, promptAuth, form, editingBookId, vals.used, vals.totalSlots, showToast, go]);

  const sendOffer = useCallback(async () => {
    if (!user) {
      promptAuth("Inicia sesión para proponer un intercambio.");
      return;
    }
    if (!offerMineId) {
      showToast("Elige uno de tus libros para ofrecer.");
      return;
    }
    if (!offer || !vals.offerUser || !vals.offerBook) return;
    const mineBook = myBooks.find((b) => b.id === offerMineId);
    if (!mineBook) return;
    const uid = offer.uid;
    try {
      await reserveBook(mineBook.id, uid);
      const tId = await openThread(
        user.uid,
        uid,
        mineBook.id,
        vals.offerBook!.id,
        `${vals.offerBook!.t} ⇄ ${mineBook.t}`
      );
      await sendThreadMessage(
        tId,
        user.uid,
        `Te propongo un canje: tu «${vals.offerBook!.t}» por mi «${mineBook.t}» (${mineBook.cond.toLowerCase()}). ¿Te sirve?`
      );
      setOffer(null);
      setOfferMineId(null);
      setThreadId(tId);
      go("chat");
      showToast(`Propuesta enviada a ${vals.offerUser!.name}.`);
    } catch {
      showToast("No se pudo enviar la propuesta. Intenta de nuevo.");
    }
  }, [user, promptAuth, offerMineId, offer, vals.offerUser, vals.offerBook, myBooks, showToast, go]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!user || !activeThreadId) return;
      try {
        await sendThreadMessage(activeThreadId, user.uid, text);
      } catch {
        showToast("No se pudo enviar el mensaje. Intenta de nuevo.");
      }
    },
    [user, activeThreadId, showToast]
  );

  const submitRating = useCallback(async () => {
    if (!starsPicked) {
      showToast("Elige cuántas estrellas.");
      return;
    }
    if (!vals.thread || !user || !activeThreadId) return;
    const activeThreadDoc = myThreads.find((t) => t.id === activeThreadId);
    if (!activeThreadDoc) return;
    // Only the recipient of the proposal can complete it: Firestore only lets each side
    // transfer a book they currently own, or claim one that's reserved for them — the
    // recipient is the only party who satisfies both conditions for both books at once.
    if (user.uid !== activeThreadDoc.toUid) {
      showToast("Solo quien recibe la propuesta puede confirmarla.");
      return;
    }
    const { fromUid, toUid, fromBookId, toBookId } = activeThreadDoc;
    try {
      await transferBook(fromBookId, toUid);
      await transferBook(toBookId, fromUid);
      await addRating(user.uid, fromUid, starsPicked, tags);
      await bumpReaderTrades(user.uid);
      await closeThread(activeThreadId);
    } catch {
      showToast("No se pudo cerrar el intercambio. Intenta de nuevo.");
      return;
    }
    setRating(null);
    go("shelf");
    showToast("Intercambio completado. Los libros ya cambiaron de estante.");
  }, [starsPicked, tags, vals.thread, user, myThreads, activeThreadId, showToast, go]);

  return {
    route,
    user,
    isModerator,
    goPolicies: () => go("policies"),

    header: {
      unread: myThreads.filter((t) => !t.closed).length,
      isMap: route === "map",
      isCatalog: route === "catalog",
      isChat: route === "chat",
      isShelf: route === "shelf",
      isModerator,
      isModeration: route === "moderation",
      goModeration: () => go("moderation"),
      goMap: () => go("map"),
      goCatalog: () => go("catalog"),
      goChat: () => go("chat"),
      goShelf: () => go("shelf"),
      goPublish,
    },

    moderationView: {
      isModeration: route === "moderation",
      allowed: isModerator,
      signedIn: !!user,
      items: moderationItems,
      count: moderationItems.length,
      query: modQuery,
      setQuery: (v: string) => setModQuery(v),
      form: modForm,
      setTitle: (v: string) => setModForm((f) => ({ ...f, t: v })),
      setAuthor: (v: string) => setModForm((f) => ({ ...f, a: v })),
      setDesc: (v: string) => setModForm((f) => ({ ...f, desc: v })),
      condChips: formConds.map((c) => ({ label: c, active: modForm.cond === c, pick: () => setModForm((f) => ({ ...f, cond: c })) })),
      catChips: formCats.map((c) => ({ label: c, active: modForm.cat === c, pick: () => setModForm((f) => ({ ...f, cat: c })) })),
      cover: modForm.cover,
      removeCover: modRemoveCover,
      reason: modReason,
      setReason: (v: string) => setModReason(v),
      log: moderationLog.map((e) => ({
        id: e.id,
        when: formatDateTime(e.createdAt),
        action: e.action === "delete" ? "Eliminó" : "Editó",
        isDelete: e.action === "delete",
        bookTitle: e.bookTitle,
        ownerName: e.ownerName,
        moderatorName: e.moderatorName,
        reason: e.reason,
        changes: e.changes,
      })),
      logEmpty: moderationLog.length === 0,
      save: modSaveEdit,
      cancelEdit: modCancelEdit,
      goPolicies: () => go("policies"),
    },

    policiesView: {
      isPolicies: route === "policies",
      goHome: () => go("catalog"),
    },

    mapView: {
      isMap: route === "map",
      loading: dataLoading,
      error: dataError,
      users: vals.mappedUsers,
      noSelection: !vals.selUser,
      hasSelection: !!vals.selUser,
      sel: vals.selUser
        ? {
            ...vals.mappedUsers.find((u) => u.id === vals.selUser!.id)!,
            count: vals.selBooks.length,
            tags: tagsFor(vals.selUser.id),
          }
        : null,
      selBooks: vals.selBooks,
      clearSelection: () => setSel(null),
      nearCount: otherReaders.length,
      // Textos derivados del estado real: el barrio salía escrito a mano
      // («Chapinero Alto») y el encabezado prometía un radio que no se medía.
      nearHeading: myReader
        ? `${otherReaders.length} lectores cerca`
        : `${otherReaders.length} lectores en Bogotá`,
      zoneNote: myReader
        ? `${myReader.barrio} · nadie ve tu dirección exacta.`
        : "Inicia sesión para ver a qué distancia queda cada lector.",
    },

    catalogView: {
      isCatalog: route === "catalog",
      loading: dataLoading,
      error: dataError,
      items: vals.catalog,
      empty: vals.catalogEmpty,
      count: vals.catCount,
      recommended: vals.recommended,
      // Sin ubicación no se ordena por distancia (ver readerDist): el rótulo
      // dice lo que de verdad está pasando.
      sortLabel: sort === "distancia" && !myReader ? "lo más reciente" : sort,
      hasLocation: !!myReader,
      catOptions: categories.map((c) => ({
        label: c,
        n: c === "Todas" ? vals.totalBooks : vals.counts[c] || 0,
        active: cat === c,
        pick: () => setCat(c),
      })),
      condOptions: conds.map((c) => ({ label: c, active: cond === c, pick: () => setCond(c) })),
      sortOptions: (["distancia", "estado", "título"] as SortOption[]).map((o) => ({
        label: o === "distancia" ? "Más cerca primero" : o === "estado" ? "Mejor estado primero" : "Título A–Z",
        active: sort === o,
        pick: () => setSort(o),
      })),
      maxDist,
      maxDistLabel: `${maxDist} km a la redonda`,
      setDist: (v: number) => setMaxDist(v),
    },

    shelfView: {
      signedIn: !!user,
      readerName: myReader?.name ?? user?.displayName ?? user?.email ?? "",
      readerBarrio: myReader?.barrio ?? "",
      isShelf: route === "shelf",
      myBooks: vals.mappedMyBooks,
      myStars: stars(avgRatingFor(myUid ?? "")),
      myRating: avgRatingFor(myUid ?? ""),
      myTrades: myReader?.trades ?? 0,
      usedSlots: vals.used,
      totalSlots: vals.totalSlots,
      slotPips: Array.from({ length: vals.totalSlots }, (_, i) => ({ filled: i < vals.used })),
      slotNote: vals.slotNote,
      addSlotLabel: vals.used < vals.totalSlots ? `Publicar libro · cupo ${vals.used + 1}` : "Sin cupos · cierra un canje",
      hasPending: !!vals.pendingUser,
      nextCupoNote: vals.pendingUser
        ? `Se abre al confirmar el canje con ${vals.pendingUser.name}.`
        : "Sin canjes pendientes. Proponle uno a alguien del mapa.",
      interestOptions: formCats.map((c) => ({
        label: c,
        active: (myReader?.interests ?? []).includes(c),
        toggle: () => toggleInterest(c),
      })),
      goPublish,
      goChat: () => go("chat"),
    },

    publishView: {
      isPublish: route === "publish",
      isEditing: editingBookId !== null,
      nextSlot: Math.min(vals.used + 1, vals.totalSlots),
      totalSlots: vals.totalSlots,
      form,
      setTitle: (v: string) => setForm((f) => ({ ...f, t: v })),
      setAuthor: (v: string) => setForm((f) => ({ ...f, a: v })),
      setDesc: (v: string) => setForm((f) => ({ ...f, desc: v })),
      condChips: formConds.map((c) => ({ label: c, active: form.cond === c, pick: () => setForm((f) => ({ ...f, cond: c })) })),
      catChips: formCats.map((c) => ({ label: c, active: form.cat === c, pick: () => setForm((f) => ({ ...f, cat: c })) })),
      pickCover,
      clearCover,
      coverBusy,
      previewCover: form.cover,
      previewPlate: plateFor(editingBookId ? Math.max(0, myBooks.findIndex((b) => b.id === editingBookId)) : vals.used + 2),
      previewShort: form.t || "Portada tipográfica",
      previewTitle: form.t || "Título del libro",
      previewAuthor: form.a || "Autor",
      slotNote: vals.slotNote,
      submitBook,
      cancel: () => {
        setEditingBookId(null);
        setForm(EMPTY_FORM);
        go("shelf");
      },
    },

    chatView: {
      isChat: route === "chat",
      hasThreads: myThreads.length > 0,
      threads: vals.threads,
      thread: vals.thread
        ? {
            id: vals.thread.id,
            name: vals.thread.name,
            barrio: vals.thread.barrio,
            dist: vals.thread.dist,
            deal: vals.thread.dealText,
            statusLine: vals.thread.statusLine,
          }
        : { id: "", name: "", barrio: "", dist: null, deal: "", statusLine: "" },
      messages: vals.messages,
      canConfirm: vals.thread ? !vals.thread.closed && vals.thread.toUid === myUid : false,
      threadClosed: vals.thread ? vals.thread.closed : false,
      confirmNote: "Al confirmarlo, tu libro y el suyo cambian de estante y podrás calificarlo.",
      sendMessage,
      openRating: () => {
        if (!vals.thread) return;
        setRating(vals.thread.id);
        setStarsPicked(0);
        setTags([]);
      },
    },

    offerModal: {
      open: !!offer,
      owner: vals.offerUser?.name || "",
      bookTitle: vals.offerBook?.t || "",
      bookAuthor: vals.offerBook?.a || "",
      bookCond: vals.offerBook?.cond || "",
      bookCat: vals.offerBook?.cat || "",
      bookCover: vals.offerBook?.cover ?? null,
      bookPlate: plateFor(1),
      myOfferables: myBooks.map((b) => ({ ...b, active: offerMineId === b.id, choose: () => setOfferMineId(b.id) })),
      hint: offerMineId === null ? "Elige qué libro tuyo ofreces." : "Si acepta, ambos libros quedan reservados hasta el encuentro.",
      close: () => {
        setOffer(null);
        setOfferMineId(null);
      },
      send: sendOffer,
    },

    deleteDialog: {
      open: !!pendingDelete,
      isModeration: pendingDelete?.scope === "moderation",
      title: pendingDelete?.scope === "moderation" ? "Eliminar por incumplir las políticas" : "Eliminar de tu estante",
      bookTitle: pendingDelete?.title ?? "",
      warning: pendingDelete?.reserved
        ? "Está reservado en un intercambio: eliminarlo impedirá cerrar ese canje."
        : null,
      reason: deleteReason,
      setReason: (v: string) => setDeleteReason(v),
      confirm: confirmDelete,
      cancel: cancelDelete,
    },

    ratingModal: {
      open: !!rating,
      name: vals.thread?.name ?? "",
      starPicks: [1, 2, 3, 4, 5].map((n) => ({ filled: n <= starsPicked, pick: () => setStarsPicked(n) })),
      ratingTags: tagList.map((t) => ({
        label: t,
        active: tags.includes(t),
        toggle: () => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : prev.concat([t]))),
      })),
      submit: submitRating,
      close: () => setRating(null),
    },

    authModal: { open: authOpen, reason: authReason, close: closeAuth, onSuccess: onAuthSuccess },
  };
}

export type AppState = ReturnType<typeof useAppState>;
