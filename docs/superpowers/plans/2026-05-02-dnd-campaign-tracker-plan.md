# D&D Campaign Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js + Firebase app that tracks D&D campaign locations, NPCs, sessions, events, plots, and maps, with a public player view and a DM-only edit view.

**Architecture:** Single Next.js 15 (App Router) app deployed to Netlify. All data access happens client-side via the Firebase JS SDK (Firestore + Auth + Storage). SWR caches reads with revalidate-on-focus. Firestore security rules enforce DM-only writes and DM-only access to plots. No server actions, no API routes.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Firebase JS SDK (v11+), SWR, react-markdown, @uiw/react-md-editor, Vitest, @testing-library/react, @firebase/rules-unit-testing.

**Spec:** [docs/superpowers/specs/2026-05-02-dnd-campaign-tracker-design.md](../specs/2026-05-02-dnd-campaign-tracker-design.md)

---

## File Structure

```
app/
  layout.tsx                       # root layout, sidebar
  page.tsx                         # public home
  globals.css
  locations/page.tsx               # public list
  locations/[id]/page.tsx          # public detail
  npcs/page.tsx
  npcs/[id]/page.tsx
  sessions/page.tsx
  sessions/[id]/page.tsx
  map/page.tsx
  dm/
    layout.tsx                     # auth gate
    page.tsx                       # DM home
    login/page.tsx
    locations/page.tsx
    locations/new/page.tsx
    locations/[id]/page.tsx
    locations/[id]/edit/page.tsx
    npcs/...                       # same shape
    sessions/...
    events/new/page.tsx
    events/[id]/edit/page.tsx
    plots/page.tsx
    plots/new/page.tsx
    plots/[id]/page.tsx
    plots/[id]/edit/page.tsx
    map/page.tsx                   # upload + history
components/
  ui/                              # shadcn primitives
  layout/Sidebar.tsx
  layout/MobileNav.tsx
  layout/DMHeader.tsx
  shared/Markdown.tsx
  shared/MarkdownEditor.tsx
  shared/ImageUpload.tsx
  shared/ConfirmDialog.tsx
  shared/EntityGrid.tsx
  locations/LocationCard.tsx
  locations/LocationForm.tsx
  npcs/NpcCard.tsx
  npcs/NpcForm.tsx
  npcs/NpcFilters.tsx
  sessions/SessionCard.tsx
  sessions/SessionForm.tsx
  events/EventTimeline.tsx
  events/EventForm.tsx
  plots/PlotCard.tsx
  plots/PlotForm.tsx
  map/MapDisplay.tsx
  map/MapUpload.tsx
lib/
  firebase.ts                      # SDK init
  types.ts                         # all entity types
  auth/AuthProvider.tsx
  auth/useAuth.ts
  auth/allowlist.ts
  firestore/converters.ts
  firestore/locations.ts
  firestore/npcs.ts
  firestore/sessions.ts
  firestore/events.ts
  firestore/plots.ts
  firestore/maps.ts
  hooks/useLocations.ts
  hooks/useLocation.ts
  hooks/useNpcs.ts
  hooks/useNpc.ts
  hooks/useSessions.ts
  hooks/useSession.ts
  hooks/useEvents.ts
  hooks/usePlots.ts
  hooks/usePlot.ts
  hooks/useCurrentMap.ts
  hooks/useMapVersions.ts
  storage/upload.ts
tests/
  setup.ts
  lib/auth/allowlist.test.ts
  lib/firestore/locations.test.ts
  lib/firestore/maps.test.ts
  lib/firestore/rules.test.ts
firestore.rules
storage.rules
netlify.toml
.env.local.example
next.config.ts
vitest.config.ts
tailwind.config.ts
tsconfig.json
package.json
```

---

## Task 1: Project Foundation

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`, `.env.local.example`

- [ ] **Step 1: Scaffold Next.js**

```bash
cd /Users/petargrgic/Documents/dnd/dnd-app
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*" --eslint --no-turbopack --use-npm
```
When prompted to overwrite or merge with existing files (`docs/`, `.git/`), pick the option that keeps existing files.

- [ ] **Step 2: Install runtime deps**

```bash
npm install firebase swr react-markdown remark-gfm @uiw/react-md-editor
```

- [ ] **Step 3: Install dev deps**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react @firebase/rules-unit-testing
```

- [ ] **Step 4: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```
Answers: Style=Default, Base color=Slate, CSS variables=Yes.

- [ ] **Step 5: Add the shadcn components used throughout**

```bash
npx shadcn@latest add button input textarea label card dialog dropdown-menu select badge separator skeleton sonner
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```
Expected: Next.js boots on `http://localhost:3000`. Stop with Ctrl-C.

- [ ] **Step 7: Add `.env.local.example`**

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_DM_UIDS=
```

- [ ] **Step 8: Configure Vitest**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
```

Create `tests/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 9: Verify**

```bash
npm run lint && npm run build && npm test
```
Expected: lint passes, build succeeds (placeholder home page), test runs with 0 tests found.

---

## Task 2: Firebase Config & Types

**Files:**
- Create: `lib/firebase.ts`, `lib/types.ts`, `firestore.rules`, `storage.rules`

- [ ] **Step 1: Define entity types**

Create `lib/types.ts`:
```ts
import { Timestamp } from 'firebase/firestore';

export type EntityId = string;

