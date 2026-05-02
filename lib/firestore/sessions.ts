import {
  Firestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { sessionConverter } from './converters';
import type { Session, WriteInput } from '@/lib/types';

const col = (db: Firestore) => collection(db, 'sessions').withConverter(sessionConverter);

export async function listSessions(db: Firestore): Promise<Session[]> {
  const snap = await getDocs(query(col(db), orderBy('number', 'desc')));
  return snap.docs.map(d => d.data());
}

export async function getSession(db: Firestore, id: string): Promise<Session | null> {
  const snap = await getDoc(doc(db, 'sessions', id).withConverter(sessionConverter));
  return snap.exists() ? snap.data() : null;
}

export async function createSession(db: Firestore, input: WriteInput<Session>): Promise<string> {
  const ref = await addDoc(collection(db, 'sessions'), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSession(
  db: Firestore, id: string, patch: Partial<WriteInput<Session>>,
): Promise<void> {
  await updateDoc(doc(db, 'sessions', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSession(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, 'sessions', id));
}
