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
import type { Pc, NpcStatus, WriteInput } from '@/lib/types';

interface Props {
  initial?: Pc;
  onSubmit: (input: WriteInput<Pc>) => Promise<void>;
  onCancel: () => void;
}

const statuses: NpcStatus[] = ['alive', 'dead', 'missing', 'unknown'];

export function PcForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [playerName, setPlayerName] = useState(initial?.playerName ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [portraitUrl, setPortraitUrl] = useState<string | null>(initial?.portraitUrl ?? null);
  const [status, setStatus] = useState<NpcStatus>(initial?.status ?? 'alive');
  const [characterClass, setCharacterClass] = useState(initial?.characterClass ?? '');
  const [race, setRace] = useState(initial?.race ?? '');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        name, playerName, description, portraitUrl,
        status, characterClass, race,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Character name</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="playerName">Player</Label>
          <Input
            id="playerName"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="e.g. Petar"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="race">Race</Label>
          <Input
            id="race"
            value={race}
            onChange={e => setRace(e.target.value)}
            placeholder="Half-elf"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="class">Class</Label>
          <Input
            id="class"
            value={characterClass}
            onChange={e => setCharacterClass(e.target.value)}
            placeholder="Wizard"
          />
        </div>
      </div>

      <div className="space-y-1.5 max-w-xs">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as NpcStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Portrait</Label>
        <ImageUpload
          folder="pc-portraits"
          initialUrl={portraitUrl}
          onUploaded={setPortraitUrl}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Backstory & notes (markdown)</Label>
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
