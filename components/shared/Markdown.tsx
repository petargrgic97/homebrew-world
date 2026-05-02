'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface Props {
  children: string;
  dropcap?: boolean;
}

export function Markdown({ children, dropcap = false }: Props) {
  if (!children?.trim()) return null;
  return (
    <div className={`prose-grimoire${dropcap ? ' dropcap' : ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{children}</ReactMarkdown>
    </div>
  );
}
