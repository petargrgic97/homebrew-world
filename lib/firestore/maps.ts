import {
  Firestore, collection, doc, getDocs, query, where, limit, orderBy,
  serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { mapConverter } from './converters';
import type { MapVersion } from '@/lib/types';

const col = (db: Firestore) => collection(db, 'maps').withConverter(mapConverter);

export async function listMaps(db: Firestore): Promise<MapVersion[]> {
  const snap = await getDocs(query(col(db), orderBy('uploadedAt', 'desc')));
  return snap.docs.map(d => d.data());
}

export async function getCurrentMap(db: Firestore): Promise<MapVersion | null> {
  const snap = await getDocs(query(col(db), where('isCurrent', '==', true), limit(1)));
  return snap.empty ? null : snap.docs[0].data();
}

export async function publishMap(
  db: Firestore, imageUrl: string, caption: string | null,
): Promise<string> {
  const batch = writeBatch(db);
  const prevSnap = await getDocs(query(collection(db, 'maps'), where('isCurrent', '==', true)));
  prevSnap.forEach(d => batch.update(d.ref, { isCurrent: false }));
  const newRef = doc(collection(db, 'maps'));
  batch.set(newRef, {
    imageUrl,
    caption,
    isCurrent: true,
    uploadedAt: serverTimestamp(),
  });
  await batch.commit();
  return newRef.id;
}

export async function deleteMapVersion(db: Firestore, id: string): Promise<void> {
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'maps', id));
}
