import type { NpcStatus, PlotStatus } from './types';

export const npcStatusLabel: Record<NpcStatus, string> = {
  alive: 'živ',
  dead: 'mrtav',
  missing: 'nestao',
  unknown: 'nepoznato',
};

export const npcStatusFilterLabel: Record<NpcStatus | 'all', string> = {
  all: 'svi',
  alive: 'živi',
  dead: 'mrtvi',
  missing: 'nestali',
  unknown: 'nepoznati',
};

export const plotStatusLabel: Record<PlotStatus, string> = {
  active: 'aktivna',
  resolved: 'riješena',
  dormant: 'uspavana',
};