export interface Location {
  id: EntityId;
  name: string;
  description: string;
  imageUrl: string | null;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NpcStatus = 'alive' | 'dead' | 'missing' | 'unknown';

export interface Npc {
  id: EntityId;
  name: string;
  description: string;
  portraitUrl: string | null;
  status: NpcStatus;
  faction: string;
  locationId: EntityId | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Session {
  id: EntityId;
  number: number;
  date: string;        // ISO yyyy-mm-dd
  title: string | null;
  recap: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CampaignEvent {
  id: EntityId;
  title: string;
  description: string;
  locationId: EntityId | null;
  sessionId: EntityId | null;
  occurredAt: string;  // ISO yyyy-mm-dd
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PlotStatus = 'active' | 'resolved' | 'dormant';

export interface Plot {
  id: EntityId;
  title: string;
  description: string;
  status: PlotStatus;
  npcIds: EntityId[];
  locationIds: EntityId[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MapVersion {
  id: EntityId;
  imageUrl: string;
  caption: string | null;
  isCurrent: boolean;
  uploadedAt: Timestamp;
}

export type WriteInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
```

- [ ] **Step 2: Initialize Firebase SDK**

Create `lib/firebase.ts`:
```ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

export const firebaseApp = getApps()[0] ?? initializeApp(config);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
```

- [ ] **Step 3: Write Firestore security rules**

Create `firestore.rules`:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function dmUids() {
      return ['__REPLACE_WITH_DM_UID__'];
    }
    function isDM() {
      return request.auth != null && request.auth.uid in dmUids();
    }

    match /plots/{doc} {
      allow read, write: if isDM();
    }

    match /{collection}/{doc} {
      allow read: if collection in ['locations','npcs','sessions','events','maps'];
      allow write: if isDM() && collection in ['locations','npcs','sessions','events','maps'];
    }
  }
}
```

- [ ] **Step 4: Write Storage rules**

Create `storage.rules`:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isDM() {
      return request.auth != null
        && request.auth.uid in ['__REPLACE_WITH_DM_UID__'];
    }
    match /{allPaths=**} {
      allow read: if true;
      allow write: if isDM();
    }
  }
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```
Expected: PASS.

- [ ] **Step 6: Manual setup checklist (commit-blocking, do once)**

After this task, before deploying:
1. Create Firebase project at console.firebase.google.com
2. Enable Authentication → Google provider
3. Enable Firestore (production mode)
4. Enable Storage
5. Copy config values into `.env.local`
6. Sign in once with the DM Google account, copy the resulting UID from console, paste into `firestore.rules`, `storage.rules`, and `NEXT_PUBLIC_DM_UIDS`
7. Deploy rules: `firebase deploy --only firestore:rules,storage:rules`

(This is documentation, not a code step. Add a `README.md` note linking to it.)

---

## Task 3: Auth — Allowlist & Provider

**Files:**
- Create: `lib/auth/allowlist.ts`, `lib/auth/AuthProvider.tsx`, `lib/auth/useAuth.ts`, `tests/lib/auth/allowlist.test.ts`

- [ ] **Step 1: Write the allowlist test**

Create `tests/lib/auth/allowlist.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { isAllowedDmUid, parseAllowlist } from '@/lib/auth/allowlist';

describe('parseAllowlist', () => {
  it('returns [] for undefined', () => {
    expect(parseAllowlist(undefined)).toEqual([]);
  });
  it('splits comma-separated, trims whitespace, filters empties', () => {
    expect(parseAllowlist('abc, def , ,ghi')).toEqual(['abc', 'def', 'ghi']);
  });
});

describe('isAllowedDmUid', () => {
  it('returns false for null uid', () => {
    expect(isAllowedDmUid(null, ['abc'])).toBe(false);
  });
  it('returns false when uid not in list', () => {
    expect(isAllowedDmUid('zzz', ['abc', 'def'])).toBe(false);
  });
  it('returns true when uid in list', () => {
    expect(isAllowedDmUid('abc', ['abc', 'def'])).toBe(true);
  });
  it('returns false when allowlist empty', () => {
    expect(isAllowedDmUid('abc', [])).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, verify FAIL**

```bash
npm test
```
Expected: cannot resolve `@/lib/auth/allowlist`.

- [ ] **Step 3: Implement allowlist**

Create `lib/auth/allowlist.ts`:
```ts
export function parseAllowlist(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

export function isAllowedDmUid(uid: string | null, allowlist: string[]): boolean {
  if (!uid) return false;
  return allowlist.includes(uid);
}

export function getDmAllowlist(): string[] {
  return parseAllowlist(process.env.NEXT_PUBLIC_DM_UIDS);
}
```

- [ ] **Step 4: Run test, verify PASS**

```bash
npm test
```
Expected: 4 tests pass.

- [ ] **Step 5: Build AuthProvider**

Create `lib/auth/AuthProvider.tsx`:
```tsx
'use client';
import { createContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getDmAllowlist, isAllowedDmUid } from './allowlist';

interface AuthState {
  user: User | null;
  loading: boolean;
  isDM: boolean;
}

export const AuthContext = createContext<AuthState>({
  user: null, loading: true, isDM: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const isDM = isAllowedDmUid(user?.uid ?? null, getDmAllowlist());
  return (
    <AuthContext.Provider value={{ user, loading, isDM }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Create `lib/auth/useAuth.ts`:
```ts
'use client';
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';
export function useAuth() { return useContext(AuthContext); }
```

- [ ] **Step 6: Wrap root layout**

Edit `app/layout.tsx` to wrap children in `<AuthProvider>`. Mark layout `'use client'` if needed, or extract a client wrapper component.

- [ ] **Step 7: Verify build**

```bash
npm run lint && npm run build
```
Expected: PASS.

---

## Task 4: Auth — Login Page & DM Gate

**Files:**
- Create: `app/dm/login/page.tsx`, `app/dm/layout.tsx`, `components/layout/DMHeader.tsx`, `components/auth/AuthGate.tsx`

- [ ] **Step 1: Build login page**

Create `app/dm/login/page.tsx`:
```tsx
'use client';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loading, isDM } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isDM) router.replace('/dm');
  }, [loading, isDM, router]);

  if (loading) return <div className="p-8">Loading…</div>;

  return (
    <div className="max-w-sm mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-semibold">DM sign-in</h1>
      {user && !isDM && (
        <div className="rounded border p-3 text-sm">
          Signed in as {user.email}, but this account is not authorized.
          <Button variant="link" onClick={() => signOut(auth)}>Sign out</Button>
        </div>
      )}
      {!user && (
        <Button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>
          Sign in with Google
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build AuthGate component**

Create `components/auth/AuthGate.tsx`:
```tsx
'use client';
import { useAuth } from '@/lib/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

export function AuthGate({ children }: { children: ReactNode }) {
  const { loading, isDM } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isDM) router.replace('/dm/login');
  }, [loading, isDM, router]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (!isDM) return null;
  return <>{children}</>;
}
```

- [ ] **Step 3: Build DM layout**

Create `app/dm/layout.tsx`:
```tsx
import { AuthGate } from '@/components/auth/AuthGate';
import { DMHeader } from '@/components/layout/DMHeader';

export default function DMLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <DMHeader />
      {children}
    </AuthGate>
  );
}
```

Note: `/dm/login` is at `app/dm/login/page.tsx` — it lives inside the `/dm` segment so it gets the `DMLayout` wrapping it. Move the login page to `app/dm-login/page.tsx` or build the login page outside the gate; restructure: change `app/dm/login/page.tsx` to `app/(auth)/dm-login/page.tsx` using a route group, OR keep the login at `/dm/login` and adjust the layout to skip the gate when `pathname === '/dm/login'`.

Decision: keep `/dm/login` and split layout. Move `AuthGate` wrapping out of `app/dm/layout.tsx` and into a sub-layout.

Restructure:
- `app/dm/layout.tsx` — only renders children (no gate, no header).
- `app/dm/(authed)/layout.tsx` — renders `<AuthGate><DMHeader>{children}</DMHeader></AuthGate>`.
- All authed DM routes (locations, npcs, etc.) live under `app/dm/(authed)/...`.
- Login route stays at `app/dm/login/page.tsx`.

- [ ] **Step 4: DM header component**

Create `components/layout/DMHeader.tsx`:
```tsx
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function DMHeader() {
  return (
    <div className="flex items-center justify-between border-b bg-amber-50 px-4 py-2 text-sm">
      <span className="font-medium">DM Mode</span>
      <div className="flex items-center gap-3">
        <Link href="/" className="underline">View as player</Link>
        <Button size="sm" variant="ghost" onClick={() => signOut(auth)}>Sign out</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Stub /dm authed home**

Create `app/dm/(authed)/page.tsx`:
```tsx
export default function DMHome() {
  return <div className="p-8"><h1 className="text-2xl">DM Home</h1></div>;
}
```

- [ ] **Step 6: Manual verify**

```bash
npm run dev
```
- Visit `/dm` (without env DM_UID set) → redirects to `/dm/login`.
- Click sign-in → unauthorized message (because UID not in allowlist yet).
- After Task 2's manual setup, the same UID flow lands you on `/dm` home.

---

## Task 5: Firestore Converters & Generic CRUD Pattern (Locations First)

**Files:**
- Create: `lib/firestore/converters.ts`, `lib/firestore/locations.ts`, `lib/hooks/useLocations.ts`, `lib/hooks/useLocation.ts`, `tests/lib/firestore/locations.test.ts`

- [ ] **Step 1: Write CRUD test using rules-unit-testing emulator**

Create `tests/lib/firestore/locations.test.ts`:
```ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc } from 'firebase/firestore';
import {
  createLocation, updateLocation, deleteLocation, listLocations,
} from '@/lib/firestore/locations';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-test',
    firestore: { host: '127.0.0.1', port: 8080 },
  });
});
afterAll(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

describe('locations CRUD', () => {
  it('creates and lists', async () => {
    const ctx = env.unauthenticatedContext().firestore();
    const id = await createLocation(ctx, {
      name: 'The Fountain', description: 'Heals but curses.',
      imageUrl: null, order: 0,
    });
    const list = await listLocations(ctx);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('The Fountain');
    expect(list[0].id).toBe(id);
  });

  it('updates fields and bumps updatedAt', async () => {
    const ctx = env.unauthenticatedContext().firestore();
    const id = await createLocation(ctx, {
      name: 'Old', description: '', imageUrl: null, order: 0,
    });
    await updateLocation(ctx, id, { name: 'New' });
    const snap = await getDoc(doc(ctx, 'locations', id));
    expect(snap.data()?.name).toBe('New');
  });

  it('deletes', async () => {
    const ctx = env.unauthenticatedContext().firestore();
    const id = await createLocation(ctx, {
      name: 'Tmp', description: '', imageUrl: null, order: 0,
    });
    await deleteLocation(ctx, id);
    expect(await listLocations(ctx)).toEqual([]);
  });
});
```

- [ ] **Step 2: Add Firebase emulator config**

Create `firebase.json`:
```json
{
  "firestore": { "rules": "firestore.rules" },
  "storage": { "rules": "storage.rules" },
  "emulators": {
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "auth": { "port": 9099 },
    "ui": { "enabled": true }
  }
}
```

Add npm scripts: `"emulator": "firebase emulators:start --only firestore,auth,storage"`, `"test:rules": "firebase emulators:exec --only firestore 'vitest run tests/lib/firestore'"`.

- [ ] **Step 3: Run test, verify FAIL**

```bash
npm install -g firebase-tools  # one-time
firebase emulators:exec --only firestore "npm test -- tests/lib/firestore/locations.test.ts"
```
Expected: imports fail (`createLocation` not defined).

- [ ] **Step 4: Implement converters**

Create `lib/firestore/converters.ts`:
```ts
import { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';
import type { Location, Npc, Session, CampaignEvent, Plot, MapVersion } from '@/lib/types';

function passthroughConverter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (data) => {
      const { id, ...rest } = data as T;
      return rest;
    },
    fromFirestore: (snap: QueryDocumentSnapshot) =>
      ({ id: snap.id, ...snap.data() }) as T,
  };
}

export const locationConverter = passthroughConverter<Location>();
export const npcConverter = passthroughConverter<Npc>();
export const sessionConverter = passthroughConverter<Session>();
export const eventConverter = passthroughConverter<CampaignEvent>();
export const plotConverter = passthroughConverter<Plot>();
export const mapConverter = passthroughConverter<MapVersion>();
```

- [ ] **Step 5: Implement locations CRUD**

Create `lib/firestore/locations.ts`:
```ts
import {
  Firestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { locationConverter } from './converters';
import type { Location, WriteInput } from '@/lib/types';

const col = (db: Firestore) => collection(db, 'locations').withConverter(locationConverter);

export async function listLocations(db: Firestore): Promise<Location[]> {
  const snap = await getDocs(query(col(db), orderBy('order', 'asc')));
  return snap.docs.map(d => d.data());
}

export async function getLocation(db: Firestore, id: string): Promise<Location | null> {
  const snap = await getDoc(doc(db, 'locations', id).withConverter(locationConverter));
  return snap.exists() ? snap.data() : null;
}

export async function createLocation(db: Firestore, input: WriteInput<Location>): Promise<string> {
  const ref = await addDoc(collection(db, 'locations'), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateLocation(
  db: Firestore, id: string, patch: Partial<WriteInput<Location>>
): Promise<void> {
  await updateDoc(doc(db, 'locations', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteLocation(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, 'locations', id));
}
```

- [ ] **Step 6: Run test, verify PASS**

```bash
firebase emulators:exec --only firestore "npm test -- tests/lib/firestore/locations.test.ts"
```
Expected: 3 tests pass.

- [ ] **Step 7: Build SWR hooks**

Create `lib/hooks/useLocations.ts`:
```ts
'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { listLocations } from '@/lib/firestore/locations';

export function useLocations() {
  return useSWR(['locations'], () => listLocations(db), {
    revalidateOnFocus: true,
  });
}
```

Create `lib/hooks/useLocation.ts`:
```ts
'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { getLocation } from '@/lib/firestore/locations';

export function useLocation(id: string) {
  return useSWR(['location', id], () => getLocation(db, id), {
    revalidateOnFocus: true,
  });
}
```

- [ ] **Step 8: Verify build**

```bash
npm run build
```
Expected: PASS.

---

## Task 6: Apply CRUD Pattern — NPCs, Sessions, Events, Plots, Maps

**Files:** `lib/firestore/{npcs,sessions,events,plots,maps}.ts`, `lib/hooks/{useNpcs,useNpc,useSessions,useSession,useEvents,usePlots,usePlot,useCurrentMap,useMapVersions}.ts`

For each entity, follow the same pattern as Task 5 (skip dedicated tests; one passing test for the pattern is enough — these are mechanical copies).

- [ ] **Step 1: NPCs**

Create `lib/firestore/npcs.ts` mirroring locations.ts but using `npcConverter`, ordering `query(col, orderBy('name', 'asc'))`. Include `getNpcsByLocation(db, locationId)`:
```ts
export async function listNpcsByLocation(db: Firestore, locationId: string): Promise<Npc[]> {
  const q = query(col(db), where('locationId', '==', locationId), orderBy('name'));
  return (await getDocs(q)).docs.map(d => d.data());
}
```

Create hooks `lib/hooks/useNpcs.ts`, `lib/hooks/useNpc.ts`, `lib/hooks/useNpcsByLocation.ts`.

- [ ] **Step 2: Sessions**

`lib/firestore/sessions.ts`: list ordered by `number` desc; get/create/update/delete same shape. Hooks `useSessions`, `useSession`.

- [ ] **Step 3: Events**

`lib/firestore/events.ts`: include `listEventsByLocation(db, locationId)` and `listEventsBySession(db, sessionId)`, both ordered `occurredAt desc`. Hooks `useEvents` (all), `useEventsByLocation(id)`, `useEventsBySession(id)`.

- [ ] **Step 4: Plots**

`lib/firestore/plots.ts`: list ordered `status asc, updatedAt desc`. Hooks `usePlots`, `usePlot`.

- [ ] **Step 5: Maps with batch isCurrent flip**

Create `lib/firestore/maps.ts`. The upload helper performs a batch:
```ts
import {
  Firestore, collection, doc, getDocs, query, where,
  serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { mapConverter } from './converters';
import type { MapVersion } from '@/lib/types';

const col = (db: Firestore) => collection(db, 'maps').withConverter(mapConverter);

export async function listMaps(db: Firestore): Promise<MapVersion[]> {
  const { query: q, orderBy } = await import('firebase/firestore');
  const snap = await getDocs(q(col(db), orderBy('uploadedAt', 'desc')));
  return snap.docs.map(d => d.data());
}

export async function getCurrentMap(db: Firestore): Promise<MapVersion | null> {
  const { query: q, where, limit } = await import('firebase/firestore');
  const snap = await getDocs(q(col(db), where('isCurrent', '==', true), limit(1)));
  return snap.empty ? null : snap.docs[0].data();
}

export async function publishMap(
  db: Firestore, imageUrl: string, caption: string | null
): Promise<string> {
  const batch = writeBatch(db);
  const prevSnap = await getDocs(query(collection(db, 'maps'), where('isCurrent', '==', true)));
  prevSnap.forEach(d => batch.update(d.ref, { isCurrent: false }));
  const newRef = doc(collection(db, 'maps'));
  batch.set(newRef, {
    imageUrl, caption, isCurrent: true, uploadedAt: serverTimestamp(),
  });
  await batch.commit();
  return newRef.id;
}
```

Hooks `useCurrentMap`, `useMapVersions`.

- [ ] **Step 6: Maps batch test**

Create `tests/lib/firestore/maps.test.ts`:
```ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { publishMap, getCurrentMap, listMaps } from '@/lib/firestore/maps';

let env: RulesTestEnvironment;
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-test',
    firestore: { host: '127.0.0.1', port: 8080 },
  });
});
afterAll(async () => env.cleanup());
beforeEach(async () => env.clearFirestore());

describe('maps', () => {
  it('publishes new map and demotes previous current', async () => {
    const db = env.unauthenticatedContext().firestore();
    await publishMap(db, 'https://a/1.png', 'v1');
    await publishMap(db, 'https://a/2.png', 'v2');
    const current = await getCurrentMap(db);
    expect(current?.imageUrl).toBe('https://a/2.png');
    const all = await listMaps(db);
    expect(all).toHaveLength(2);
    expect(all.filter(m => m.isCurrent)).toHaveLength(1);
  });
});
```

- [ ] **Step 7: Run all firestore tests**

```bash
firebase emulators:exec --only firestore "npm test -- tests/lib/firestore"
```
Expected: all tests pass.

- [ ] **Step 8: Build**

```bash
npm run build
```
Expected: PASS.

---

## Task 7: Storage Upload Helper

**Files:** `lib/storage/upload.ts`, `components/shared/ImageUpload.tsx`

- [ ] **Step 1: Upload helper**

Create `lib/storage/upload.ts`:
```ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function uploadImage(folder: string, fileName: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const r = ref(storage, `${folder}/${fileName}.${ext}`);
  await uploadBytes(r, file, { contentType: file.type });
  return await getDownloadURL(r);
}
```

- [ ] **Step 2: ImageUpload component**

Create `components/shared/ImageUpload.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/storage/upload';
import Image from 'next/image';

interface Props {
  folder: string;
  fileName: string;
  initialUrl: string | null;
  onUploaded: (url: string) => void;
}

export function ImageUpload({ folder, fileName, initialUrl, onUploaded }: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const newUrl = await uploadImage(folder, fileName, file);
      setUrl(newUrl);
      onUploaded(newUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {url && <Image src={url} alt="" width={240} height={240} className="rounded border" />}
      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
```

- [ ] **Step 3: Configure next.config remote images**

Edit `next.config.ts`:
```ts
import type { NextConfig } from 'next';
const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
};
export default config;
```

- [ ] **Step 4: Build**

```bash
npm run build
```
Expected: PASS.

---

## Task 8: Shared UI — Markdown, Editor, Layout, Confirm

**Files:** `components/shared/Markdown.tsx`, `components/shared/MarkdownEditor.tsx`, `components/shared/ConfirmDialog.tsx`, `components/shared/EntityGrid.tsx`, `components/layout/Sidebar.tsx`, `components/layout/MobileNav.tsx`

- [ ] **Step 1: Markdown renderer**

Create `components/shared/Markdown.tsx`:
```tsx
'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
```

Add `@tailwindcss/typography`: `npm install -D @tailwindcss/typography`. Add to `tailwind.config.ts` plugins.

- [ ] **Step 2: Markdown editor (dynamic import to avoid SSR)**

Create `components/shared/MarkdownEditor.tsx`:
```tsx
'use client';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface Props {
  value: string;
  onChange: (v: string) => void;
  height?: number;
}

export function MarkdownEditor({ value, onChange, height = 320 }: Props) {
  return (
    <div data-color-mode="light">
      <MDEditor value={value} onChange={(v) => onChange(v ?? '')} height={height} preview="edit" />
    </div>
  );
}
```

- [ ] **Step 3: Confirm dialog**

Create `components/shared/ConfirmDialog.tsx` — a thin wrapper over shadcn `Dialog` with title, description, confirm/cancel callbacks.

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmText = 'Confirm', destructive, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant={destructive ? 'destructive' : 'default'} onClick={() => { onConfirm(); onOpenChange(false); }}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Sidebar**

Create `components/layout/Sidebar.tsx`:
```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';

const playerLinks = [
  { href: '/', label: 'Home' },
  { href: '/locations', label: 'Locations' },
  { href: '/npcs', label: 'NPCs' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/map', label: 'Map' },
];

const dmLinks = [
  { href: '/dm', label: 'Home' },
  { href: '/dm/locations', label: 'Locations' },
  { href: '/dm/npcs', label: 'NPCs' },
  { href: '/dm/sessions', label: 'Sessions' },
  { href: '/dm/plots', label: 'Plots' },
  { href: '/dm/map', label: 'Map' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isDM } = useAuth();
  const inDmArea = pathname.startsWith('/dm');
  const links = inDmArea ? dmLinks : playerLinks;

  return (
    <aside className="hidden md:flex md:w-56 md:flex-col border-r p-4 gap-1">
      <div className="text-xs uppercase text-slate-500 mb-2">
        {inDmArea ? 'DM' : 'Campaign'}
      </div>
      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          className={`px-3 py-2 rounded text-sm ${pathname === l.href ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
        >
          {l.label}
        </Link>
      ))}
      {!inDmArea && isDM && (
        <Link href="/dm" className="mt-auto text-xs text-amber-700 underline">Switch to DM Mode</Link>
      )}
    </aside>
  );
}
```

- [ ] **Step 5: Mobile nav**

Create `components/layout/MobileNav.tsx` — same items as sidebar, fixed bottom bar, shown when `< md`.

- [ ] **Step 6: Update root layout**

Edit `app/layout.tsx`:
```tsx
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen flex flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <MobileNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Verify**

```bash
npm run dev
```
Visit `/`, `/locations`, etc. — sidebar shows, navigation works, pages 404 (expected, not built yet).

---

## Task 9: Locations — Public List & Detail

**Files:** `app/locations/page.tsx`, `app/locations/[id]/page.tsx`, `components/locations/LocationCard.tsx`

- [ ] **Step 1: LocationCard**

Create `components/locations/LocationCard.tsx`:
```tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Location } from '@/lib/types';

export function LocationCard({ location, basePath = '/locations' }: { location: Location; basePath?: string }) {
  return (
    <Link href={`${basePath}/${location.id}`} className="block border rounded overflow-hidden hover:shadow">
      {location.imageUrl && (
        <Image src={location.imageUrl} alt={location.name} width={400} height={200} className="w-full h-40 object-cover" />
      )}
      <div className="p-3">
        <h3 className="font-medium">{location.name}</h3>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Public locations list**

Create `app/locations/page.tsx`:
```tsx
'use client';
import { useLocations } from '@/lib/hooks/useLocations';
import { LocationCard } from '@/components/locations/LocationCard';

export default function LocationsPage() {
  const { data, isLoading } = useLocations();
  if (isLoading) return <div className="p-6">Loading…</div>;
  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Locations</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map(l => <LocationCard key={l.id} location={l} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Public location detail**

Create `app/locations/[id]/page.tsx`:
```tsx
'use client';
import { use } from 'react';
import { useLocation } from '@/lib/hooks/useLocation';
import { useNpcsByLocation } from '@/lib/hooks/useNpcsByLocation';
import { useEventsByLocation } from '@/lib/hooks/useEventsByLocation';
import { Markdown } from '@/components/shared/Markdown';
import { NpcCard } from '@/components/npcs/NpcCard';
import { EventTimeline } from '@/components/events/EventTimeline';
import Image from 'next/image';

export default function LocationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: location } = useLocation(id);
  const { data: npcs } = useNpcsByLocation(id);
  const { data: events } = useEventsByLocation(id);

  if (!location) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">{location.name}</h1>
        {location.imageUrl && (
          <Image src={location.imageUrl} alt="" width={800} height={400} className="w-full h-64 object-cover rounded mt-4" />
        )}
      </header>
      <Markdown>{location.description}</Markdown>
      {npcs && npcs.length > 0 && (
        <section>
          <h2 className="text-xl mb-3">NPCs here</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {npcs.map(n => <NpcCard key={n.id} npc={n} />)}
          </div>
        </section>
      )}
      {events && events.length > 0 && (
        <section>
          <h2 className="text-xl mb-3">What happened here</h2>
          <EventTimeline events={events} />
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
npm run dev
```
Visit `/locations` and `/locations/<some-id>`. With empty Firestore, list is empty; detail shows "Loading…". After Task 10 you can create one and revisit.

---

## Task 10: Locations — DM CRUD Pages

**Files:** `app/dm/(authed)/locations/page.tsx`, `app/dm/(authed)/locations/new/page.tsx`, `app/dm/(authed)/locations/[id]/page.tsx`, `app/dm/(authed)/locations/[id]/edit/page.tsx`, `components/locations/LocationForm.tsx`

- [ ] **Step 1: LocationForm component**

Create `components/locations/LocationForm.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@/components/shared/MarkdownEditor';
import { ImageUpload } from '@/components/shared/ImageUpload';
import type { Location, WriteInput } from '@/lib/types';

interface Props {
  initial?: Location;
  onSubmit: (input: WriteInput<Location>) => Promise<void>;
  onCancel: () => void;
}

export function LocationForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({ name, description, imageUrl, order });
    } finally {
      setBusy(false);
    }
  }

  const fileName = initial?.id ?? `temp-${Date.now()}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Order</Label>
        <Input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} />
      </div>
      <div>
        <Label>Image</Label>
        <ImageUpload folder="location-images" fileName={fileName} initialUrl={imageUrl} onUploaded={setImageUrl} />
      </div>
      <div>
        <Label>Description (markdown)</Label>
        <MarkdownEditor value={description} onChange={setDescription} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: DM list page (with + New)**

Create `app/dm/(authed)/locations/page.tsx` — same as public list but each card links to `/dm/locations/<id>` and a "+ New Location" button links to `/dm/locations/new`.

```tsx
'use client';
import Link from 'next/link';
import { useLocations } from '@/lib/hooks/useLocations';
import { LocationCard } from '@/components/locations/LocationCard';
import { Button } from '@/components/ui/button';

export default function DMLocationsPage() {
  const { data, isLoading } = useLocations();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl">Locations</h1>
        <Button asChild><Link href="/dm/locations/new">+ New Location</Link></Button>
      </div>
      {isLoading ? <div>Loading…</div> : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map(l => <LocationCard key={l.id} location={l} basePath="/dm/locations" />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: New location page**

Create `app/dm/(authed)/locations/new/page.tsx`:
```tsx
'use client';
import { useRouter } from 'next/navigation';
import { LocationForm } from '@/components/locations/LocationForm';
import { createLocation } from '@/lib/firestore/locations';
import { db } from '@/lib/firebase';
import { mutate } from 'swr';

export default function NewLocation() {
  const router = useRouter();
  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">New Location</h1>
      <LocationForm
        onSubmit={async (input) => {
          const id = await createLocation(db, input);
          await mutate(['locations']);
          router.push(`/dm/locations/${id}`);
        }}
        onCancel={() => router.push('/dm/locations')}
      />
    </div>
  );
}
```

- [ ] **Step 4: DM detail page (with Edit/Delete)**

Create `app/dm/(authed)/locations/[id]/page.tsx`:
```tsx
'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/lib/hooks/useLocation';
import { Markdown } from '@/components/shared/Markdown';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { deleteLocation } from '@/lib/firestore/locations';
import { db } from '@/lib/firebase';
import { mutate } from 'swr';

export default function DMLocationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: location } = useLocation(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  if (!location) return <div className="p-6">Loading…</div>;

  async function onDelete() {
    await deleteLocation(db, id);
    await mutate(['locations']);
    router.push('/dm/locations');
  }

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">{location.name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dm/locations/${id}/edit`}>Edit</Link>
          </Button>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>Delete</Button>
        </div>
      </div>
      <Markdown>{location.description}</Markdown>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete location?"
        description="This cannot be undone. NPCs and events tied here will be unlinked but not deleted."
        destructive
        confirmText="Delete"
        onConfirm={onDelete}
      />
    </div>
  );
}
```

- [ ] **Step 5: Edit page**

Create `app/dm/(authed)/locations/[id]/edit/page.tsx`:
```tsx
'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/lib/hooks/useLocation';
import { LocationForm } from '@/components/locations/LocationForm';
import { updateLocation } from '@/lib/firestore/locations';
import { db } from '@/lib/firebase';
import { mutate } from 'swr';

export default function EditLocation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: location } = useLocation(id);
  const router = useRouter();
  if (!location) return <div className="p-6">Loading…</div>;
  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Edit Location</h1>
      <LocationForm
        initial={location}
        onSubmit={async (input) => {
          await updateLocation(db, id, input);
          await mutate(['location', id]);
          await mutate(['locations']);
          router.push(`/dm/locations/${id}`);
        }}
        onCancel={() => router.push(`/dm/locations/${id}`)}
      />
    </div>
  );
}
```

- [ ] **Step 6: Verify end-to-end**

```bash
npm run dev
```
Sign in as DM. Create a location, edit it, delete it. Verify the public `/locations` view reflects each change after refresh.

---

## Task 11: NPCs — Public, DM CRUD, Filters

**Files:** `app/npcs/page.tsx`, `app/npcs/[id]/page.tsx`, `components/npcs/{NpcCard,NpcForm,NpcFilters}.tsx`, `app/dm/(authed)/npcs/...` (list/new/[id]/edit, mirror Task 10).

- [ ] **Step 1: NpcCard**

Create `components/npcs/NpcCard.tsx`:
```tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Npc } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const statusColor: Record<Npc['status'], string> = {
  alive: 'bg-emerald-100 text-emerald-800',
  dead: 'bg-slate-200 text-slate-700',
  missing: 'bg-amber-100 text-amber-800',
  unknown: 'bg-blue-100 text-blue-800',
};

export function NpcCard({ npc, basePath = '/npcs' }: { npc: Npc; basePath?: string }) {
  return (
    <Link href={`${basePath}/${npc.id}`} className="flex gap-3 border rounded p-3 hover:shadow">
      {npc.portraitUrl ? (
        <Image src={npc.portraitUrl} alt="" width={64} height={64} className="rounded object-cover" />
      ) : (
        <div className="w-16 h-16 rounded bg-slate-200" />
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{npc.name}</h3>
          <Badge className={statusColor[npc.status]}>{npc.status}</Badge>
        </div>
        {npc.faction && <div className="text-xs text-slate-500">{npc.faction}</div>}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: NpcFilters**

Create `components/npcs/NpcFilters.tsx`:
```tsx
'use client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Npc, NpcStatus } from '@/lib/types';

interface Props {
  npcs: Npc[];
  query: string;
  setQuery: (q: string) => void;
  status: NpcStatus | 'all';
  setStatus: (s: NpcStatus | 'all') => void;
  faction: string | 'all';
  setFaction: (f: string | 'all') => void;
}

const statuses: (NpcStatus | 'all')[] = ['all', 'alive', 'dead', 'missing', 'unknown'];

export function NpcFilters({ npcs, query, setQuery, status, setStatus, faction, setFaction }: Props) {
  const factions = Array.from(new Set(npcs.map(n => n.faction).filter(Boolean))).sort();
  return (
    <div className="space-y-3 mb-4">
      <Input placeholder="Search by name…" value={query} onChange={e => setQuery(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        {statuses.map(s => (
          <Badge key={s} onClick={() => setStatus(s)} className={`cursor-pointer ${status === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {s}
          </Badge>
        ))}
      </div>
      {factions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge onClick={() => setFaction('all')} className={`cursor-pointer ${faction === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>all factions</Badge>
          {factions.map(f => (
            <Badge key={f} onClick={() => setFaction(f)} className={`cursor-pointer ${faction === f ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>{f}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Public NPC list with filters**

Create `app/npcs/page.tsx`:
```tsx
'use client';
import { useState, useMemo } from 'react';
import { useNpcs } from '@/lib/hooks/useNpcs';
import { NpcCard } from '@/components/npcs/NpcCard';
import { NpcFilters } from '@/components/npcs/NpcFilters';
import type { NpcStatus } from '@/lib/types';

export default function NpcsPage() {
  const { data: npcs = [] } = useNpcs();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<NpcStatus | 'all'>('all');
  const [faction, setFaction] = useState<string | 'all'>('all');

  const filtered = useMemo(() => npcs.filter(n =>
    (status === 'all' || n.status === status) &&
    (faction === 'all' || n.faction === faction) &&
    (query === '' || n.name.toLowerCase().includes(query.toLowerCase()))
  ), [npcs, query, status, faction]);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">NPCs</h1>
      <NpcFilters npcs={npcs} {...{query, setQuery, status, setStatus, faction, setFaction}} />
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(n => <NpcCard key={n.id} npc={n} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: NPC detail page**

Create `app/npcs/[id]/page.tsx`:
```tsx
'use client';
import { use } from 'react';
import { useNpc } from '@/lib/hooks/useNpc';
import { useLocation } from '@/lib/hooks/useLocation';
import { Markdown } from '@/components/shared/Markdown';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

export default function NpcDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: npc } = useNpc(id);
  const { data: location } = useLocation(npc?.locationId ?? '');
  if (!npc) return <div className="p-6">Loading…</div>;
  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="flex gap-4 items-start">
        {npc.portraitUrl && <Image src={npc.portraitUrl} alt="" width={120} height={120} className="rounded" />}
        <div>
          <h1 className="text-3xl">{npc.name}</h1>
          <div className="flex gap-2 mt-2">
            <Badge>{npc.status}</Badge>
            {npc.faction && <Badge variant="outline">{npc.faction}</Badge>}
          </div>
          {location && <Link href={`/locations/${location.id}`} className="text-sm underline mt-2 block">{location.name}</Link>}
        </div>
      </div>
      <Markdown>{npc.description}</Markdown>
    </div>
  );
}
```

- [ ] **Step 5: NpcForm**

Create `components/npcs/NpcForm.tsx`. Same shape as `LocationForm` but with: `name` input, `Select` for status (use shadcn `Select`), `Input` for faction, `Select` for `locationId` populated from `useLocations()`, `ImageUpload` to `npc-portraits/<id>`, `MarkdownEditor` for description.

- [ ] **Step 6: DM NPC pages**

Create `app/dm/(authed)/npcs/page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx` mirroring Task 10's structure but using `Npc` types and `lib/firestore/npcs.ts`.

- [ ] **Step 7: Verify**

```bash
npm run dev
```
Create an NPC, link to a location, verify it appears on the location detail page and is filterable by status/faction.

---

## Task 12: Sessions — Public, DM CRUD

**Files:** `app/sessions/...`, `app/dm/(authed)/sessions/...`, `components/sessions/{SessionCard,SessionForm}.tsx`

- [ ] **Step 1: SessionCard**

Create `components/sessions/SessionCard.tsx`:
```tsx
import Link from 'next/link';
import type { Session } from '@/lib/types';

export function SessionCard({ session, basePath = '/sessions' }: { session: Session; basePath?: string }) {
  return (
    <Link href={`${basePath}/${session.id}`} className="block border rounded p-4 hover:shadow">
      <div className="text-xs text-slate-500">{session.date}</div>
      <div className="font-medium">Session {session.number}{session.title ? `: ${session.title}` : ''}</div>
    </Link>
  );
}
```

- [ ] **Step 2: Public sessions list**

Create `app/sessions/page.tsx` — list ordered by `number` desc.

- [ ] **Step 3: Public session detail**

Create `app/sessions/[id]/page.tsx`:
```tsx
'use client';
import { use } from 'react';
import { useSession } from '@/lib/hooks/useSession';
import { useEventsBySession } from '@/lib/hooks/useEventsBySession';
import { Markdown } from '@/components/shared/Markdown';
import { EventTimeline } from '@/components/events/EventTimeline';

export default function SessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: s } = useSession(id);
  const { data: events } = useEventsBySession(id);
  if (!s) return <div className="p-6">Loading…</div>;
  return (
    <div className="p-6 max-w-3xl space-y-6">
      <header>
        <div className="text-sm text-slate-500">{s.date}</div>
        <h1 className="text-3xl">Session {s.number}{s.title ? `: ${s.title}` : ''}</h1>
      </header>
      <Markdown>{s.recap}</Markdown>
      {events && events.length > 0 && (
        <section>
          <h2 className="text-xl mb-3">Events</h2>
          <EventTimeline events={events} />
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 4: SessionForm**

Create `components/sessions/SessionForm.tsx` with: `Input` (number, type=number), `Input` (date, type=date), `Input` (title, optional), `MarkdownEditor` (recap).

- [ ] **Step 5: DM session pages**

Mirror Task 10 structure under `app/dm/(authed)/sessions/`.

- [ ] **Step 6: Verify**

Create a session, write a recap, verify on public view.

---

## Task 13: Events — DM Create From Location/Session, Timeline Display

Events are not browsed standalone — players see them on location and session detail pages. DM creates/edits them via embedded controls or dedicated forms.

**Files:** `components/events/{EventTimeline,EventForm}.tsx`, `app/dm/(authed)/events/new/page.tsx`, `app/dm/(authed)/events/[id]/edit/page.tsx`

- [ ] **Step 1: EventTimeline**

Create `components/events/EventTimeline.tsx`:
```tsx
import type { CampaignEvent } from '@/lib/types';
import { Markdown } from '@/components/shared/Markdown';

export function EventTimeline({ events }: { events: CampaignEvent[] }) {
  return (
    <ol className="space-y-4 border-l-2 border-slate-200 pl-4">
      {events.map(e => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[22px] top-2 w-3 h-3 rounded-full bg-slate-400" />
          <div className="text-xs text-slate-500">{e.occurredAt}</div>
          <div className="font-medium">{e.title}</div>
          <Markdown>{e.description}</Markdown>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: EventForm**

Create `components/events/EventForm.tsx`. Inputs: title, occurredAt (date), Select for `locationId` (from `useLocations()`, with "none"), Select for `sessionId` (from `useSessions()`, with "none"), MarkdownEditor for description.

- [ ] **Step 3: DM new event page**

Create `app/dm/(authed)/events/new/page.tsx`. Accept optional query params `?locationId=` and `?sessionId=` to pre-fill. After save, redirect back to the source page (either `/dm/locations/<id>` or `/dm/sessions/<id>`).

```tsx
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { EventForm } from '@/components/events/EventForm';
import { createEvent } from '@/lib/firestore/events';
import { db } from '@/lib/firebase';
import { mutate } from 'swr';

export default function NewEvent() {
  const router = useRouter();
  const params = useSearchParams();
  const locationId = params.get('locationId');
  const sessionId = params.get('sessionId');
  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">New Event</h1>
      <EventForm
        initial={{ locationId, sessionId }}
        onSubmit={async (input) => {
          await createEvent(db, input);
          if (locationId) await mutate(['events-by-location', locationId]);
          if (sessionId) await mutate(['events-by-session', sessionId]);
          router.back();
        }}
        onCancel={() => router.back()}
      />
    </div>
  );
}
```

- [ ] **Step 4: Add "+ Add event" buttons on DM location and session pages**

Edit `app/dm/(authed)/locations/[id]/page.tsx` to include `<Button asChild><Link href={`/dm/events/new?locationId=${id}`}>+ Add event</Link></Button>` and render `<EventTimeline>` with edit/delete affordances per event.

Same for `app/dm/(authed)/sessions/[id]/page.tsx`.

- [ ] **Step 5: Edit event page**

Create `app/dm/(authed)/events/[id]/edit/page.tsx`.

- [ ] **Step 6: Verify**

Create a location, then create an event tagged to it. Verify it shows on `/locations/<id>`. Tag the same event to a session; verify it shows on `/sessions/<id>` too.

---

## Task 14: Plots — DM-only CRUD with NPC/Location Links

**Files:** `app/dm/(authed)/plots/page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`, `components/plots/{PlotCard,PlotForm}.tsx`

- [ ] **Step 1: PlotCard**

Create `components/plots/PlotCard.tsx` showing title, status badge (active=green, resolved=slate, dormant=amber), updatedAt.

- [ ] **Step 2: PlotForm**

Create `components/plots/PlotForm.tsx`:
- Input: title
- Select: status
- MarkdownEditor: description
- Multi-select: linked NPCs (use shadcn `DropdownMenu` with checkboxes, populated from `useNpcs()`, value=`npcIds[]`)
- Multi-select: linked locations (same pattern, populated from `useLocations()`, value=`locationIds[]`)

- [ ] **Step 3: DM plots list, new, detail, edit**

Mirror Task 10. Detail page renders the linked NPC and location names with links to their respective DM detail pages.

- [ ] **Step 4: Verify**

Create a plot, link an NPC and a location, verify links work. Verify plots are NOT visible on any public route — visit `/plots` (404 expected) and check the public sidebar does not include "Plots".

---

## Task 15: Map — Display, Upload, Version History

**Files:** `app/map/page.tsx`, `app/dm/(authed)/map/page.tsx`, `components/map/{MapDisplay,MapUpload}.tsx`

- [ ] **Step 1: MapDisplay**

Create `components/map/MapDisplay.tsx`:
```tsx
import Image from 'next/image';
import type { MapVersion } from '@/lib/types';

export function MapDisplay({ map }: { map: MapVersion }) {
  return (
    <div>
      <Image src={map.imageUrl} alt={map.caption ?? 'World map'} width={1600} height={1000} className="w-full h-auto rounded border" />
      {map.caption && <div className="text-sm text-slate-500 mt-2">{map.caption}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Public map page**

Create `app/map/page.tsx`:
```tsx
'use client';
import { useCurrentMap } from '@/lib/hooks/useCurrentMap';
import { useMapVersions } from '@/lib/hooks/useMapVersions';
import { MapDisplay } from '@/components/map/MapDisplay';
import Image from 'next/image';

export default function MapPage() {
  const { data: current } = useCurrentMap();
  const { data: versions = [] } = useMapVersions();
  const past = versions.filter(v => !v.isCurrent);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl">World Map</h1>
      {current ? <MapDisplay map={current} /> : <div>No map yet.</div>}
      {past.length > 0 && (
        <section>
          <h2 className="text-lg mb-3">Past versions</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {past.map(v => (
              <div key={v.id}>
                <Image src={v.imageUrl} alt="" width={300} height={200} className="rounded border" />
                {v.caption && <div className="text-xs text-slate-500">{v.caption}</div>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 3: MapUpload**

Create `components/map/MapUpload.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadImage } from '@/lib/storage/upload';
import { publishMap } from '@/lib/firestore/maps';
import { db } from '@/lib/firebase';
import { mutate } from 'swr';

export function MapUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  async function handlePublish() {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage('maps', String(Date.now()), file);
      await publishMap(db, url, caption || null);
      await mutate(['current-map']);
      await mutate(['map-versions']);
      setFile(null);
      setCaption('');
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-3 border rounded p-4">
      <h2 className="font-medium">Publish new map</h2>
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <Input placeholder="Caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} />
      <Button onClick={handlePublish} disabled={!file || busy}>{busy ? 'Publishing…' : 'Publish'}</Button>
    </div>
  );
}
```

- [ ] **Step 4: DM map page**

Create `app/dm/(authed)/map/page.tsx`:
```tsx
'use client';
import { useCurrentMap } from '@/lib/hooks/useCurrentMap';
import { useMapVersions } from '@/lib/hooks/useMapVersions';
import { MapDisplay } from '@/components/map/MapDisplay';
import { MapUpload } from '@/components/map/MapUpload';

export default function DMMapPage() {
  const { data: current } = useCurrentMap();
  const { data: versions = [] } = useMapVersions();
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl">Map</h1>
      <MapUpload />
      {current ? (
        <section>
          <h2 className="text-lg mb-3">Current map</h2>
          <MapDisplay map={current} />
        </section>
      ) : <div>No map yet.</div>}
      {versions.length > 1 && (
        <section>
          <h2 className="text-lg mb-3">Past versions ({versions.length - 1})</h2>
          <ul className="space-y-2">
            {versions.filter(v => !v.isCurrent).map(v => (
              <li key={v.id} className="text-sm">
                <a href={v.imageUrl} target="_blank" rel="noreferrer" className="underline">
                  {v.caption || v.id}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify**

Upload an image as DM, verify it appears at `/map`. Upload a second; verify the first becomes "past" and the second is current.

---

## Task 16: Public Home Page

**Files:** `app/page.tsx`, `app/dm/(authed)/page.tsx`

- [ ] **Step 1: Public home**

Create `app/page.tsx`:
```tsx
'use client';
import Link from 'next/link';
import { useCurrentMap } from '@/lib/hooks/useCurrentMap';
import { useSessions } from '@/lib/hooks/useSessions';
import { MapDisplay } from '@/components/map/MapDisplay';
import { SessionCard } from '@/components/sessions/SessionCard';

export default function Home() {
  const { data: map } = useCurrentMap();
  const { data: sessions = [] } = useSessions();
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-3xl">Campaign</h1>
      {map && (
        <section>
          <Link href="/map"><MapDisplay map={map} /></Link>
        </section>
      )}
      <section>
        <h2 className="text-xl mb-3">Recent sessions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {sessions.slice(0, 4).map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: DM home**

Update `app/dm/(authed)/page.tsx` to mirror public home but with quick "+ New" links and a section listing active plots.

- [ ] **Step 3: Verify**

`npm run dev` → both `/` and `/dm` render with current data.

---

## Task 17: Netlify Deploy & README

**Files:** `netlify.toml`, `README.md`, `.gitignore` updates

- [ ] **Step 1: Netlify config**

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

- [ ] **Step 2: gitignore**

Ensure `.gitignore` contains:
```
node_modules
.next
.env*.local
.firebase
```

- [ ] **Step 3: README**

Create `README.md` with: project intro, prerequisites (Node 20+, Firebase project, Netlify account), env var setup steps (referencing `.env.local.example`), Firestore/Storage rule deployment commands, local dev (`npm run dev`), test commands, and the manual setup checklist from Task 2 Step 6.

- [ ] **Step 4: Connect Netlify to GitHub**

Manual:
1. Push to `github.com/petargrgic97/homebrew-world` (will be done at the end with single commit per user's instruction).
2. In Netlify dashboard: New site from Git → connect GitHub → pick the repo.
3. Add environment variables (the same `NEXT_PUBLIC_*` keys from `.env.local.example`).
4. Deploy.

- [ ] **Step 5: Smoke test deployment**

After Netlify deploy succeeds:
- Public URL loads `/`.
- `/dm/login` works, sign-in flow completes.
- DM CRUD on a location persists and reflects on the public URL.

- [ ] **Step 6: Final commit + push (user-approved)**

```bash
git add .
git commit -m "feat: initial D&D campaign tracker"
git push -u origin main
```

---

## Self-Review Notes

- **Spec coverage:** Locations ✓ (Task 5, 9, 10), NPCs ✓ (Task 6, 11), Sessions ✓ (Task 6, 12), Events ✓ (Task 6, 13), Plots ✓ (Task 6, 14, DM-only enforced by Firestore rules in Task 2), Map versioning ✓ (Task 6 batch + Task 15), Auth ✓ (Tasks 3-4), Image storage ✓ (Task 7), Markdown ✓ (Task 8), Filters/search ✓ (Task 11), No real-time ✓ (Tasks 5-6 use one-shot fetches with SWR), Mobile ✓ (Task 8 sidebar/mobile-nav).
- **Placeholders:** `__REPLACE_WITH_DM_UID__` in `firestore.rules` and `storage.rules` is intentional — filled in during Task 2 Step 6 manual setup with the actual DM UID.
- **Type consistency:** `WriteInput<T>` used uniformly in CRUD signatures; converters return typed entities; hook keys (`['locations']`, `['location', id]`, `['events-by-location', id]`, etc.) match the `mutate()` calls in Tasks 10–13.
- **Out-of-plan items:** README and Firebase project creation are documented as manual steps in Task 2 and Task 17. No CI/CD pipeline (out of scope for v1).
