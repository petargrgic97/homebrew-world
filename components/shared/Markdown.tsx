'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  children: string;
  dropcap?: boolean;
}

export function Markdown({ children, dropcap = false }: Props) {
  if (!children?.trim()) return null;
  return (
    <div className={`prose-grimoire${dropcap ? ' dropcap' : ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
