"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { plateFor, stars } from "@/lib/design-utils";
import { distanceKm } from "@/lib/geo";
import {
  addRating,
  bumpReaderTrades,
  closeThread,
  createBook,
  deleteBook as deleteBookDoc,
  openThread,
  reserveBook,
  sendThreadMessage,
  transferBook,
  updateBook,
} from "@/lib/firestore-data";
import { categories, conds, formCats, formConds, tagList } from "@/lib/mock-data";
import { useBooks, useMyThreads, useRatings, useReaderProfileSync, useReaders, useThreadMessages } from "./use-firestore-data";
import type { Route, SortOption } from "@/lib/types";

const BASE_SLOTS = 5;
const TRADES_PER_SLOT = 3;
const ANIMATE_PINS = true;

interface FormState {
  t: string;
  a: string;
  desc: string;
  cond: string;
  cat: string;
}

const EMPTY_FORM: FormState = { t: "", a: "", desc: "", cond: "Bueno", cat: "Novela" };

type PendingAction = { kind: "goPublish" } | { kind: "openOffer"; uid: string; bookId: string };

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function formatTime(ms: number): string {
  if (!ms) return "";
  return new Date(ms).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export function useAppState() {
  const { user } = useAuth();
  useReaderProfileSync(user);
  const { readers } = useReaders();
  const { books } = useBooks();

  const myUid = user?.uid ?? null;
  const myReader = readers.find((r) => r.id === myUid) ?? null;
  const myBooks = books.filter((b) => b.ownerId === myUid);
  const otherReaders = readers.filter((r) => r.id !== myUid);
  const { threads: myThreads } = useMyThreads(myUid);

  // Rating average per reader, computed client-side from the `ratings` collection rather
  // than stored on the reader doc: Firestore only lets a user write their own reader doc,
  // so the person being rated can't have their rater update it for them.
  const ratings = useRatings();
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

  const [route, setRoute] = useState<Route>("map");
  const [sel, setSel] = useState<string | null>(null);
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
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

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
    setSel(null);
    setThreadId(null);
    setRating(null);
    setStarsPicked(0);
    setTags([]);
  }

  const [authOpen, setAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((t: string) => {
    setToastMsg(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3800);
  }, []);

  const go = useCallback((r: Route) => {
    setRoute(r);
    setToastMsg(null);
  }, []);

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
      setForm({ t: b.t, a: b.a, desc: b.desc, cond: b.cond, cat: b.cat });
      setEditingBookId(bookId);
      go("publish");
    },
    [user, promptAuth, myBooks, go]
  );

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
      if (!window.confirm(`¿Eliminar "${b.t}" de tu estante?`)) return;
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
    },
    [user, promptAuth, myBooks, myThreads, showToast, editingBookId]
  );

  const vals = useMemo(() => {
    const totalSlots = BASE_SLOTS + Math.floor((myReader?.trades ?? 0) / TRADES_PER_SLOT);
    const used = myBooks.length;
    const navColor = (r: Route) => (route === r ? "#201e1d" : "#605d5d");
    const navLine = (r: Route) => (route === r ? "#0088b0" : "transparent");
    const nameOf = (id: string) => readers.find((r) => r.id === id)?.name.split(" ")[0] ?? "";
    const readerDist = (r: { lat: number; lng: number }) =>
      myReader ? round1(distanceKm(myReader.lat, myReader.lng, r.lat, r.lng)) : 0;
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
        ink: r.online ? "#0088b0" : "#7d7979",
        haloInk: r.online ? "rgba(0,136,176,.30)" : "rgba(32,30,29,.16)",
        pulse: r.online && ANIMATE_PINS ? 3.4 + i * 0.6 : 0,
        statusLine: r.online ? "en línea ahora" : "visto hace 2 h",
        teaser: readerBooks.slice(0, 2).map((b) => b.t).join(" · "),
        select: () => {
          setSel(r.id);
          setRoute("map");
        },
      };
    });

    const selBooks = selUser
      ? books
          .filter((b) => b.ownerId === selUser.id)
          .map((b, i) => ({
            ...b,
            plate: plateFor(i + 1),
            short: b.t,
            propose: () => openOffer(selUser.id, b.id),
          }))
      : [];

    let catalog: Array<{
      id: string;
      t: string;
      a: string;
      cat: string;
      cond: string;
      desc: string;
      owner: string;
      barrio: string;
      dist: number;
      starsLabel: string;
      plate: string;
      short: string;
      selectOwner: () => void;
      propose: () => void;
    }> = [];
    otherReaders.forEach((r) => {
      books
        .filter((b) => b.ownerId === r.id)
        .forEach((b) => {
          catalog.push({
            id: b.id,
            t: b.t,
            a: b.a,
            cat: b.cat,
            cond: b.cond,
            desc: b.desc,
            owner: r.name,
            barrio: r.barrio,
            dist: readerDist(r),
            starsLabel: stars(avgRatingFor(r.id)),
            plate: plateFor(catalog.length),
            short: b.t,
            selectOwner: () => {
              setRoute("map");
              setSel(r.id);
            },
            propose: () => openOffer(r.id, b.id),
          });
        });
    });
    catalog = catalog.filter(
      (b) => (cat === "Todas" || b.cat === cat) && (cond === "Todos" || b.cond === cond) && (!myReader || b.dist <= maxDist)
    );
    if (sort === "distancia") catalog.sort((a, b) => a.dist - b.dist);
    if (sort === "estado") catalog.sort((a, b) => formConds.indexOf(a.cond) - formConds.indexOf(b.cond));
    if (sort === "título") catalog.sort((a, b) => a.t.localeCompare(b.t));

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
        short: b.t,
        state: activelyReserved ? `Reservado con ${nameOf(b.resUid as string)}` : "Disponible",
        stateColor: activelyReserved ? "#aa0b56" : "#605d5d",
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
            online: threadReader.online,
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
          stateColor: st.indexOf("cerrado") >= 0 ? "#605d5d" : "#aa0b56",
          active: t.id === activeThreadId,
          open: () => setThreadId(t.id),
        };
      });

    const messages = threadMessages.map((m) => ({
      text: m.text,
      time: formatTime(m.createdAt),
      side: m.senderId === myUid ? ("end" as const) : ("start" as const),
      bg: m.senderId === myUid ? "#201e1d" : "#eae7e7",
      fg: m.senderId === myUid ? "#f8f4f4" : "#201e1d",
      metaColor: m.senderId === myUid ? "#bab6b6" : "#605d5d",
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
  ]);

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
        await updateBook(editingBookId, { t: form.t, a: form.a || "Autor sin datos", cat: form.cat, cond: form.cond, desc: form.desc });
        setEditingBookId(null);
        setForm(EMPTY_FORM);
        setRoute("shelf");
        showToast("Cambios guardados.");
        return;
      }
      if (vals.used >= vals.totalSlots) {
        showToast("Sin cupos: cierra un intercambio primero.");
        return;
      }
      await createBook(user.uid, { t: form.t, a: form.a || "Autor sin datos", cat: form.cat, cond: form.cond, desc: form.desc });
      setForm(EMPTY_FORM);
      setRoute("shelf");
      showToast("Publicado. Ya aparece en el mapa y en el catálogo.");
    } catch {
      showToast("No se pudo guardar. Intenta de nuevo.");
    }
  }, [user, promptAuth, form, editingBookId, vals.used, vals.totalSlots, showToast]);

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
      setRoute("chat");
      showToast(`Propuesta enviada a ${vals.offerUser!.name}.`);
    } catch {
      showToast("No se pudo enviar la propuesta. Intenta de nuevo.");
    }
  }, [user, promptAuth, offerMineId, offer, vals.offerUser, vals.offerBook, myBooks, showToast]);

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
      await addRating(user.uid, fromUid, starsPicked);
      await bumpReaderTrades(user.uid);
      await closeThread(activeThreadId);
    } catch {
      showToast("No se pudo cerrar el intercambio. Intenta de nuevo.");
      return;
    }
    setRating(null);
    setRoute("shelf");
    showToast("Intercambio completado. Los libros ya cambiaron de estante.");
  }, [starsPicked, vals.thread, user, myThreads, activeThreadId, showToast]);

  return {
    route,
    user,

    header: {
      today: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }),
      unread: myThreads.filter((t) => !t.closed).length,
      isMap: route === "map",
      isCatalog: route === "catalog",
      isChat: route === "chat",
      isShelf: route === "shelf",
      goMap: () => go("map"),
      goCatalog: () => go("catalog"),
      goChat: () => go("chat"),
      goShelf: () => go("shelf"),
      goPublish,
    },

    mapView: {
      isMap: route === "map",
      users: vals.mappedUsers,
      noSelection: !vals.selUser,
      hasSelection: !!vals.selUser,
      sel: vals.selUser
        ? {
            ...vals.mappedUsers.find((u) => u.id === vals.selUser!.id)!,
            count: vals.selBooks.length,
          }
        : null,
      selBooks: vals.selBooks,
      clearSelection: () => setSel(null),
      nearCount: otherReaders.length,
    },

    catalogView: {
      isCatalog: route === "catalog",
      items: vals.catalog,
      empty: vals.catalogEmpty,
      count: vals.catCount,
      sortLabel: sort,
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
            dist: 0,
            deal: vals.thread.dealText,
            statusLine: vals.thread.online ? "en línea ahora" : "visto hace 2 h",
          }
        : { id: "", name: "", barrio: "", dist: 0, deal: "", statusLine: "" },
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
      bookPlate: plateFor(1),
      myOfferables: myBooks.map((b) => ({ ...b, active: offerMineId === b.id, choose: () => setOfferMineId(b.id) })),
      hint: offerMineId === null ? "Elige qué libro tuyo ofreces." : "Si acepta, ambos libros quedan reservados hasta el encuentro.",
      close: () => {
        setOffer(null);
        setOfferMineId(null);
      },
      send: sendOffer,
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

    toast: { visible: !!toastMsg, message: toastMsg },

    authModal: { open: authOpen, reason: authReason, close: closeAuth, onSuccess: onAuthSuccess },
  };
}

export type AppState = ReturnType<typeof useAppState>;
