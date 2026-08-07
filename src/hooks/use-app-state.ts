"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { plateFor, stars } from "@/lib/design-utils";
import {
  categories,
  conds,
  formCats,
  formConds,
  initialMyBooks,
  myRatingSeed,
  tagList,
  threadData,
  users,
} from "@/lib/mock-data";
import type { MyBook, Route, SortOption, ThreadMessage } from "@/lib/types";

const BASE_SLOTS = 5;
const TRADES_PER_SLOT = 3;
const ANIMATE_PINS = true;
const THREAD_IDS = ["ana", "dani", "samir"];

interface FormState {
  t: string;
  a: string;
  desc: string;
  cond: string;
  cat: string;
}

const EMPTY_FORM: FormState = { t: "", a: "", desc: "", cond: "Bueno", cat: "Novela" };

type PendingAction = { kind: "goPublish" } | { kind: "openOffer"; uid: string; bi: number };

function nameOf(id: string): string {
  return users.find((u) => u.id === id)?.name.split(" ")[0] ?? "";
}

export function useAppState() {
  const { user } = useAuth();

  const [route, setRoute] = useState<Route>("onboarding");
  const [sel, setSel] = useState<string | null>(null);
  const [offer, setOffer] = useState<{ uid: string; bi: number } | null>(null);
  const [offerMine, setOfferMine] = useState<number | null>(null);
  const [cat, setCat] = useState("Todas");
  const [cond, setCond] = useState("Todos");
  const [maxDist, setMaxDist] = useState(5);
  const [sort, setSort] = useState<SortOption>("distancia");
  const [threadId, setThreadId] = useState("ana");
  const [rating, setRating] = useState<string | null>(null);
  const [starsPicked, setStarsPicked] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [deals, setDeals] = useState<Record<string, string>>({});
  const [extraMsgs, setExtraMsgs] = useState<Record<string, ThreadMessage[]>>({});
  const [closed, setClosed] = useState<Record<string, boolean>>({ samir: true });
  const [trades, setTrades] = useState(6);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [myBooks, setMyBooks] = useState<MyBook[]>(initialMyBooks);

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
        go("publish");
      } else {
        setOffer({ uid: action.uid, bi: action.bi });
        setOfferMine(null);
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
    (uid: string, bi: number) =>
      requireAuth("Inicia sesión para proponer un intercambio.", { kind: "openOffer", uid, bi }),
    [requireAuth]
  );

  const vals = useMemo(() => {
    const totalSlots = BASE_SLOTS + Math.floor(trades / TRADES_PER_SLOT);
    const used = myBooks.length;
    const navColor = (r: Route) => (route === r ? "#201e1d" : "#605d5d");
    const navLine = (r: Route) => (route === r ? "#0088b0" : "transparent");
    const selUser = users.find((u) => u.id === sel) || null;
    const thread = users.find((u) => u.id === threadId) || users[0];
    const td = threadData[thread.id] || threadData.ana;

    const mappedUsers = users.map((u, i) => ({
      ...u,
      count: u.books.length,
      starsLabel: stars(u.rating),
      ink: u.online ? "#0088b0" : "#7d7979",
      haloInk: u.online ? "rgba(0,136,176,.30)" : "rgba(32,30,29,.16)",
      pulse: u.online && ANIMATE_PINS ? 3.4 + i * 0.6 : 0,
      statusLine: u.online ? "en línea ahora" : "visto hace 2 h",
      teaser: u.books.slice(0, 2).map((b) => b.t).join(" · "),
      select: () => {
        setSel(u.id);
        setRoute("map");
      },
    }));

    const selBooks = selUser
      ? selUser.books.map((b, i) => ({
          ...b,
          plate: plateFor(i + 1),
          short: b.t,
          propose: () => openOffer(selUser.id, i),
        }))
      : [];

    let catalog: Array<{
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
    users.forEach((u) => {
      u.books.forEach((b, i) => {
        catalog.push({
          ...b,
          owner: u.name,
          barrio: u.barrio,
          dist: u.dist,
          starsLabel: stars(u.rating),
          plate: plateFor(catalog.length),
          short: b.t,
          selectOwner: () => {
            setRoute("map");
            setSel(u.id);
          },
          propose: () => openOffer(u.id, i),
        });
      });
    });
    catalog = catalog.filter(
      (b) => (cat === "Todas" || b.cat === cat) && (cond === "Todos" || b.cond === cond) && b.dist <= maxDist
    );
    if (sort === "distancia") catalog.sort((a, b) => a.dist - b.dist);
    if (sort === "estado") catalog.sort((a, b) => formConds.indexOf(a.cond) - formConds.indexOf(b.cond));
    if (sort === "título") catalog.sort((a, b) => a.t.localeCompare(b.t));

    const counts: Record<string, number> = {};
    users.forEach((u) => u.books.forEach((b) => { counts[b.cat] = (counts[b.cat] || 0) + 1; }));
    const totalBooks = users.reduce((n, u) => n + u.books.length, 0);

    const offerUser = offer ? users.find((u) => u.id === offer.uid) || null : null;
    const offerBook = offerUser && offer ? offerUser.books[offer.bi] : null;

    const pendingBook = myBooks.find((b) => b.resUid && !closed[b.resUid]) || null;
    const pendingUser = pendingBook ? users.find((u) => u.id === pendingBook.resUid) || null : null;

    const mappedMyBooks = myBooks.map((b, i) => ({
      ...b,
      plate: plateFor(i),
      short: b.t,
      state: b.resUid && !closed[b.resUid] ? `Reservado con ${nameOf(b.resUid)}` : "Disponible",
      stateColor: b.resUid && !closed[b.resUid] ? "#aa0b56" : "#605d5d",
    }));

    const slotsLeft = totalSlots - used;
    const slotNote =
      used < totalSlots
        ? `${slotsLeft === 1 ? "Te queda 1 cupo libre." : `Te quedan ${slotsLeft} cupos libres.`} Al cerrar ${
            TRADES_PER_SLOT - (trades % TRADES_PER_SLOT)
          } canjes más se abre otro.`
        : `Estante lleno. Cierra un intercambio para abrir el cupo ${totalSlots + 1}.`;

    const threads = THREAD_IDS.map((id) => {
      const u = users.find((x) => x.id === id)!;
      const d = threadData[id];
      const all = d.msgs.concat(extraMsgs[id] || []);
      const st = closed[id] ? "Canje cerrado · calificado" : d.state;
      return {
        id,
        name: u.name,
        time: (extraMsgs[id] || []).length ? "ahora" : d.time,
        last: all[all.length - 1].text,
        state: st,
        stateColor: st.indexOf("cerrado") >= 0 ? "#605d5d" : "#aa0b56",
        active: threadId === id,
        open: () => setThreadId(id),
      };
    });

    const messages = td.msgs.concat(extraMsgs[thread.id] || []).map((m) => ({
      text: m.text,
      time: m.time,
      side: m.me ? ("end" as const) : ("start" as const),
      bg: m.me ? "#201e1d" : "#eae7e7",
      fg: m.me ? "#f8f4f4" : "#201e1d",
      metaColor: m.me ? "#bab6b6" : "#605d5d",
    }));

    return {
      totalSlots,
      used,
      navColor,
      navLine,
      selUser,
      thread,
      td,
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
  }, [route, sel, threadId, cat, cond, maxDist, sort, trades, myBooks, closed, extraMsgs, offer, openOffer]);

  const submitBook = useCallback(() => {
    if (!user) {
      promptAuth("Inicia sesión para publicar un libro.");
      return;
    }
    if (!form.t) {
      showToast("Falta el título del libro.");
      return;
    }
    if (vals.used >= vals.totalSlots) {
      showToast("Sin cupos: cierra un intercambio primero.");
      return;
    }
    setMyBooks((prev) => prev.concat([{ t: form.t, a: form.a || "Autor sin datos", cat: form.cat, cond: form.cond }]));
    setForm(EMPTY_FORM);
    setRoute("shelf");
    showToast("Publicado. Ya aparece en el mapa y en el catálogo.");
  }, [user, promptAuth, form, vals.used, vals.totalSlots, showToast]);

  const sendOffer = useCallback(() => {
    if (!user) {
      promptAuth("Inicia sesión para proponer un intercambio.");
      return;
    }
    if (offerMine === null) {
      showToast("Elige uno de tus libros para ofrecer.");
      return;
    }
    if (!offer || !vals.offerUser || !vals.offerBook) return;
    const mineBook = myBooks[offerMine];
    const uid = offer.uid;
    setMyBooks((prev) =>
      prev.map((b, i) => (i === offerMine ? { ...b, resUid: uid } : b.resUid === uid ? { ...b, resUid: null } : b))
    );
    setDeals((prev) => ({ ...prev, [uid]: `${vals.offerBook!.t} ⇄ ${mineBook.t}` }));
    setExtraMsgs((prev) => ({
      ...prev,
      [uid]: (prev[uid] || []).concat([
        {
          me: true,
          text: `Te propongo un canje: tu «${vals.offerBook!.t}» por mi «${mineBook.t}» (${mineBook.cond.toLowerCase()}). ¿Te sirve?`,
          time: "ahora",
        },
      ]),
    }));
    setOffer(null);
    setOfferMine(null);
    setThreadId(uid);
    setRoute("chat");
    showToast(`Propuesta enviada a ${vals.offerUser!.name}.`);
  }, [user, promptAuth, offerMine, offer, vals.offerUser, vals.offerBook, myBooks, showToast]);

  const submitRating = useCallback(() => {
    if (!starsPicked) {
      showToast("Elige cuántas estrellas.");
      return;
    }
    const uid = vals.thread.id;
    const nextTrades = trades + 1;
    const newTotal = BASE_SLOTS + Math.floor(nextTrades / TRADES_PER_SLOT);
    const goneBook = myBooks.find((b) => b.resUid === uid);
    const gone = goneBook ? goneBook.t : null;
    setClosed((prev) => ({ ...prev, [uid]: true }));
    setTrades(nextTrades);
    setMyBooks((prev) => prev.filter((b) => b.resUid !== uid));
    setRating(null);
    setRoute("shelf");
    showToast(
      gone
        ? `«${gone}» salió a circular. ${
            newTotal > vals.totalSlots ? `Se abrió tu cupo ${newTotal}.` : `Cupo liberado: ${vals.used - 1}/${vals.totalSlots}.`
          }`
        : "Canje registrado."
    );
  }, [starsPicked, vals.thread, vals.totalSlots, vals.used, trades, myBooks, showToast]);

  return {
    route,
    isOnboarding: route === "onboarding",
    isApp: route !== "onboarding",
    user,

    onboarding: {
      allowLocation: () => go("map"),
    },

    header: {
      today: "5 de agosto de 2026",
      unread: THREAD_IDS.filter((id) => !closed[id]).length,
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
            ...vals.selUser,
            count: vals.selUser.books.length,
            starsLabel: stars(vals.selUser.rating),
            statusLine: vals.selUser.online ? "en línea ahora" : "visto hace 2 h",
          }
        : null,
      selBooks: vals.selBooks,
      clearSelection: () => setSel(null),
      nearCount: users.length,
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
      isShelf: route === "shelf",
      myBooks: vals.mappedMyBooks,
      myStars: stars(myRatingSeed),
      myRating: myRatingSeed,
      myTrades: trades,
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
      nextSlot: Math.min(vals.used + 1, vals.totalSlots),
      totalSlots: vals.totalSlots,
      form,
      setTitle: (v: string) => setForm((f) => ({ ...f, t: v })),
      setAuthor: (v: string) => setForm((f) => ({ ...f, a: v })),
      setDesc: (v: string) => setForm((f) => ({ ...f, desc: v })),
      condChips: formConds.map((c) => ({ label: c, active: form.cond === c, pick: () => setForm((f) => ({ ...f, cond: c })) })),
      catChips: formCats.map((c) => ({ label: c, active: form.cat === c, pick: () => setForm((f) => ({ ...f, cat: c })) })),
      previewPlate: plateFor(vals.used + 2),
      previewShort: form.t || "Portada tipográfica",
      previewTitle: form.t || "Título del libro",
      previewAuthor: form.a || "Autor",
      slotNote: vals.slotNote,
      submitBook,
      cancel: () => go("shelf"),
    },

    chatView: {
      isChat: route === "chat",
      threads: vals.threads,
      thread: {
        name: vals.thread.name,
        barrio: vals.thread.barrio,
        dist: vals.thread.dist,
        deal: deals[vals.thread.id] || vals.td.deal,
        statusLine: vals.thread.online ? "en línea ahora" : "visto hace 2 h",
        id: vals.thread.id,
      },
      messages: vals.messages,
      canConfirm: !closed[vals.thread.id],
      threadClosed: !!closed[vals.thread.id],
      confirmNote:
        BASE_SLOTS + Math.floor((trades + 1) / TRADES_PER_SLOT) > vals.totalSlots
          ? `Al confirmarlo se abre tu cupo ${vals.totalSlots + 1} y podrán calificarse.`
          : `Al confirmarlo liberas el libro reservado, podrán calificarse y te faltarán ${
              TRADES_PER_SLOT - ((trades + 1) % TRADES_PER_SLOT)
            } canjes para el cupo ${vals.totalSlots + 1}.`,
      openRating: () => {
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
      bookPlate: plateFor(offer ? offer.bi + 1 : 0),
      myOfferables: myBooks.map((b, i) => ({ ...b, active: offerMine === i, choose: () => setOfferMine(i) })),
      hint: offerMine === null ? "Elige qué libro tuyo ofreces." : "Si acepta, ambos libros quedan reservados hasta el encuentro.",
      close: () => {
        setOffer(null);
        setOfferMine(null);
      },
      send: sendOffer,
    },

    ratingModal: {
      open: !!rating,
      name: vals.thread.name,
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
