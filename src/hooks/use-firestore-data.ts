"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  ensureReaderProfile,
  fetchIsModerator,
  fetchOfficialName,
  touchPresence,
  subscribeBooks,
  subscribeCompletedTrades,
  subscribeModerationLog,
  subscribeMyThreads,
  subscribeOfficials,
  subscribeRatings,
  subscribeReaders,
  subscribeReports,
  subscribeThreadMessages,
} from "@/lib/firestore-data";
import type {
  Book,
  ChatMessage,
  ChatThread,
  CompletedTrade,
  ModerationLogEntry,
  OfficialPoint,
  Rating,
  Reader,
  Report,
} from "@/lib/types";

function getCurrentPosition(): Promise<{ lat: number; lng: number } | undefined> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(undefined);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(undefined),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

export function useReaderProfileSync(user: User | null) {
  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;
    let cancelled = false;
    getCurrentPosition().then((coords) => {
      if (!cancelled) ensureReaderProfile(user, coords).catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [user]);
}

// Stores *which* uid was confirmed as a moderator rather than a bare boolean, so the flag
// can be masked on sign-out or an account switch without clearing state from the effect body.
const HEARTBEAT_MS = 120_000;

// Marca presencia al entrar, cada dos minutos con la pestaña a la vista, y al
// volver a ella. Sin esto `lastSeenAt` solo tendría la fecha de registro.
export function usePresenceHeartbeat(user: User | null) {
  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;
    const beat = () => {
      if (document.visibilityState === "visible") touchPresence(user.uid).catch(() => {});
    };
    beat();
    const timer = setInterval(beat, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", beat);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [user]);
}

export function useIsModerator(uid: string | null): boolean {
  const [moderatorUid, setModeratorUid] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured) return;
    let cancelled = false;
    fetchIsModerator(uid)
      .then((ok) => {
        if (!cancelled && ok) setModeratorUid(uid);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return !!uid && moderatorUid === uid;
}

// La ficha de un libro no carga la lista de lectores, así que pregunta solo por
// la cuenta con la que se entró. Guarda de quién es el nombre, como `useIsModerator`.
export function useOfficialName(uid: string | null): string | null {
  const [found, setFound] = useState<{ uid: string; name: string } | null>(null);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured) return;
    let cancelled = false;
    fetchOfficialName(uid)
      .then((name) => {
        if (!cancelled && name) setFound({ uid, name });
      })
      .catch((err) => console.error("no se pudo leer officials", err));
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return found && found.uid === uid ? found.name : null;
}

// Only moderators may read the log, so the subscription is opened only for them —
// otherwise every visitor would trigger a permission-denied listener on page load.
export function useModerationLog(enabled: boolean): ModerationLogEntry[] {
  const [entries, setEntries] = useState<ModerationLogEntry[]>([]);

  useEffect(() => {
    if (!enabled || !isFirebaseConfigured) return;
    const unsub = subscribeModerationLog(setEntries);
    return unsub;
  }, [enabled]);

  return enabled ? entries : [];
}

// Los lectores llegan ya mezclados con `officials/{uid}`: el nombre, el barrio,
// las coordenadas y el punto de encuentro de un Punto Librocambio mandan sobre
// los de su perfil, y `official` sale en true. Así mapa, catálogo y chat no
// tienen que saber que existen los puntos.
export function useReaders(): { readers: Reader[]; loading: boolean; error: boolean } {
  const [rawReaders, setReaders] = useState<Reader[]>([]);
  const [officials, setOfficials] = useState<OfficialPoint[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeOfficials(setOfficials);
  }, []);

  const readers = useMemo(
    () =>
      rawReaders.map((r) => {
        const o = officials.find((x) => x.id === r.id);
        if (!o) return r;
        return {
          ...r,
          name: o.name || r.name,
          barrio: o.barrio || r.barrio,
          lat: o.lat ?? r.lat,
          lng: o.lng ?? r.lng,
          spot: o.spot || r.spot,
          bio: o.bio || r.bio,
          official: true,
        };
      }),
    [rawReaders, officials]
  );

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeReaders(
      (data) => {
        setReaders(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
        setError(true);
      }
    );
    return unsub;
  }, []);

  return { readers, loading, error };
}

export function useBooks(): { books: Book[]; loading: boolean; error: boolean } {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeBooks(
      (data) => {
        setBooks(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
        setError(true);
      }
    );
    return unsub;
  }, []);

  return { books, loading, error };
}

export function useMyThreads(uid: string | null): { threads: ChatThread[] } {
  const [threads, setThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured) return;
    const unsub = subscribeMyThreads(uid, setThreads);
    return unsub;
  }, [uid]);

  // Masked instead of cleared via an effect: avoids a synchronous setState in the
  // effect body while still hiding stale data once `uid` goes away (sign-out).
  return { threads: uid ? threads : [] };
}

export function useRatings(): Rating[] {
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeRatings(setRatings);
    return unsub;
  }, []);

  return ratings;
}

// Público, como `ratings`: cualquier visitante puede derivar el conteo de
// canjes de cualquier lector sin depender de un campo que solo una de las
// dos partes de cada canje podría escribir.
export function useCompletedTrades(): CompletedTrade[] {
  const [trades, setTrades] = useState<CompletedTrade[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeCompletedTrades(setTrades);
    return unsub;
  }, []);

  return trades;
}

// Solo moderadores: igual que `useModerationLog`, la suscripción se abre
// nada más para ellos, no para cada visitante que carga la página.
export function useReports(enabled: boolean): Report[] {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (!enabled || !isFirebaseConfigured) return;
    const unsub = subscribeReports(setReports);
    return unsub;
  }, [enabled]);

  return enabled ? reports : [];
}

export function useThreadMessages(threadId: string | null): ChatMessage[] {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!threadId || !isFirebaseConfigured) return;
    const unsub = subscribeThreadMessages(threadId, setMessages);
    return unsub;
  }, [threadId]);

  return threadId ? messages : [];
}
