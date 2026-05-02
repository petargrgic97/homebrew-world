'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { getNpc } from '@/lib/firestore/npcs';

export function useNpc(id: string) {
  return useSWR(id ? ['npc', id] : null, () => getNpc(db, id), { revalidateOnFocus: true });
}
