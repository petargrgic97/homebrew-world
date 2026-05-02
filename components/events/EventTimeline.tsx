import Link from 'next/link';
import type { CampaignEvent } from '@/lib/types';
import { Markdown } from '@/components/shared/Markdown';

interface Props {
  events: CampaignEvent[];
  dmEditable?: boolean;
}

export function EventTimeline({ events, dmEditable }: Props) {
  if (events.length === 0) return null;
  return (
    <ol className="relative space-y-6 pl-6">
      <span className="absolute left-1.5 top-2 bottom-2 w-px bg-linear-to-b from-gold-dim/10 via-gold-dim/40 to-gold-dim/10" />
      {events.map(e => (
        <li key={e.id} className="relative">
          <span
            className="absolute -left-5 top-2.5 w-3 h-3 rounded-full bg-gold ring-2 ring-ink-deep"
            style={{ boxShadow: '0 0 12px var(--gold)' }}
          />
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <div className="flex items-baseline gap-3 min-w-0">
              <span className="display text-[0.65rem] tracking-[0.3em] uppercase text-gold-dim shrink-0">
                {e.occurredAt}
              </span>
              <span className="hidden sm:inline text-gold-dim/40 select-none">·</span>
              <h3 className="display font-semibold text-vellum text-base truncate">
                {e.title}
              </h3>
            </div>
            {dmEditable && (
              <Link
                href={`/dm/events/${e.id}/edit`}
                className="text-[0.65rem] tracking-[0.3em] uppercase display text-gold-dim hover:text-gold shrink-0"
              >
                edit
              </Link>
            )}
          </div>
          <Markdown>{e.description}</Markdown>
        </li>
      ))}
    </ol>
  );
}
