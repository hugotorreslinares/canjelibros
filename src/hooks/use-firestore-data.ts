"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  ensureReaderProfile,
  fetchIsModerator,
  touchPresence,
  subscribeBooks,
  subscribeModerationLog,
  subscribeMyThreads,
  subscribeRatings,
  subscribeReaders,
  subscribeThreadMessages,
} from "@/lib/firestore-data";
import type { Book, ChatMessage, ChatThread, ModerationLogEntry, Rating, Reader } from "@/lib/types";

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

export function useReaders(): { readers: Reader[]; loading: boolean; error: boolean } {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState(false);

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

export function useThreadMessages(threadId: string | null): ChatMessage[] {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!threadId || !isFirebaseConfigured) return;
    const unsub = subscribeThreadMessages(threadId, setMessages);
    return unsub;
  }, [threadId]);

  return threadId ? messages : [];
}
