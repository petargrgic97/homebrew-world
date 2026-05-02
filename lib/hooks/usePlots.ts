'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { listPlots } from '@/lib/firestore/plots';

export function usePlots() {
  return useSWR(['plots'], () => listPlots(db), { revalidateOnFocus: true });
}
