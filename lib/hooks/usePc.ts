'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { getPc } from '@/lib/firestore/pcs';

export function usePc(id: string) {
  return useSWR(id ? ['pc', id] : null, () => getPc(db, id), { revalidateOnFocus: true });
}
