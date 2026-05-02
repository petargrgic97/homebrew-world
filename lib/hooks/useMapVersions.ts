'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { listMaps } from '@/lib/firestore/maps';

export function useMapVersions() {
  return useSWR(['map-versions'], () => listMaps(db), { revalidateOnFocus: true });
}
