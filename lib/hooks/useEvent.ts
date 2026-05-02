'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { getEvent } from '@/lib/firestore/events';

export function useEvent(id: string) {
  return useSWR(id ? ['event', id] : null, () => getEvent(db, id), {
    revalidateOnFocus: true,
  });
}
