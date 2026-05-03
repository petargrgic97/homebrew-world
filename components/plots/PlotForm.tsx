'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MarkdownEditor } from '@/components/shared/MarkdownEditor';
import { LinkInserter } from '@/components/shared/LinkInserter';
import { useNpcs } from '@/lib/hooks/useNpcs';
import { usePcs } from '@/lib/hooks/usePcs';
import { useLocations } from '@/lib/hooks/useLocations';
import type { Plot, PlotStatus, WriteInput } from '@/lib/types';
import { plotStatusLabel } from '@/lib/i18n';

interface Props {
  initial?: Plot;
  onSubmit: (input: WriteInput<Plot>) => Promise<void>;
  onCancel: () => void;
}

const statuses: PlotStatus[] = ['active', 'resolved', 'dormant'];

function MultiCheckList({
  items, selected, onToggle, emptyLabel,
}: {
  items: { id: string; name: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <div className="text-sm text-vellum-dim italic">{emptyLabel}</div>;
  }
  return (
    <div className="grid sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto border border-border rounded-sm p-2 bg-ink-deep/30">
      {items.map(it => (
        <label key={it.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-surface/40 rounded px-1 py-0.5">
          <input
            type="checkbox"
            checked={selected.includes(it.id)}
            onChange={() => onToggle(it.id)}
            className="accent-gold"
          />
          <span className="text-vellum">{it.name}</span>
        </label>
      ))}
    </div>
  );
}

export function PlotForm({ initial, onSubmit, onCancel }: Props) {
  const { data: npcs = [] } = useNpcs();
  const { data: pcs = [] } = usePcs();
  const { data: locations = [] } = useLocations();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [status, setStatus] = useState<PlotStatus>(initial?.status ?? 'active');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [npcIds, setNpcIds] = useState<string[]>(initial?.npcIds ?? []);
  const [pcIds, setPcIds] = useState<string[]>(initial?.pcIds ?? []);
  const [locationIds, setLocationIds] = useState<string[]>(initial?.locationIds ?? []);
  const [busy, setBusy] = useState(false);

  function toggle(list: string[], setter: (v: string[]) => void, id: string) {
    setter(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({ title, status, description, npcIds, pcIds, locationIds });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="space-y-1.5">
        <Label htmlFor="title">Naslov</Label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      <div className="space-y-1.5 max-w-xs">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as PlotStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {statuses.map(s => <SelectItem key={s} value={s}>{plotStatusLabel[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Povezani heroji</Label>
        <MultiCheckList
          items={pcs.map(p => ({ id: p.id, name: p.name }))}
          selected={pcIds}
          onToggle={(id) => toggle(pcIds, setPcIds, id)}
          emptyLabel="Još nema članova družine za povezati."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Povezani likovi</Label>
        <MultiCheckList
          items={npcs.map(n => ({ id: n.id, name: n.name }))}
          selected={npcIds}
          onToggle={(id) => toggle(npcIds, setNpcIds, id)}
          emptyLabel="Još nema likova za povezati."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Povezane lokacije</Label>
        <MultiCheckList
          items={locations.map(l => ({ id: l.id, name: l.name }))}
          selected={locationIds}
          onToggle={(id) => toggle(locationIds, setLocationIds, id)}
          emptyLabel="Još nema lokacija za povezati."
        />
      </div>

      <div className="space-y-2">
        <Label>Opis (markdown)</Label>
        <LinkInserter
          onInsert={(md) => setDescription(prev => (prev ? `${prev} ${md}` : md))}
        />
        <MarkdownEditor value={description} onChange={setDescription} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !title}>
          {busy ? 'Spremam…' : 'Spremi'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Odustani</Button>
      </div>
    </form>
  );
}
