'use client';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface Props {
  value: string;
  onChange: (v: string) => void;
  height?: number;
}

export function MarkdownEditor({ value, onChange, height = 320 }: Props) {
  return (
    <div data-color-mode="light">
      <MDEditor value={value} onChange={(v) => onChange(v ?? '')} height={height} preview="edit" />
    </div>
  );
}
