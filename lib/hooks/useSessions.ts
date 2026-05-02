'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { listSessions } from '@/lib/firestore/sessions';

export function useSessions() {
  return useSWR(['sessions'], () => listSessions(db), { revalidateOnFocus: true });
}
