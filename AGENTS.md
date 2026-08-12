<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# El Canje — project notes for agents

Book-exchange app, Bogotá. Next.js 16 App Router, TS, Tailwind v4, React 19, Firebase Auth + Firestore, Leaflet/OSM map. Single-page app (`/`) — all routing is client-side state (`route` field), not Next.js routes.

Read this before exploring the codebase — it's the map so you don't have to rediscover it. Setup/env steps: [README.md](README.md). Firestore migration history/rationale: [RESULTS.md](RESULTS.md) (keep or fold into here, don't duplicate).

## Architecture (single source of truth per concern — don't relearn by grepping)

- `src/hooks/use-app-state.ts` — the entire app's state/business logic, one big hook. Every view's props come from here as a grouped object (`mapView`, `catalogView`, `shelfView`, `publishView`, `chatView`, `offerModal`, `ratingModal`, `authModal`, `toast`, `header`). Components are pure render, spread-fed from `ElCanjeApp.tsx`. Read this file first for any logic question — don't re-derive from components.
- `src/lib/firestore-data.ts` — all Firestore reads/writes. `src/hooks/use-firestore-data.ts` — React subscription wrappers (`onSnapshot`) + reader-profile-on-signin bootstrap.
- `src/lib/auth-context.tsx` / `src/lib/firebase.ts` — Firebase Auth + `db` (Firestore) init, both null-guarded via `isFirebaseConfigured` so the app degrades gracefully with no crash when env vars are missing.
- `src/lib/types.ts` — canonical shapes (`Reader`, `Book`). Don't invent parallel types in components; component prop interfaces are intentionally narrower/local views, not duplicates to keep in sync — check here first.
- `src/components/LeafletMap.tsx` — client-only (`next/dynamic`, `ssr:false`), Leaflet needs `window`. OSM tiles, no API key.
- `design_source/` — original Claude Design reference (`.dc.html`), read-only, excluded from lint. Not shipped code.

## Data model (Firestore)

- `readers/{uid}`: name, barrio, lat, lng, online, trades, bio, spot, interests (string[], category names from `formCats` — used for future recommendations, edited from Mi estante's chip toggles). Auto-created on first sign-in (real geolocation, falls back to Bogotá center). `rating` field exists but is a dead legacy default (5, never updated) — display rating is computed client-side from `ratings`, see below. Don't reintroduce reads of `reader.rating` for display.
- `books/{bookId}`: ownerId, t, a, cat, cond, desc, resUid (reservation target or null), createdAt.
- `threads/{threadId}`: one per reader pair, id = `[uidA, uidB].sort().join('_')` (see `threadIdFor` in `firestore-data.ts`) — participants, fromUid/toUid (proposer/recipient), fromBookId/toBookId (the two books in play), dealText, lastMessage, closed. Only the two participants can read/write.
- `threads/{threadId}/messages/{messageId}`: senderId, text, createdAt. Same access as the parent thread.
- `ratings/{ratingId}`: raterUid, ratedUid, stars, createdAt. Public read, create-only (immutable), and only as yourself (`raterUid == request.auth.uid`). A reader's displayed rating = average of `ratings` where `ratedUid == their id`, computed in `use-app-state.ts`'s `avgRatingFor` — not stored anywhere as a single field, because Firestore can't let one user overwrite a rating field on someone else's document.
- Security rules: `firestore.rules` at repo root — public read on readers/books/ratings, owner-only write on readers/books, **except** a book may also be updated by whoever it's currently reserved for (`resUid == request.auth.uid`) when they're claiming ownership (`request.resource.data.ownerId == request.auth.uid`) — that's what makes the trade-completion swap possible without a backend. Threads/messages restricted to their two participants via `request.auth.uid in participants`. **Must be manually created + published in Firebase Console** — not deployable from here (no Firebase CLI/Admin access in this environment). If map/catalog are empty and console shows `Database '(default)' not found`, that's why — it's a console setup step, not a bug. If `firestore.rules` changes in a diff, tell the user to republish it — nothing here auto-deploys.

## Auth-gating pattern

Only publishing/editing/deleting a book and proposing an exchange require sign-in (`requireAuth`/`promptAuth` in `use-app-state.ts`). Browsing (map, catálogo) is open. Keep new gated actions consistent with this split — don't gate reads.

## Scope boundary (intentional, not an oversight)

Everything is real/Firestore now: readers, books, reservations, chat threads + messages, trade completion (both books actually swap owners), and ratings. Only the recipient of a proposal (`thread.toUid`) can close it — `chatView.canConfirm` hides the confirm button for the proposer, and `submitRating` re-checks this server-side-equivalent via the security rules (a book update only succeeds for the owner or the reserved-for claimant, so the proposer literally cannot perform the swap even if the button were shown). Known gap: `readers/{uid}.trades` only increments for whoever confirms — the other party's trade count doesn't move, because nobody can write to someone else's reader doc without a backend.

`ChatView` must be rendered with `key={state.chatView.thread.id}` from `ElCanjeApp.tsx` — that's how its local message-draft input resets when the active thread changes. Don't "simplify" that key away.

## Working conventions

- Tailwind arbitrary-value utilities match the original design's exact px/color values — prefer them over inventing new spacing scale. Inline `style={{}}` reserved for genuinely dynamic runtime values (map pins, gradients, plate colors).
- `npx tsc --noEmit && npx eslint .` before considering any change done; `npm run build` before calling a feature complete.
- Firebase/Google Maps/any paid API: never assume a key exists — guard with the `isXConfigured` pattern already established, degrade to a visible-but-non-crashing state.
- This repo has no test suite — verification is tsc + eslint + build + manual browser check (`preview_start` / Claude Browser tools). Don't claim "tested" without actually driving the browser.
