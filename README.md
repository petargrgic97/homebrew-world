# Homebrew World

A D&D campaign tracker — the DM edits, players read. Tracks the party, NPCs, locations, sessions with timeline events, plots (DM-only), and a versioned world map.

Stack: Next.js 16 · TypeScript · Tailwind v4 · shadcn/ui · Firebase (Auth + Firestore) · Cloudinary (images) · SWR · Netlify.

## Prerequisites

- Node 20+
- A Firebase project (Auth + Firestore enabled)
- A Cloudinary account (free tier)
- A Netlify account (for deployment)

## Setup

### 1. Clone & install

```bash
git clone https://github.com/petargrgic97/homebrew-world.git
cd homebrew-world
npm install
```

### 2. Firebase

In the Firebase console:

1. Create a project (any name).
2. Enable **Authentication → Sign-in method → Google**.
3. Enable **Firestore Database** in production mode (any region).
4. **Project settings → Your apps → Web (`</>`)** to register a web app and copy the config values.
5. Sign in to your local app once with Google to obtain your DM UID. Find it in **Authentication → Users**.

### 3. Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com).
2. **Settings → Upload → Upload presets → Add upload preset.**
   - Name: anything (e.g. `homebrew-world`).
   - Signing mode: **Unsigned**.
   - Restrictions: max file size 5 MB, allowed formats jpg/png/webp.
3. Note your cloud name (top of dashboard) and the preset name.

### 4. Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_DM_UIDS=your-uid-here

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
```

`NEXT_PUBLIC_DM_UIDS` is comma-separated; usually just your single UID.

### 5. Deploy Firestore security rules

Replace `__REPLACE_WITH_DM_UID__` in [`firestore.rules`](firestore.rules) with your DM UID, then:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### 6. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/dm/login` to enter the DM view.

## Deploy (Netlify)

1. Push the repo to GitHub.
2. In Netlify: **Add new site → Import from Git** → pick the repo.
3. **Site settings → Environment variables** — add all the `NEXT_PUBLIC_*` keys from `.env.local`.
4. Deploy.

Netlify uses [`@netlify/plugin-nextjs`](https://github.com/netlify/next-runtime) automatically thanks to [`netlify.toml`](netlify.toml).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest (currently covers the DM allowlist parser) |

## Routes

Public (`/`): home, party, locations, npcs, sessions, map.
DM (`/dm` — gated by Firebase Auth + UID allowlist): everything above plus plots and edit/create/delete affordances.

## Data model

Seven Firestore collections: `locations`, `npcs`, `pcs`, `sessions`, `events`, `plots`, `maps`. Plots are the only collection blocked from public reads (enforced in `firestore.rules`).

See [`docs/superpowers/specs/`](docs/superpowers/specs) for the original design doc and [`docs/superpowers/plans/`](docs/superpowers/plans) for the implementation plan.
