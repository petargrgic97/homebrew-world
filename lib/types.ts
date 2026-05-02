import { Timestamp } from 'firebase/firestore';

export type EntityId = string;

export interface Location {
  id: EntityId;
  name: string;
  description: string;
  imageUrl: string | null;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NpcStatus = 'alive' | 'dead' | 'missing' | 'unknown';

export interface Pc {
  id: EntityId;
  name: string;
  playerName: string;
  description: string;
  portraitUrl: string | null;
  status: NpcStatus;
  characterClass: string;
  race: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Npc {
  id: EntityId;
  name: string;
  description: string;
  portraitUrl: string | null;
  status: NpcStatus;
  faction: string;
  locationId: EntityId | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Session {
  id: EntityId;
  number: number;
  date: string;
  title: string | null;
  recap: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CampaignEvent {
  id: EntityId;
  title: string;
  description: string;
  locationId: EntityId | null;
  sessionId: EntityId | null;
  npcIds: EntityId[];
  occurredAt: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PlotStatus = 'active' | 'resolved' | 'dormant';

export interface Plot {
  id: EntityId;
  title: string;
  description: string;
  status: PlotStatus;
  npcIds: EntityId[];
  pcIds: EntityId[];
  locationIds: EntityId[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MapVersion {
  id: EntityId;
  imageUrl: string;
  caption: string | null;
  isCurrent: boolean;
  uploadedAt: Timestamp;
}

export type WriteInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
