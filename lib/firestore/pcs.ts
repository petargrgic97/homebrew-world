import {
  Firestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { pcConverter } from './converters';
import type { Pc, WriteInput } from '@/lib/types';

const col = (db: Firestore) => collection(db, 'pcs').withConverter(pcConverter);

export async function listPcs(db: Firestore): Promise<Pc[]> {
  const snap = await getDocs(query(col(db), orderBy('name', 'asc')));
  return snap.docs.map(d => d.data());
}

export async function getPc(db: Firestore, id: string): Promise<Pc | null> {
  const snap = await getDoc(doc(db, 'pcs', id).withConverter(pcConverter));
  return snap.exists() ? snap.data() : null;
}

export async function createPc(db: Firestore, input: WriteInput<Pc>): Promise<string> {
  const ref = await addDoc(collection(db, 'pcs'), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePc(
  db: Firestore, id: string, patch: Partial<WriteInput<Pc>>,
): Promise<void> {
  await updateDoc(doc(db, 'pcs', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePc(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, 'pcs', id));
}
