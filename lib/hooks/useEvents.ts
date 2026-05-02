'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { listEvents, listEventsByLocation, listEventsBySession } from '@/lib/firestore/events';

export function useEvents() {
  return useSWR(['events'], () => listEvents(db), { revalidateOnFocus: true });
}

export function useEventsByLocation(locationId: string) {
  return useSWR(
    locationId ? ['events-by-location', locationId] : null,
    () => listEventsByLocation(db, locationId),
    { revalidateOnFocus: true },
  );
}

export function useEventsBySession(sessionId: string) {
  return useSWR(
    sessionId ? ['events-by-session', sessionId] : null,
    () => listEventsBySession(db, sessionId),
    { revalidateOnFocus: true },
  );
}
