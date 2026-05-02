'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { listPcs } from '@/lib/firestore/pcs';

export function usePcs() {
  return useSWR(['pcs'], () => listPcs(db), { revalidateOnFocus: true });
}
