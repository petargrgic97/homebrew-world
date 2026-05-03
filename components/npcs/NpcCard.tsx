import Link from 'next/link';
import Image from 'next/image';
import type { Npc } from '@/lib/types';
import { npcStatusLabel } from '@/lib/i18n';

const statusStyle: Record<Npc['status'], string> = {
  alive: 'text-emerald-300/90',
  dead: 'text-vellum-dim/70',
  missing: 'text-amber-300/90',
  unknown: 'text-sky-300/80',
};

export function NpcCard({
  npc, basePath = '/npcs',
}: { npc: Npc; basePath?: string }) {
  return (
    <Link
      href={`${basePath}/${npc.id}`}
      className="card-hover panel rounded-sm flex gap-3 p-3.5 items-start group"
    >
      <div className="relative shrink-0">
        {npc.portraitUrl ? (
          <Image
            src={npc.portraitUrl}
            alt=""
            width={72}
            height={72}
            className="w-18 h-18 rounded-sm object-cover ring-1 ring-gold-dim/30"
          />
        ) : (
          <div className="w-18 h-18 rounded-sm bg-linear-to-br from-surface-elev to-ink-deep flex items-center justify-center ring-1 ring-gold-dim/20">
            <span className="display text-gold-dim/30 text-2xl">✦</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="display font-semibold text-vellum truncate text-base leading-tight">
          {npc.name}
        </h3>
        {npc.faction && (
          <div className="text-xs italic text-vellum-dim truncate">
            {npc.faction}
          </div>
        )}
        <div className="pt-1">
          <span className={`seal ${statusStyle[npc.status]}`}>{npcStatusLabel[npc.status]}</span>
        </div>
      </div>
    </Link>
  );
}
