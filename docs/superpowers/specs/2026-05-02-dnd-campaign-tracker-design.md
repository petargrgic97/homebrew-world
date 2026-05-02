# D&D Campaign Tracker — Design

**Date:** 2026-05-02
**Status:** Spec, awaiting review

## Purpose

A web app for a single tabletop campaign (1 DM + 4 players) that serves as a living world bible. The DM edits content; players have a public read-only view. The app tracks locations, NPCs, sessions, events, and a current world map for everyone, plus ongoing plots that are visible only to the DM.

## Users & access

- **DM (single user, you).** Authenticates via Firebase Auth (Google sign-in). Sees the full app including plots; can create/edit/delete everything.
- **Players (4).** No authentication. Visit the public URL and browse content. Cannot see plots.

UID-based allowlisting in Firestore security rules is the actual gate. The client-side `/dm` route check is convenience UX only.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Data | Firestore via Firebase JS SDK (client-side) |
| Auth | Firebase Auth (Google provider) |
| File storage | Firebase Storage |
| Markdown render | `react-markdown` + `remark-gfm` |
| Markdown edit | `@uiw/react-md-editor` |
| Data fetching | SWR (revalidate on focus, no realtime listeners) |
| Hosting | Netlify with `@netlify/plugin-nextjs` |

The Next.js shell exists for routing, layouts, and Tailwind plumbing. All data access happens in client components via the Firebase JS SDK — no server actions, no API routes, no Firebase Admin SDK.

## Data model

Six top-level Firestore collections. Documents auto-generate IDs. All collections include `createdAt` and `updatedAt` server timestamps unless noted.

