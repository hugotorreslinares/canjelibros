import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  addDoc,
  limit,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db, FirebaseNotConfiguredError } from "./firebase";
import { BOGOTA_CENTER } from "./geo-constants";
import type {
  Book,
  ChatMessage,
  ChatThread,
  ModerationAction,
  ModerationLogEntry,
  NewBook,
  Rating,
  Reader,
} from "./types";

const READERS = "readers";
const BOOKS = "books";
const THREADS = "threads";
const MESSAGES = "messages";
const RATINGS = "ratings";
const MODERATORS = "moderators";
const MODERATION_LOG = "moderationLog";
const MODERATION_LOG_PAGE = 50;

export function threadIdFor(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("_");
}

// Moderator status lives in `moderators/{uid}`, created by hand in the Firebase Console —
// there's no backend here that could grant the role, and the security rules read the same
// doc, so the UI flag and the enforced permission can't drift apart.
export async function fetchIsModerator(uid: string): Promise<boolean> {
  if (!db) throw new FirebaseNotConfiguredError();
  const snap = await getDoc(doc(db, MODERATORS, uid));
  return snap.exists();
}

// Append-only audit trail of moderator actions: rules let moderators create entries as
// themselves and read them, never edit or delete one. Written *after* the book write
// succeeds, so the log can't claim an action that never landed.
export async function logModerationAction(entry: {
  action: ModerationAction;
  bookId: string;
  bookTitle: string;
  ownerId: string;
  ownerName: string;
  moderatorUid: string;
  moderatorName: string;
  reason: string;
  changes: string[];
}): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await addDoc(collection(db, MODERATION_LOG), { ...entry, createdAt: serverTimestamp() });
}

export function subscribeModerationLog(
  cb: (entries: ModerationLogEntry[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!db) throw new FirebaseNotConfiguredError();
  const q = query(collection(db, MODERATION_LOG), orderBy("createdAt", "desc"), limit(MODERATION_LOG_PAGE));
  return onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            action: data.action === "delete" ? ("delete" as const) : ("edit" as const),
            bookId: data.bookId ?? "",
            bookTitle: data.bookTitle ?? "",
            ownerId: data.ownerId ?? "",
            ownerName: data.ownerName ?? "",
            moderatorUid: data.moderatorUid ?? "",
            moderatorName: data.moderatorName ?? "",
            reason: data.reason ?? "",
            changes: data.changes ?? [],
            createdAt: data.createdAt?.toMillis?.() ?? 0,
          };
        })
      );
    },
    (err) => {
      console.error("moderation log subscription failed", err);
      onError?.(err);
    }
  );
}

export async function ensureReaderProfile(user: User, coords?: { lat: number; lng: number }): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  const ref = doc(db, READERS, user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  const name = user.displayName || user.email?.split("@")[0] || "Lector nuevo";
  await setDoc(ref, {
    name,
    barrio: "Bogotá",
    lat: coords?.lat ?? BOGOTA_CENTER.lat,
    lng: coords?.lng ?? BOGOTA_CENTER.lng,
    trades: 0,
    bio: "",
    spot: "",
    interests: [],
    lastSeenAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}

// Un latido por sesión y cada pocos minutos mientras la pestaña esté visible.
// Es lo único que puede escribir la presencia sin un backend: cada lector
// solo puede tocar su propio documento.
export async function touchPresence(uid: string): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await updateDoc(doc(db, READERS, uid), { lastSeenAt: serverTimestamp() });
}

// Atomic add/remove on the array (not a read-modify-write of the whole list): two rapid
// toggles on different categories would otherwise race and silently lose one of them.
export async function addReaderInterest(uid: string, cat: string): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await updateDoc(doc(db, READERS, uid), { interests: arrayUnion(cat) });
}

export async function removeReaderInterest(uid: string, cat: string): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await updateDoc(doc(db, READERS, uid), { interests: arrayRemove(cat) });
}

export function subscribeReaders(cb: (readers: Reader[]) => void, onError?: (err: unknown) => void): Unsubscribe {
  if (!db) throw new FirebaseNotConfiguredError();
  return onSnapshot(
    collection(db, READERS),
    (snap) => {
      cb(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name ?? "",
            barrio: data.barrio ?? "",
            lat: data.lat ?? BOGOTA_CENTER.lat,
            lng: data.lng ?? BOGOTA_CENTER.lng,
            lastSeenAt: data.lastSeenAt?.toMillis?.() ?? null,
            trades: data.trades ?? 0,
            bio: data.bio ?? "",
            spot: data.spot ?? "",
            interests: data.interests ?? [],
          };
        })
      );
    },
    (err) => {
      console.error("readers subscription failed", err);
      onError?.(err);
    }
  );
}

