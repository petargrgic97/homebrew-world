'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { getSession } from '@/lib/firestore/sessions';

export function useSession(id: string) {
  return useSWR(id ? ['session', id] : null, () => getSession(db, id), { revalidateOnFocus: true });
}
