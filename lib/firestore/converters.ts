import { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';
import type { Location, Npc, Pc, Session, CampaignEvent, Plot, MapVersion } from '@/lib/types';

function passthroughConverter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (data) => {
      const obj = data as T;
      const rest: Record<string, unknown> = {};
      for (const key of Object.keys(obj) as (keyof T)[]) {
        if (key !== 'id') rest[key as string] = obj[key];
      }
      return rest;
    },
    fromFirestore: (snap: QueryDocumentSnapshot) =>
      ({ id: snap.id, ...snap.data() }) as T,
  };
}

export const locationConverter = passthroughConverter<Location>();
export const npcConverter = passthroughConverter<Npc>();
export const pcConverter = passthroughConverter<Pc>();
export const sessionConverter = passthroughConverter<Session>();
export const eventConverter = passthroughConverter<CampaignEvent>();
export const plotConverter = passthroughConverter<Plot>();
export const mapConverter = passthroughConverter<MapVersion>();
