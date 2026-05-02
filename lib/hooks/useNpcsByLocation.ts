'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { listNpcsByLocation } from '@/lib/firestore/npcs';

export function useNpcsByLocation(locationId: string) {
  return useSWR(
    locationId ? ['npcs-by-location', locationId] : null,
    () => listNpcsByLocation(db, locationId),
    { revalidateOnFocus: true },
  );
}
