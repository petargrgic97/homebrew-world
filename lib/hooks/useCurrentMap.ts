'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { getCurrentMap } from '@/lib/firestore/maps';

export function useCurrentMap() {
  return useSWR(['current-map'], () => getCurrentMap(db), { revalidateOnFocus: true });
}
