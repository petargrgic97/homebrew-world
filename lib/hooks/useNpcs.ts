'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { listNpcs } from '@/lib/firestore/npcs';

export function useNpcs() {
  return useSWR(['npcs'], () => listNpcs(db), { revalidateOnFocus: true });
}
