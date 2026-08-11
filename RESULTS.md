# RESULTS — Firestore backend for books & reader locations

## What changed

Books and reader profiles/locations are now real, persisted in **Firestore** (same Firebase project as Auth — no new env vars). Previously all of this was static in-memory mock data (`src/lib/mock-data.ts`), which is why edit/delete "worked" but never actually saved anything real.

- Map, Catálogo, Mi estante: now render live Firestore data via `onSnapshot` (real-time).
- Publish / edit / delete a book: real Firestore writes (`addDoc`/`updateDoc`/`deleteDoc`).
- Propose an exchange: sets `resUid` on your book in Firestore (real reservation).
- Confirm + rate a trade: deletes the traded book from Firestore and increments your real trade count (`readers/{uid}.trades`).
- Reader profile (`readers/{uid}`) is auto-created the first time a user signs in, using their real browser geolocation (falls back to Bogotá center if denied/unsupported).
- Distances shown on map/catalog are now computed with a real haversine formula from the signed-in user's location, not hardcoded numbers.
- The 5 fictional demo readers (Ana, Julián, etc.) were removed — they weren't real accounts, so they can't own real Firestore data. The map/catalog now populate as real users sign up and publish.

## ⚠️ Required manual step before this works

**Firestore Database does not exist yet in the Firebase project.** Confirmed live: the browser console shows `Database '(default)' not found`. The app degrades gracefully (no crash, empty map/catalog, write attempts show a toast error) but nothing persists until this is done:

1. Firebase Console → **Build → Firestore Database → Create database** (production mode, any region).
2. Publish the rules in [`firestore.rules`](firestore.rules) (paste into the Firestore "Rules" tab, or `firebase deploy --only firestore:rules`). Summary: anyone can read `readers`/`books`; each user can only write their own reader doc and their own books (`ownerId == request.auth.uid`).

No other setup needed — same `NEXT_PUBLIC_FIREBASE_*` vars already in `.env.local` cover Firestore too.

## Data model

- `readers/{uid}`: name, barrio, lat, lng, online, trades, rating, bio, spot.
- `books/{bookId}`: ownerId, t, a, cat, cond, desc, resUid (null or a reader uid), createdAt.

## Scope cut (explicit, on purpose)

Chat/messages, trade negotiation state, and ratings are **still local-only mock state** (not persisted, reset on reload). This was a deliberate cut to keep scope to "libros y ubicaciones" as requested:
- Sending a chat message was already non-functional before this change (the "Enviar" button had no handler) — untouched.
- Thread list, deal text, "propuesta enviada / cerrado" status: local `useState`, lost on refresh.
- What IS real from that flow: the book reservation (`resUid`) and the trade counter — both Firestore.

If real chat/ratings persistence is wanted next, that's the natural following task (would need a `messages` subcollection and a ratings aggregate).

## Bug caught during self-review (fixed)

Deriving chat threads from `myBooks.filter(resUid)` meant the conversation disappeared the instant a trade was confirmed (the book gets deleted on confirm). Fixed by sourcing thread IDs from the `deals` map instead, which persists for the session independent of book lifecycle.

## Verification performed

- `tsc --noEmit`, `eslint .`, `next build`: all clean.
- Browser, unauthenticated: Map/Catálogo/Mensajes all render empty states correctly, no crashes, against the real (not-yet-created) Firestore.
- Browser, real sign-up flow (email/password) against the real Firebase project: works, reader-profile-creation failure (expected, DB missing) fails silently in the background without blocking login.
- Browser: attempted to publish a book while signed in → Firestore write fails as expected (DB missing) → caught, shown as a toast, no crash, no unhandled error in console.
- **Not verified**: an actual successful write/read round-trip, since Firestore doesn't exist in the project yet. No Firebase CLI/emulator available in this environment (no Java runtime for the Firestore emulator, no `firebase` CLI login) to test further without the manual step above.

## Files

New: `firestore.rules`, `src/lib/firestore-data.ts`, `src/lib/geo.ts`, `src/lib/geo-constants.ts`, `src/hooks/use-firestore-data.ts`.
Rewritten: `src/hooks/use-app-state.ts` (major), `src/lib/types.ts`, `src/lib/mock-data.ts` (trimmed to static option lists only).
Touched: `src/lib/firebase.ts` (added `db` export), `src/components/ShelfView.tsx` (real reader name/barrio, signed-out state), `src/components/ChatView.tsx` (empty-state when no threads).

