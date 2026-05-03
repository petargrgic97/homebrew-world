import {
  Firestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { eventConverter } from './converters';
import type { CampaignEvent, WriteInput } from '@/lib/types';

const col = (db: Firestore) => collection(db, 'events').withConverter(eventConverter);

function compareByCreated(a: CampaignEvent, b: CampaignEvent): number {
  const aSec = a.createdAt?.seconds ?? 0;
  const bSec = b.createdAt?.seconds ?? 0;
  if (aSec !== bSec) return aSec - bSec;
  const aNs = a.createdAt?.nanoseconds ?? 0;
  const bNs = b.createdAt?.nanoseconds ?? 0;
  return aNs - bNs;
}

export async function listEvents(db: Firestore): Promise<CampaignEvent[]> {
  const snap = await getDocs(query(col(db), orderBy('createdAt', 'asc')));
  return snap.docs.map(d => d.data());
}

export async function listEventsByLocation(db: Firestore, locationId: string): Promise<CampaignEvent[]> {
  const snap = await getDocs(query(col(db), where('locationId', '==', locationId)));
  return snap.docs.map(d => d.data()).sort(compareByCreated);
}

export async function listEventsBySession(db: Firestore, sessionId: string): Promise<CampaignEvent[]> {
  const snap = await getDocs(query(col(db), where('sessionId', '==', sessionId)));
  return snap.docs.map(d => d.data()).sort(compareByCreated);
}

export async function listEventsByNpc(db: Firestore, npcId: string): Promise<CampaignEvent[]> {
  const snap = await getDocs(query(col(db), where('npcIds', 'array-contains', npcId)));
  return snap.docs.map(d => d.data()).sort(compareByCreated);
}

export async function listEventsByPc(db: Firestore, pcId: string): Promise<CampaignEvent[]> {
  const snap = await getDocs(query(col(db), where('pcIds', 'array-contains', pcId)));
  return snap.docs.map(d => d.data()).sort(compareByCreated);
}

export async function getEvent(db: Firestore, id: string): Promise<CampaignEvent | null> {
  const snap = await getDoc(doc(db, 'events', id).withConverter(eventConverter));
  return snap.exists() ? snap.data() : null;
}

export async function createEvent(db: Firestore, input: WriteInput<CampaignEvent>): Promise<string> {
  const ref = await addDoc(collection(db, 'events'), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEvent(
  db: Firestore, id: string, patch: Partial<WriteInput<CampaignEvent>>,
): Promise<void> {
  await updateDoc(doc(db, 'events', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id));
}
