import {
  Firestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { plotConverter } from './converters';
import type { Plot, WriteInput } from '@/lib/types';

const col = (db: Firestore) => collection(db, 'plots').withConverter(plotConverter);

export async function listPlots(db: Firestore): Promise<Plot[]> {
  const snap = await getDocs(query(col(db), orderBy('updatedAt', 'desc')));
  return snap.docs.map(d => d.data());
}

export async function getPlot(db: Firestore, id: string): Promise<Plot | null> {
  const snap = await getDoc(doc(db, 'plots', id).withConverter(plotConverter));
  return snap.exists() ? snap.data() : null;
}

export async function createPlot(db: Firestore, input: WriteInput<Plot>): Promise<string> {
  const ref = await addDoc(collection(db, 'plots'), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePlot(
  db: Firestore, id: string, patch: Partial<WriteInput<Plot>>,
): Promise<void> {
  await updateDoc(doc(db, 'plots', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePlot(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, 'plots', id));
}
