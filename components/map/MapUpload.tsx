'use client';
import { useState } from 'react';
import { mutate } from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadImage } from '@/lib/storage/upload';
import { publishMap } from '@/lib/firestore/maps';
import { db } from '@/lib/firebase';

export function MapUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadImage('maps', file);
      await publishMap(db, url, caption || null);
      await mutate(['current-map']);
      await mutate(['map-versions']);
      setFile(null);
      setCaption('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 border rounded p-4">
      <h2 className="font-medium">Publish new map</h2>
      <div className="space-y-1.5">
        <Label htmlFor="map-file">Image</Label>
        <input
          id="map-file"
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="map-caption">Caption (optional)</Label>
        <Input
          id="map-caption"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="e.g. Session 4 — after the wolves were freed"
        />
      </div>
      <Button onClick={handlePublish} disabled={!file || busy}>
        {busy ? 'Publishing…' : 'Publish'}
      </Button>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}
