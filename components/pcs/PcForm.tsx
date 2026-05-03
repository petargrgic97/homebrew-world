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
import { ImageUpload } from '@/components/shared/ImageUpload';
import type { Pc, NpcStatus, WriteInput } from '@/lib/types';
import { npcStatusLabel } from '@/lib/i18n';

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
          <Label htmlFor="name">Ime lika</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="playerName">Igrač</Label>
          <Input
            id="playerName"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="npr. Petar"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="race">Rasa</Label>
          <Input
            id="race"
            value={race}
            onChange={e => setRace(e.target.value)}
            placeholder="Polu-vilenjak"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="class">Klasa</Label>
          <Input
            id="class"
            value={characterClass}
            onChange={e => setCharacterClass(e.target.value)}
            placeholder="Druid"
          />
        </div>
      </div>

      <div className="space-y-1.5 max-w-xs">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as NpcStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {statuses.map(s => <SelectItem key={s} value={s}>{npcStatusLabel[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Portret</Label>
        <ImageUpload
          folder="pc-portraits"
          initialUrl={portraitUrl}
          onUploaded={setPortraitUrl}
        />
      </div>

      <div className="space-y-2">
        <Label>Pozadina i bilješke (markdown)</Label>
        <LinkInserter
          onInsert={(md) => setDescription(prev => (prev ? `${prev} ${md}` : md))}
        />
        <MarkdownEditor value={description} onChange={setDescription} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !name}>
          {busy ? 'Spremam…' : 'Spremi'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Odustani</Button>
      </div>
    </form>
  );
}