### `locations`
```ts
{
  id: string,
  name: string,
  description: string,        // markdown
  imageUrl: string | null,    // hero image, optional
  order: number,              // manual sort key
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### `npcs`
```ts
{
  id: string,
  name: string,
  description: string,        // markdown
  portraitUrl: string | null,
  status: 'alive' | 'dead' | 'missing' | 'unknown',
  faction: string,            // freeform tag, may be empty
  locationId: string | null,  // foreign key into locations
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### `sessions`
```ts
{
  id: string,
  number: number,             // 1, 2, 3...
  date: string,               // ISO date, real-world session date
  title: string | null,
  recap: string,              // markdown
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### `events`
```ts
{
  id: string,
  title: string,
  description: string,        // markdown
  locationId: string | null,
  sessionId: string | null,
  occurredAt: string,         // ISO date, defaults to session.date but editable
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

Events are queried two ways:
- By `locationId` for the location detail page (shows what happened there)
- By `sessionId` for the session detail page (shows what happened that session)

### `plots` (DM-only)
```ts
{
  id: string,
  title: string,
  description: string,        // markdown
  status: 'active' | 'resolved' | 'dormant',
  npcIds: string[],
  locationIds: string[],
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### `maps` (version history)
```ts
{
  id: string,
  imageUrl: string,
  caption: string | null,
  isCurrent: boolean,         // exactly one document has true
  uploadedAt: Timestamp,
}
```

When a new map is uploaded, a batch write creates the new doc with `isCurrent: true` and flips the previous current to `false`.

### Modeling notes
- Foreign keys store IDs only; no denormalization. The dataset is small enough that the extra read fan-out is fine.
- All references are nullable (NPCs can be unattached; events can omit location or session).
- No soft deletes. Hard delete; the DM is the only writer.

## Routes

### Public player view
| Path | Purpose |
|---|---|
| `/` | Home: current map preview, recent sessions, quick links |
| `/locations` | Grid of all locations (alphabetical or by `order`) |
| `/locations/[id]` | Detail: description, NPCs here, events timeline |
| `/npcs` | Grid; filter chips for status + faction; client-side name search |
| `/npcs/[id]` | Detail: portrait, description, location link, events involved |
| `/sessions` | List, newest first |
| `/sessions/[id]` | Recap + events from this session |
| `/map` | Full-size current map + version history strip |

### DM view (auth-gated)
Same routes mirrored under `/dm/...`, plus:

| Path | Purpose |
|---|---|
| `/dm/login` | Sign in with Google |
| `/dm/plots` | List of plots (no public counterpart) |
| `/dm/plots/[id]` | Plot detail with linked NPCs/locations |

DM list pages have a "+ New" button. DM detail pages have inline Edit/Delete. A persistent header indicates "DM Mode" with a "View as player" link to `/`.

## Auth & security

### Sign-in
1. Visit `/dm/login` → "Sign in with Google" button (Firebase Auth popup or redirect).
2. On success, client checks `auth.currentUser.uid` against an env-baked allowlist (typically a single UID).
3. If allowlisted → render DM UI. Otherwise → "Not authorized" screen with a sign-out button.

### Firestore security rules
```
match /databases/{db}/documents {
  function isDM() {
    return request.auth != null
      && request.auth.uid in ['<DM_UID>'];
  }

  match /plots/{doc} {
    allow read, write: if isDM();
  }

  match /{collection}/{doc} {
    allow read: if true;
    allow write: if isDM();
  }
}
```

### Storage rules
Same shape: public read on `npc-portraits/`, `location-images/`, `maps/`; DM-only write.

### Threat model (v1)
- A player opening devtools cannot read plots — Firestore rejects unauthenticated reads on that collection.
- A player cannot write anything anywhere.
- The DM allowlist lives server-side in rules, not in client code.
- We are not protecting against a determined attacker with the public URL stealing public-collection data — by design, that's the player view.

## File storage

Folder layout in Firebase Storage:
- `npc-portraits/{npcId}.{ext}`
- `location-images/{locationId}.{ext}`
- `maps/{timestamp}.{ext}`

Upload flow: client → Firebase Storage upload → on success, write returned download URL into the corresponding Firestore document field. No image resizing/transformation in v1; Next.js `<Image>` handles display sizing.

## Data fetching pattern

- All data access happens in client components.
- Reads use Firebase SDK `getDoc` / `getDocs` wrapped in SWR keys, e.g. `useSWR(['location', id], fetcher)`.
- SWR provides automatic revalidation on tab focus, so when a player returns to the tab they see fresh content without a manual refresh.
- After the DM saves an edit, the relevant SWR key is invalidated locally so the DM sees their own change immediately.
- No `onSnapshot` listeners. No live updates during a session — players refresh or refocus the tab.

## Editing UX

- Detail pages have an "Edit" button (DM only) that flips the page into editable mode.
- Markdown fields use `@uiw/react-md-editor` with split preview on desktop, single-pane on mobile.
- Image fields use a drag-drop zone with file picker fallback.
- Save commits to Firestore with a server timestamp on `updatedAt` and invalidates the SWR cache.
- Cancel restores the original values.
- Delete prompts a native confirm dialog.

## Layout & navigation

- Desktop: persistent left sidebar with Locations / NPCs / Sessions / Map (and Plots when in `/dm`).
- Mobile: bottom nav with the same destinations.
- Top header shows campaign title and (in `/dm`) a "DM Mode" pill plus "View as player" link.
- shadcn/ui components throughout (cards, buttons, dialogs, dropdowns, inputs).

## Search & filters (v1)

- **NPC list:** filter chips for `status` and `faction`, name text search (client-side filter on the loaded list).
- **Location list:** alphabetical with manual `order` override.
- **Session list:** descending by `number`.
- **Events on a detail page:** descending by `occurredAt`.
- No global search across entities.

## Out of scope (deliberately)

- Multi-campaign support
- Multi-DM support
- Per-player accounts or per-player notes
- Real-time updates (Firestore listeners)
- Combat tracker, initiative, dice roller, character sheets
- Player-submitted comments or notes
- Global search
- Email or push notifications
- Export / print views
- Audit log of edits
- Soft deletes / undo
- Image resizing or optimization beyond Next.js `<Image>` defaults
- Interactive map markers / pins / fog of war (deferred from world map options B and C)

## Open questions

None at spec time. Implementation plan will surface anything that emerges.
