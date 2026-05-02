'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { listLocations } from '@/lib/firestore/locations';

export function useLocations() {
  return useSWR(['locations'], () => listLocations(db), {
    revalidateOnFocus: true,
  });
}
