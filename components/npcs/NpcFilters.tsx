'use client';
import { Input } from '@/components/ui/input';
import type { Npc, NpcStatus } from '@/lib/types';
import { npcStatusFilterLabel } from '@/lib/i18n';

interface Props {
  npcs: Npc[];
  query: string;
  setQuery: (q: string) => void;
  status: NpcStatus | 'all';
  setStatus: (s: NpcStatus | 'all') => void;
  faction: string | 'all';
  setFaction: (f: string | 'all') => void;
}

const statuses: (NpcStatus | 'all')[] = ['all', 'alive', 'dead', 'missing', 'unknown'];

function Chip({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`display text-[0.6rem] tracking-[0.25em] uppercase px-3 py-1 rounded-full border transition-colors ${
        active
          ? 'bg-gold/15 border-gold/60 text-gold'
          : 'bg-transparent border-border text-vellum-dim hover:text-vellum hover:border-gold-dim/40'
      }`}
    >
      {children}
    </button>
  );
}

export function NpcFilters({
  npcs, query, setQuery, status, setStatus, faction, setFaction,
}: Props) {
  const factions = Array.from(new Set(npcs.map(n => n.faction).filter(Boolean))).sort();

  return (
    <div className="space-y-3 mb-6">
      <Input
        placeholder="Pretraži po imenu…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {statuses.map(s => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{npcStatusFilterLabel[s]}</Chip>
        ))}
      </div>
      {factions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Chip active={faction === 'all'} onClick={() => setFaction('all')}>sve uloge</Chip>
          {factions.map(f => (
            <Chip key={f} active={faction === f} onClick={() => setFaction(f)}>{f}</Chip>
          ))}
        </div>
      )}
    </div>
  );
}
