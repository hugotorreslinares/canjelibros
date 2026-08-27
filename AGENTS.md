<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Librocambio — project notes for agents

Book-exchange app, Bogotá. Next.js 16 App Router, TS, Tailwind v4, React 19, Firebase Auth + Firestore, Leaflet/OSM map, shadcn/ui on a Radix base.

**Routing**: one optional catch-all segment (`src/app/[[...slug]]/page.tsx`) serves every path, and `src/lib/routes.ts` maps a path to a view (`/catalogo`, `/estante`, `/publicar`, `/mensajes`, `/moderacion`, `/politicas`, `/lector/<uid>`). `use-app-state` reads `usePathname()` and derives the route from it; navigation goes through `window.history.pushState`, which Next syncs with its router — that is what keeps filters, drafts and selections alive across a view change. Don't add a `page.tsx` per view: that would remount the tree and throw that state away.

Read this before exploring the codebase — it's the map so you don't have to rediscover it. Setup/env steps: [README.md](README.md). Firestore migration history/rationale: [RESULTS.md](RESULTS.md) (keep or fold into here, don't duplicate).

## Architecture (single source of truth per concern — don't relearn by grepping)

- `src/hooks/use-app-state.ts` — the entire app's state/business logic, one big hook. Every view's props come from here as a grouped object (`mapView`, `catalogView`, `shelfView`, `publishView`, `chatView`, `moderationView`, `policiesView`, `offerModal`, `ratingModal`, `authModal`, `deleteDialog`, `header`). It hands components **facts, not styles**: `reserved`, `mine`, `closed`, `dist: number | null` — never a hex or a class. If you find yourself computing a colour there, that decision belongs in the component. Components are pure render, spread-fed from `ElCanjeApp.tsx`. Read this file first for any logic question — don't re-derive from components.
- `src/lib/firestore-data.ts` — all Firestore reads/writes. `src/hooks/use-firestore-data.ts` — React subscription wrappers (`onSnapshot`) + reader-profile-on-signin bootstrap.
- `src/lib/auth-context.tsx` / `src/lib/firebase.ts` — Firebase Auth + `db` (Firestore) init, both null-guarded via `isFirebaseConfigured` so the app degrades gracefully with no crash when env vars are missing.
- `src/lib/types.ts` — canonical shapes (`Reader`, `Book`). Don't invent parallel types in components; component prop interfaces are intentionally narrower/local views, not duplicates to keep in sync — check here first.
- `src/components/LeafletMap.tsx` — client-only (`next/dynamic`, `ssr:false`), Leaflet needs `window`. OSM tiles, no API key. Pins group by screen proximity at the current zoom (`CLUSTER_RADIUS_PX`) and their labels only show on hover/focus/selection — permanent labels collided. A group opens a **list** of its readers, not a zoom: profiles are created with the device's location, so several readers share a point and zooming never separates them.
- `design_source/` — original Claude Design reference (`.dc.html`), read-only, excluded from lint. Not shipped code.

## Data model (Firestore)

- `readers/{uid}`: name, barrio, lat, lng, online, trades, bio, spot, interests (string[], category names from `formCats` — used for future recommendations, edited from Mi estante's chip toggles). Auto-created on first sign-in (real geolocation, falls back to Bogotá center). `rating` field exists but is a dead legacy default (5, never updated) — display rating is computed client-side from `ratings`, see below. Don't reintroduce reads of `reader.rating` for display.
- `books/{bookId}`: ownerId, t, a, cat, cond, desc, cover (JPEG data URL or null), resUid (reservation target or null), createdAt.
  - **Covers live inline in the document, not in Cloud Storage** — since Feb 2026 a Storage bucket requires a linked billing account even for a few KB, and this app must run on the free tier. `src/lib/image.ts` downscales to 520 px and re-encodes as JPEG until the data URL fits `MAX_COVER_CHARS` (120k; a 12 MP photo lands near 41k), and `firestore.rules` caps the field at 140k so a hand-rolled client can't park hundreds of KB in everyone's catalog read. The trade-off: every cover travels with every books snapshot — if the catalog ever grows past a few hundred books, that's the thing to move to Storage/a CDN.
  - `src/components/BookCover.tsx` is the single renderer: reader photo when present, a composed typographic plate otherwise, both in the same 2:3 frame with a spine shadow so they read as the same object. Pass `size` (`sm`/`md`/`lg`), not text classes — each size carries its own composition. `plateFor` in `src/lib/design-utils.ts` holds eight mid-tone colours, all ≥5.7:1 against the cream the title is set in; the old palette's near-blacks read as broken images beside real photos.
- `threads/{threadId}`: one per reader pair, id = `[uidA, uidB].sort().join('_')` (see `threadIdFor` in `firestore-data.ts`) — participants, fromUid/toUid (proposer/recipient), fromBookId/toBookId (the two books in play), dealText, lastMessage, closed. Only the two participants can read/write.
- `threads/{threadId}/messages/{messageId}`: senderId, text, createdAt. Same access as the parent thread.
- `moderators/{uid}`: empty marker doc — its existence *is* the moderator role. Created by hand in the Firebase Console (no backend can grant it). Each user may read only their own doc, so the roster isn't public; `useIsModerator` reads it to decide whether to show the Moderación panel, and `firestore.rules`' `isModerator()` reads the same doc to actually allow the write. To make someone a censor: create `moderators/<uid>` in the Console.
- `moderationLog/{entryId}`: append-only audit trail — action (`edit`/`delete`), bookId/bookTitle, ownerId/ownerName, moderatorUid/moderatorName, reason, changes (field-by-field diff strings, empty for deletes), createdAt. Readable and creatable only by moderators, **never** updatable or deletable (rules), so the record of what was censored can't itself be censored. Written after the book write succeeds; if the log write fails the toast says the action landed but wasn't recorded. Both moderation actions refuse to run without a reason.
- `ratings/{ratingId}`: raterUid, ratedUid, stars, createdAt. Public read, create-only (immutable), and only as yourself (`raterUid == request.auth.uid`). A reader's displayed rating = average of `ratings` where `ratedUid == their id`, computed in `use-app-state.ts`'s `avgRatingFor` — not stored anywhere as a single field, because Firestore can't let one user overwrite a rating field on someone else's document.
- Security rules: `firestore.rules` at repo root — public read on readers/books/ratings, owner-only write on readers/books, **except** moderators (see `moderators/{uid}`), who may update or delete any book, and **except** a book may also be updated by whoever it's currently reserved for (`resUid == request.auth.uid`) when they're claiming ownership (`request.resource.data.ownerId == request.auth.uid`) — that's what makes the trade-completion swap possible without a backend. Threads/messages restricted to their two participants via `request.auth.uid in participants`. **Nothing here auto-deploys them**: a merge ships the app, never the rules. `firebase.json` + `.firebaserc` (project `canjelibros-2026`) let the user publish with `npx firebase-tools deploy --only firestore:rules` from their own terminal — the login is interactive, so an agent can't run it; the Firebase Console's Rules tab does the same by hand. If `firestore.rules` changes in a diff, say so and tell the user to publish it. If map/catalog are empty and the console shows `Database '(default)' not found`, that's the database itself missing — a console setup step, not a bug.

## Moderation + policies

- `ModerationView` (route `moderation`, header link visible only to moderators) lists **every** book with owner name and reservation state, a text filter, an inline edit form, and delete. It's a content-policy tool, not a shelf: it bypasses slot limits and the "no borrar libro reservado" rule that `ShelfView` enforces, and deleting a reserved book will break that pending trade (the confirm dialog says so).
- `PoliciesView` (route `policies`) is static copy — prohibited content, house rules, moderation, how to report. Reachable by anyone from the footer in `ElCanjeApp.tsx`.
- Every edit and delete asks for a motivo (inline field for edits, `window.prompt` for deletes) and writes a `moderationLog` entry; the panel renders the last 50 entries under "Bitácora de moderación".
- The UI flag and the enforced permission both come from `moderators/{uid}`, so hiding the panel is cosmetic — the rules are what stop a non-moderator who forces the route.

## Auth-gating pattern

Only publishing/editing/deleting a book and proposing an exchange require sign-in (`requireAuth`/`promptAuth` in `use-app-state.ts`). Browsing (map, catálogo) is open. Keep new gated actions consistent with this split — don't gate reads.

## Scope boundary (intentional, not an oversight)

Everything is real/Firestore now: readers, books, reservations, chat threads + messages, trade completion (both books actually swap owners), and ratings. Only the recipient of a proposal (`thread.toUid`) can close it — `chatView.canConfirm` hides the confirm button for the proposer, and `submitRating` re-checks this server-side-equivalent via the security rules (a book update only succeeds for the owner or the reserved-for claimant, so the proposer literally cannot perform the swap even if the button were shown). Known gap: `readers/{uid}.trades` only increments for whoever confirms — the other party's trade count doesn't move, because nobody can write to someone else's reader doc without a backend.

`ChatView` must be rendered with `key={state.chatView.thread.id}` from `ElCanjeApp.tsx` — that's how its local message-draft input resets when the active thread changes. Don't "simplify" that key away.

## SEO and machine readability

- `src/lib/seo.ts` is the single source: site name, description, the canonical URL (from `NEXT_PUBLIC_SITE_URL`, else Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, else localhost), the per-route title/description/index table, and the JSON-LD graph. Change copy there, not in a component.
- The catch-all page's `generateMetadata` gives every view its own title, description and canonical, and marks the personal ones (`/estante`, `/publicar`, `/mensajes`, `/moderacion`, `/lector/*`) `noindex`. `robots.ts` disallows the same set; `sitemap.ts` lists only the indexable ones.
- An unknown path **404s** (`isKnownPath` in `src/lib/routes.ts`). Without that check a catch-all answers 200 to any URL, which is duplicate content at infinite addresses.
- `public/llms.txt` describes the site for AI crawlers, and `src/app/opengraph-image.tsx` generates the share card. Its type falls back to Satori's sans — a serif would need the font file fetched into the route.
- **The limit worth knowing**: books and readers come from Firestore in the browser, so the served HTML carries the shell and the static copy but no catalog. `/politicas` is fully in the HTML; `/catalogo` is not. Server-rendering real listings needs a server-side read (Admin SDK, hence a paid plan) — until then, no crawler and no model sees an actual book.

## Design system (read before writing any markup)

The px-for-px parity with `design_source/` is **over** — that file is historical reference now. What governs is the token system in `src/app/globals.css`, direction «Papel y tinta», and [UI-PLAN.md](UI-PLAN.md) records why each piece exists. [DESIGN-AUDIT.md](DESIGN-AUDIT.md) is the audit it answers; its finding ids (`4.1`, `5.2`) are cited in commits.

- **Six type steps, nothing else**: `text-label` (12, uppercase, tracked), `text-small` (15), `text-body` (17), `text-subtitle` (21), `text-title` (28), `text-display` (44). A size outside this table is a bug. Twelve sizes on one screen is what the audit found.
- **Spacing on the 4px grid** — Tailwind's default `--spacing`. No new arbitrary `[13px]` values.
- **Colour only through tokens**: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-destructive`, `border-border`. No hex in a component. `--primary` is `#00769a`, not the old `#0088b0`, because white-on-teal has to clear 4.5:1. `--destructive` means destructive **only** — it is not the colour of a completed trade.
- **44px minimum** for anything tappable. `Button`'s default size is 44; that is deliberate, not shadcn's default.
- **shadcn components live in `src/components/ui/`** and we own them: `button`, `badge`, `dialog`, `alert-dialog`, `sheet`, `sonner`, `skeleton`, `empty`, `alert`, `separator`, `carousel`, `bubble`, `message-scroller`. Several are re-skinned or patched (button sizes, 40% overlay scrim, carousel via `useSyncExternalStore`, 44px carousel arrows). **Re-running `shadcn add` with `--overwrite` throws that away** — answer no to the button prompt.
- `src/lib/ui.ts` is gone. If you need a button, import `Button`; don't reintroduce class-string constants.

App-level components worth knowing before you build a new one: `BookCover` (2:3 frame, photo or `TypePlate`-style plate, `size` prop), `QueryState` + `BookGridSkeleton` (loading / error / empty — never render an empty list for all three), `DistanceLabel` (renders nothing when distance is unknown; never print "0 km"), `DeleteDialog` (every destructive confirm; no `window.confirm`/`window.prompt`), `Toaster` from `sonner` (the only feedback channel; it portals above modals).

## Working conventions

- Inline `style={{}}` is reserved for genuinely dynamic runtime values (map pins, gradients, plate colours) — not for spacing or type.
- `npx tsc --noEmit && npx eslint .` before considering any change done; `npm run build` before calling a feature complete. **Both need Node ≥ 20**; this machine's default `node` has been seen at v14, where even `next dev` fails to parse.
- The lint here is stricter than most React setups: no `setState` inside an effect body, no reading refs during render. When a shipped shadcn component breaks it (the carousel did), fix the component — don't disable the rule.
- Firebase/Google Maps/any paid API: never assume a key exists — guard with the `isXConfigured` pattern already established, degrade to a visible-but-non-crashing state.
- This repo has no test suite — verification is tsc + eslint + build + manual browser check (`preview_start` / Claude Browser tools). Don't claim "tested" without actually driving the browser.

## Commits and releases

Commit subjects are **Conventional Commits** — `type(scope): subject` — because release-please parses them to build the changelog and pick the version. A commit that doesn't parse is not an error: it silently never appears in the release notes, which is the failure mode to watch for. `commitlint` runs on the `commit-msg` hook so a malformed subject is rejected before it lands.

- `feat:` something a reader can now do → minor bump. `fix:` a defect they hit → patch. `perf:`, `refactor:`, `docs:`, `chore:`, `test:`, `build:`, `ci:` for the rest; only the first three reach the published changelog.
- A breaking change is `feat!:` or a `BREAKING CHANGE:` footer. While the version is 0.x that still bumps the minor, not the major.
- The subject is the one line a reader sees in the changelog, so it stays plain language in the imperative: `feat: mark reserved books in the catalog`, not `feat: add badge`. **The body keeps carrying the reasoning** — the *why*, the trade-off, what was measured, what was deliberately not done. The type prefix is metadata for the tooling; it doesn't license a thinner message.
- Releasing is not manual: merging to `main` makes release-please open a release pull request; merging *that* tags the commit and publishes the GitHub Release. Never bump `package.json` or edit `CHANGELOG.md` by hand — both are generated, and a hand edit is overwritten on the next run. To force a specific number, land a commit with a `Release-As: 1.0.0` footer.
- Vercel deploys every push to `main` regardless of releases. A tag marks what shipped; it doesn't ship it.
