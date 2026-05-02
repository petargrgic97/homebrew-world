'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@/components/shared/MarkdownEditor';
import { LinkInserter } from '@/components/shared/LinkInserter';
import type { Session, WriteInput } from '@/lib/types';

interface Props {
  initial?: Session;
  onSubmit: (input: WriteInput<Session>) => Promise<void>;
  onCancel: () => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SessionForm({ initial, onSubmit, onCancel }: Props) {
  const [number, setNumber] = useState(initial?.number ?? 1);
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [title, setTitle] = useState(initial?.title ?? '');
  const [recap, setRecap] = useState(initial?.recap ?? '');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        number,
        date,
        title: title || null,
        recap,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="number">Session #</Label>
          <Input
            id="number"
            type="number"
            value={number}
            onChange={e => setNumber(Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. The Fountain Incident"
        />
      </div>
      <div className="space-y-2">
        <Label>Recap (markdown)</Label>
        <LinkInserter
          onInsert={(md) => setRecap(prev => (prev ? `${prev} ${md}` : md))}
        />
        <MarkdownEditor value={recap} onChange={setRecap} height={400} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
