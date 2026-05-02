'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { getLocation } from '@/lib/firestore/locations';

export function useLocation(id: string) {
  return useSWR(id ? ['location', id] : null, () => getLocation(db, id), {
    revalidateOnFocus: true,
  });
}
