import { Ornament } from './Ornament';
import { ReactNode } from 'react';

interface Props {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  ornament?: boolean;
}

export function PageHeader({ title, eyebrow, actions, ornament = true }: Props) {
  return (
    <header className="mb-8 space-y-3">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          {eyebrow && (
            <div className="text-[0.7rem] tracking-[0.3em] uppercase text-[color:var(--gold-dim)] display mb-1">
              {eyebrow}
            </div>
          )}
          <h1 className="page-title">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {ornament && <Ornament className="max-w-md" />}
    </header>
  );
}
