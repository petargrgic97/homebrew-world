'use client';
import { useNpcs } from '@/lib/hooks/useNpcs';
import { usePcs } from '@/lib/hooks/usePcs';
import { useLocations } from '@/lib/hooks/useLocations';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Props {
  onInsert: (markdown: string) => void;
}

const RESET = '__pick__';

export function LinkInserter({ onInsert }: Props) {
  const { data: npcs = [] } = useNpcs();
  const { data: pcs = [] } = usePcs();
  const { data: locations = [] } = useLocations();

  function handle(value: string, kind: 'npcs' | 'pcs' | 'locations', name: string) {
    onInsert(`[${name}](/${kind}/${value})`);
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="display text-[0.6rem] tracking-[0.3em] uppercase text-gold-dim">
        Insert link →
      </span>
      <PickerSelect
        label="NPC"
        items={npcs.map(n => ({ id: n.id, name: n.name }))}
        onPick={(item) => handle(item.id, 'npcs', item.name)}
      />
      <PickerSelect
        label="Hero"
        items={pcs.map(p => ({ id: p.id, name: p.name }))}
        onPick={(item) => handle(item.id, 'pcs', item.name)}
      />
      <PickerSelect
        label="Location"
        items={locations.map(l => ({ id: l.id, name: l.name }))}
        onPick={(item) => handle(item.id, 'locations', item.name)}
      />
    </div>
  );
}

function PickerSelect({
  label, items, onPick,
}: {
  label: string;
  items: { id: string; name: string }[];
  onPick: (item: { id: string; name: string }) => void;
}) {
  return (
    <Select
      value={RESET}
      onValueChange={(v) => {
        if (v === RESET) return;
        const it = items.find(i => i.id === v);
        if (it) onPick(it);
      }}
    >
      <SelectTrigger className="h-8 w-32 text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={RESET} disabled>{label}</SelectItem>
        {items.length === 0 ? (
          <SelectItem value="__none__" disabled>none yet</SelectItem>
        ) : (
          items.map(it => (
            <SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
