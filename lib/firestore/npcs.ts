import {
  Firestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { npcConverter } from './converters';
import type { Npc, WriteInput } from '@/lib/types';

const col = (db: Firestore) => collection(db, 'npcs').withConverter(npcConverter);

export async function listNpcs(db: Firestore): Promise<Npc[]> {
  const snap = await getDocs(query(col(db), orderBy('name', 'asc')));
  return snap.docs.map(d => d.data());
}

export async function listNpcsByLocation(db: Firestore, locationId: string): Promise<Npc[]> {
  const snap = await getDocs(query(col(db), where('locationId', '==', locationId)));
  return snap.docs.map(d => d.data()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getNpc(db: Firestore, id: string): Promise<Npc | null> {
  const snap = await getDoc(doc(db, 'npcs', id).withConverter(npcConverter));
  return snap.exists() ? snap.data() : null;
}

export async function createNpc(db: Firestore, input: WriteInput<Npc>): Promise<string> {
  const ref = await addDoc(collection(db, 'npcs'), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateNpc(
  db: Firestore, id: string, patch: Partial<WriteInput<Npc>>,
): Promise<void> {
  await updateDoc(doc(db, 'npcs', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNpc(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, 'npcs', id));
}
