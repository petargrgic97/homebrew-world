'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MarkdownEditor } from '@/components/shared/MarkdownEditor';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useLocations } from '@/lib/hooks/useLocations';
import type { Npc, NpcStatus, WriteInput } from '@/lib/types';

interface Props {
  initial?: Npc;
  onSubmit: (input: WriteInput<Npc>) => Promise<void>;
  onCancel: () => void;
}

const statuses: NpcStatus[] = ['alive', 'dead', 'missing', 'unknown'];
const NO_LOCATION = '__none__';

export function NpcForm({ initial, onSubmit, onCancel }: Props) {
  const { data: locations = [] } = useLocations();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [portraitUrl, setPortraitUrl] = useState<string | null>(initial?.portraitUrl ?? null);
  const [status, setStatus] = useState<NpcStatus>(initial?.status ?? 'alive');
  const [faction, setFaction] = useState(initial?.faction ?? '');
  const [locationId, setLocationId] = useState<string>(initial?.locationId ?? NO_LOCATION);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        name,
        description,
        portraitUrl,
        status,
        faction,
        locationId: locationId === NO_LOCATION ? null : locationId,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as NpcStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="faction">Faction / role</Label>
          <Input
            id="faction"
            value={faction}
            onChange={e => setFaction(e.target.value)}
            placeholder="e.g. Lord's household"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Location</Label>
        <Select value={locationId} onValueChange={setLocationId}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_LOCATION}>(no location)</SelectItem>
            {locations.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Portrait</Label>
        <ImageUpload
          folder="npc-portraits"
          initialUrl={portraitUrl}
          onUploaded={setPortraitUrl}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Description (markdown)</Label>
        <MarkdownEditor value={description} onChange={setDescription} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !name}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
