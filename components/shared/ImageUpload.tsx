'use client';
import { useState } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/lib/storage/upload';

interface Props {
  folder: string;
  initialUrl: string | null;
  onUploaded: (url: string) => void;
}

export function ImageUpload({ folder, initialUrl, onUploaded }: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const newUrl = await uploadImage(folder, file);
      setUrl(newUrl);
      onUploaded(newUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {url && (
        <Image src={url} alt="" width={240} height={240} className="rounded border object-cover" />
      )}
      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {busy && <div className="text-sm text-slate-500">Uploading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}
