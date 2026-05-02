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
import { useLocations } from '@/lib/hooks/useLocations';
import { useSessions } from '@/lib/hooks/useSessions';
import { useNpcs } from '@/lib/hooks/useNpcs';
import { usePcs } from '@/lib/hooks/usePcs';
import type { CampaignEvent, WriteInput } from '@/lib/types';

interface InitialEventValues {
  locationId?: string | null;
  sessionId?: string | null;
  npcIds?: string[];
  pcIds?: string[];
}

interface Props {
  initial?: CampaignEvent | InitialEventValues;
  onSubmit: (input: WriteInput<CampaignEvent>) => Promise<void>;
  onCancel: () => void;
}

const NO_LINK = '__none__';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function isFullEvent(e: CampaignEvent | InitialEventValues | undefined): e is CampaignEvent {
  return !!e && 'id' in e;
}

export function EventForm({ initial, onSubmit, onCancel }: Props) {
  const { data: locations = [] } = useLocations();
  const { data: sessions = [] } = useSessions();
  const { data: npcs = [] } = useNpcs();
  const { data: pcs = [] } = usePcs();

  const full = isFullEvent(initial) ? initial : null;

  const [title, setTitle] = useState(full?.title ?? '');
  const [description, setDescription] = useState(full?.description ?? '');
  const [locationId, setLocationId] = useState<string>(
    (full?.locationId ?? initial?.locationId) ?? NO_LINK,
  );
  const [sessionId, setSessionId] = useState<string>(
    (full?.sessionId ?? initial?.sessionId) ?? NO_LINK,
  );
  const [npcIds, setNpcIds] = useState<string[]>(full?.npcIds ?? initial?.npcIds ?? []);
  const [pcIds, setPcIds] = useState<string[]>(full?.pcIds ?? initial?.pcIds ?? []);
  const [occurredAt, setOccurredAt] = useState(full?.occurredAt ?? todayIso());
  const [busy, setBusy] = useState(false);

  function toggleNpc(id: string) {
    setNpcIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function togglePc(id: string) {
    setPcIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        title,
        description,
        locationId: locationId === NO_LINK ? null : locationId,
        sessionId: sessionId === NO_LINK ? null : sessionId,
        npcIds,
        pcIds,
        occurredAt,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="occurredAt">Occurred</Label>
          <Input
            id="occurredAt"
            type="date"
            value={occurredAt}
            onChange={e => setOccurredAt(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_LINK}>(none)</SelectItem>
              {locations.map(l => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Session</Label>
          <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_LINK}>(none)</SelectItem>
              {sessions.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  Session {s.number}{s.title ? `: ${s.title}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Heroes involved (PCs)</Label>
        {pcs.length === 0 ? (
          <div className="text-sm text-vellum-dim italic">No party members yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto border border-border rounded-sm p-2 bg-ink-deep/30">
            {pcs.map(p => (
              <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-surface/40 rounded px-1 py-0.5">
                <input
                  type="checkbox"
                  checked={pcIds.includes(p.id)}
                  onChange={() => togglePc(p.id)}
                  className="accent-gold"
                />
                <span className="text-vellum">{p.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>NPCs involved</Label>
        {npcs.length === 0 ? (
          <div className="text-sm text-vellum-dim italic">No NPCs to link yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto border border-border rounded-sm p-2 bg-ink-deep/30">
            {npcs.map(n => (
              <label key={n.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-surface/40 rounded px-1 py-0.5">
                <input
                  type="checkbox"
                  checked={npcIds.includes(n.id)}
                  onChange={() => toggleNpc(n.id)}
                  className="accent-gold"
                />
                <span className="text-vellum">{n.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Description (markdown)</Label>
        <LinkInserter
          onInsert={(md) => setDescription(prev => (prev ? `${prev} ${md}` : md))}
        />
        <MarkdownEditor value={description} onChange={setDescription} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !title}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
