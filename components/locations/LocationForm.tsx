'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@/components/shared/MarkdownEditor';
import { LinkInserter } from '@/components/shared/LinkInserter';
import { ImageUpload } from '@/components/shared/ImageUpload';
import type { Location, WriteInput } from '@/lib/types';

interface Props {
  initial?: Location;
  onSubmit: (input: WriteInput<Location>) => Promise<void>;
  onCancel: () => void;
}

export function LocationForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({ name, description, imageUrl, order });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="space-y-1.5">
        <Label htmlFor="name">Ime</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="order">Redoslijed</Label>
        <Input
          id="order"
          type="number"
          value={order}
          onChange={e => setOrder(Number(e.target.value))}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Slika</Label>
        <ImageUpload folder="location-images" initialUrl={imageUrl} onUploaded={setImageUrl} />
      </div>
      <div className="space-y-2">
        <Label>Opis (markdown)</Label>
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