Branch: `feat/firestore-backend` (off latest `origin/main`). Not committed yet.

---

## Update: chat now persists too, plus bug fixes found during live testing

After deploying and testing against the real Firebase project (database created, rules published), the user found and I fixed:

1. **Stale cross-account state.** `form`/`editingBookId`/`offer`/`sel`/etc. lived in plain `useState` and survived signing out and into a *different* account in the same tab — e.g. clicking "Publicar libro" as user B could show user A's leftover edit form. Fixed with a render-time reset (not `useEffect` — this project's ESLint now has `react-hooks/set-state-in-effect`, which forbids synchronous `setState` in an effect body) keyed on `user?.uid` change, in `use-app-state.ts`.
2. **Chat now real, not local mock**: user explicitly asked for message persistence ("es una aplicación real, los datos deben persistir"). Added `threads/{id}` + `threads/{id}/messages` collections (see AGENTS.md's Data model section for the shape). `sendOffer` now creates the thread + first message in Firestore instead of local `useState`; `ChatView`'s "Enviar" button is wired to `sendThreadMessage`; closing a trade calls `closeThread`. `firestore.rules` updated with participant-only access rules for both.
3. Known remaining gap: star ratings still don't write anywhere (see README's "Qué es real" section).

Files touched in this update: `firestore.rules`, `src/lib/types.ts`, `src/lib/firestore-data.ts`, `src/hooks/use-firestore-data.ts`, `src/hooks/use-app-state.ts`, `src/components/ChatView.tsx`, `src/components/ElCanjeApp.tsx` (added `key={thread.id}` on `ChatView` — required for its message-draft input to reset between threads, since draft state can't be cleared via ref-during-render in a component under this project's lint rules, only in hooks).

Verified: `tsc`, `eslint`, `next build` all clean. Not re-verified end-to-end in a live two-account browser session after this specific update (no multi-account browser automation available here) — recommend the user test propose → message → confirm → rate once more before considering it done.

---

## Update: real book swap + real ratings on trade close

User reported, after the chat update landed: closing a trade removed the book from the closer's shelf but it never showed up on the other person's shelf, and the star rating wasn't saved anywhere. Both were real gaps, not bugs in the literal sense — the original design only ever deleted one book and discarded the rating; this update makes a "canje" an actual two-way transfer.

Why this needed a rules change, not just app code: Firestore only lets a user write their own documents. A straightforward "both books swap owners" write can't be issued by just anyone — the person clicking confirm doesn't own the other party's book. Fix: `firestore.rules`' book `update` rule now also allows a user to claim a book that is currently reserved for them (`resUid == request.auth.uid`) as long as the update sets themselves as the new owner and clears the reservation. Combined with "you can always update a book you already own," this means **only the recipient of a proposal can complete it** — they're the only party who both owns their own offered-in-return book and is the reservation target of the other one. `chatView.canConfirm` now hides the confirm button from the proposer accordingly.

Same ownership problem applied to ratings: a rating can't be written onto someone else's `readers/{uid}` document. Added a `ratings` collection instead (append-only, `raterUid == request.auth.uid` required) — a reader's displayed rating is now the live average of their `ratings`, computed client-side in `avgRatingFor` (`use-app-state.ts`), not a field anyone tries to overwrite on their profile.

Thread docs gained `fromUid`/`toUid`/`fromBookId`/`toBookId` (set once, at proposal time) so the confirm step knows exactly which two books to swap without re-deriving it from live reservation state.

**Requires republishing `firestore.rules`** (changed again) — same steps as before, paste the updated file into the Firestore Rules tab and Publish.

Files touched: `firestore.rules`, `src/lib/types.ts` (`ChatThread` gained 4 fields, added `Rating`), `src/lib/firestore-data.ts` (`transferBook`, `addRating`, `subscribeRatings`, `openThread` signature changed), `src/hooks/use-firestore-data.ts` (`useRatings`), `src/hooks/use-app-state.ts` (`avgRatingFor`, rewritten `submitRating`, `sendOffer` passes book ids, `canConfirm` gated by recipient).

Verified: `tsc`, `eslint`, `next build` clean. Had to fix one React Compiler lint error along the way — a loose (non-memoized) computation in the hook body confused its dependency inference for unrelated `useCallback`s further down the same function; wrapped it in `useMemo` and the cascade cleared. Not re-verified live with two accounts (same limitation as before — no multi-account browser automation here); user should test propose → confirm as recipient → check both shelves → check the proposer's new rating.
