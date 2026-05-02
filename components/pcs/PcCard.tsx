import Link from 'next/link';
import Image from 'next/image';
import type { Pc } from '@/lib/types';

const statusStyle: Record<string, string> = {
  alive: 'text-emerald-300/90',
  dead: 'text-vellum-dim/70',
  missing: 'text-amber-300/90',
  unknown: 'text-sky-300/80',
};

export function PcCard({
  pc, basePath = '/pcs',
}: { pc: Pc; basePath?: string }) {
  return (
    <Link
      href={`${basePath}/${pc.id}`}
      className="card-hover panel rounded-sm p-4 flex flex-col items-center text-center group"
    >
      <div className="mb-3">
        {pc.portraitUrl ? (
          <Image
            src={pc.portraitUrl}
            alt=""
            width={120}
            height={120}
            className="w-24 h-24 rounded-full object-cover ring-2 ring-gold-dim/40"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-linear-to-br from-surface-elev to-ink-deep ring-2 ring-gold-dim/30 flex items-center justify-center">
            <span className="display text-gold-dim/30 text-3xl">✦</span>
          </div>
        )}
      </div>
      <h3 className="display-decorative text-xl text-gold leading-tight">
        {pc.name}
      </h3>
      <div className="display text-[0.55rem] tracking-[0.3em] uppercase text-vellum-dim mt-1">
        {[pc.race, pc.characterClass].filter(Boolean).join(' · ')}
      </div>
      {pc.playerName && (
        <div className="text-xs italic text-vellum-dim/80 mt-2">
          played by <span className="text-vellum">{pc.playerName}</span>
        </div>
      )}
      <div className="mt-3">
        <span className={`seal ${statusStyle[pc.status] ?? 'text-vellum-dim'}`}>{pc.status}</span>
      </div>
    </Link>
  );
}
