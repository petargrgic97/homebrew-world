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
  db: Firestore, id: string, patch: Partial<WriteInput<Location>>,
): Promise<void> {
  await updateDoc(doc(db, 'locations', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteLocation(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, 'locations', id));
}
