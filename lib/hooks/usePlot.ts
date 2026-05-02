'use client';
import useSWR from 'swr';
import { db } from '@/lib/firebase';
import { getPlot } from '@/lib/firestore/plots';

export function usePlot(id: string) {
  return useSWR(id ? ['plot', id] : null, () => getPlot(db, id), { revalidateOnFocus: true });
}