export function subscribeBooks(cb: (books: Book[]) => void, onError?: (err: unknown) => void): Unsubscribe {
  if (!db) throw new FirebaseNotConfiguredError();
  return onSnapshot(
    collection(db, BOOKS),
    (snap) => {
      cb(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ownerId: data.ownerId,
            t: data.t ?? "",
            a: data.a ?? "",
            cat: data.cat ?? "",
            cond: data.cond ?? "",
            desc: data.desc ?? "",
            cover: data.cover ?? null,
            resUid: data.resUid ?? null,
            createdAt: data.createdAt?.toMillis?.() ?? 0,
          };
        })
      );
    },
    (err) => {
      console.error("books subscription failed", err);
      onError?.(err);
    }
  );
}

export async function createBook(ownerId: string, book: NewBook): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await addDoc(collection(db, BOOKS), { ...book, ownerId, resUid: null, createdAt: serverTimestamp() });
}

export async function updateBook(bookId: string, patch: Partial<NewBook>): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await updateDoc(doc(db, BOOKS, bookId), patch);
}

export async function reserveBook(bookId: string, resUid: string | null): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await updateDoc(doc(db, BOOKS, bookId), { resUid });
}

// Transfers a book to `newOwnerId` and clears its reservation. Firestore rules allow this
// write in two cases: the caller already owns the book (giving it away), or the book is
// currently reserved for the caller and the caller is claiming it (receiving it) — see
// firestore.rules for the exact "claim" condition.
export async function transferBook(bookId: string, newOwnerId: string): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await updateDoc(doc(db, BOOKS, bookId), { ownerId: newOwnerId, resUid: null });
}

export async function deleteBook(bookId: string): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await deleteDoc(doc(db, BOOKS, bookId));
}

export async function bumpReaderTrades(uid: string): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await updateDoc(doc(db, READERS, uid), { trades: increment(1) });
}

export function subscribeMyThreads(
  uid: string,
  cb: (threads: ChatThread[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!db) throw new FirebaseNotConfiguredError();
  const q = query(collection(db, THREADS), where("participants", "array-contains", uid));
  return onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            participants: data.participants,
            dealText: data.dealText ?? "",
            lastMessage: data.lastMessage ?? "",
            lastMessageAt: data.lastMessageAt?.toMillis?.() ?? 0,
            closed: data.closed ?? false,
            fromUid: data.fromUid ?? "",
            toUid: data.toUid ?? "",
            fromBookId: data.fromBookId ?? "",
            toBookId: data.toBookId ?? "",
          };
        })
      );
    },
    (err) => {
      console.error("threads subscription failed", err);
      onError?.(err);
    }
  );
}

export function subscribeThreadMessages(
  threadId: string,
  cb: (messages: ChatMessage[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!db) throw new FirebaseNotConfiguredError();
  const q = query(collection(db, THREADS, threadId, MESSAGES), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            senderId: data.senderId,
            text: data.text ?? "",
            createdAt: data.createdAt?.toMillis?.() ?? 0,
          };
        })
      );
    },
    (err) => {
      console.error("thread messages subscription failed", err);
      onError?.(err);
    }
  );
}

export async function openThread(
  fromUid: string,
  toUid: string,
  fromBookId: string,
  toBookId: string,
  dealText: string
): Promise<string> {
  if (!db) throw new FirebaseNotConfiguredError();
  const id = threadIdFor(fromUid, toUid);
  await setDoc(
    doc(db, THREADS, id),
    { participants: [fromUid, toUid].sort(), fromUid, toUid, fromBookId, toBookId, dealText, closed: false },
    { merge: true }
  );
  return id;
}

export async function sendThreadMessage(threadId: string, senderId: string, text: string): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await addDoc(collection(db, THREADS, threadId, MESSAGES), { senderId, text, createdAt: serverTimestamp() });
  await setDoc(doc(db, THREADS, threadId), { lastMessage: text, lastMessageAt: serverTimestamp() }, { merge: true });
}

export async function closeThread(threadId: string): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await setDoc(doc(db, THREADS, threadId), { closed: true }, { merge: true });
}

export async function addRating(
  raterUid: string,
  ratedUid: string,
  stars: number,
  tags: string[]
): Promise<void> {
  if (!db) throw new FirebaseNotConfiguredError();
  await addDoc(collection(db, RATINGS), { raterUid, ratedUid, stars, tags, createdAt: serverTimestamp() });
}

export function subscribeRatings(cb: (ratings: Rating[]) => void, onError?: (err: unknown) => void): Unsubscribe {
  if (!db) throw new FirebaseNotConfiguredError();
  return onSnapshot(
    collection(db, RATINGS),
    (snap) => {
      cb(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            raterUid: data.raterUid,
            ratedUid: data.ratedUid,
            stars: data.stars ?? 0,
            tags: data.tags ?? [],
            createdAt: data.createdAt?.toMillis?.() ?? 0,
          };
        })
      );
    },
    (err) => {
      console.error("ratings subscription failed", err);
      onError?.(err);
    }
  );
}
