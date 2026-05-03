'use client';
import Link from 'next/link';
import { useCurrentMap } from '@/lib/hooks/useCurrentMap';
import { useSessions } from '@/lib/hooks/useSessions';
import { useLocations } from '@/lib/hooks/useLocations';
import { useNpcs } from '@/lib/hooks/useNpcs';
import { usePcs } from '@/lib/hooks/usePcs';
import { MapDisplay } from '@/components/map/MapDisplay';
import { Ornament } from '@/components/shared/Ornament';

export default function Home() {
  const { data: map } = useCurrentMap();
  const { data: sessions = [] } = useSessions();
  const { data: locations = [] } = useLocations();
  const { data: npcs = [] } = useNpcs();
  const { data: pcs = [] } = usePcs();
  const sessionsByNewest = [...sessions].reverse();
  const latest = sessionsByNewest[0];

  return (
    <div className="px-6 md:px-10 py-12 max-w-5xl mx-auto">
      {/* Tome cover */}
      <div className="text-center mb-12 md:mb-16">
        <div className="display text-[0.7rem] tracking-[0.5em] uppercase text-gold-dim mb-4">
          ✦ kronika o ✦
        </div>
        <h1 className="display-decorative text-5xl md:text-7xl font-bold text-gold leading-none tracking-wide">
          Homebrew
          <br />
          <span className="italic">World</span>
        </h1>
        <div className="mt-5 italic text-vellum-dim text-lg max-w-md mx-auto">
          U kojoj su zapisana djela, mjesta i duše susrete na putu.
        </div>
        <Ornament className="max-w-xs mx-auto mt-7" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
        <Stat label="Družina" value={pcs.length} href="/pcs" />
        <Stat label="Lokacije" value={locations.length} href="/locations" />
        <Stat label="Likovi" value={npcs.length} href="/npcs" />
        <Stat label="Sesije" value={sessions.length} href="/sessions" />
      </div>

      {/* Featured map */}
      {map && (
        <section className="mb-14">
          <SectionHeading eyebrow="Poznate zemlje" title="Karta svijeta" />
          <Link href="/map" className="block group">
            <MapDisplay map={map} />
          </Link>
        </section>
      )}

      {/* Latest session highlight */}
      {latest && (
        <section className="mb-14">
          <SectionHeading eyebrow="Posljednji upis" title="Iz kronike" />
          <Link
            href={`/sessions/${latest.id}`}
            className="card-hover panel rounded-sm p-6 md:p-8 block group"
          >
            <div className="display text-[0.65rem] tracking-[0.4em] uppercase text-gold-dim mb-2">
              Sesija {latest.number}{latest.date ? ` · ${latest.date}` : ''}
            </div>
            <h3 className="display-decorative text-3xl md:text-4xl text-gold mb-3 leading-tight">
              {latest.title || `Sesija ${latest.number}`}
            </h3>
            {latest.recap && (
              <div className="text-vellum-dim line-clamp-4 italic">
                {latest.recap.replace(/[#*_`>]/g, '').slice(0, 280)}…
              </div>
            )}
            <div className="mt-4 display text-[0.65rem] tracking-[0.3em] uppercase text-gold group-hover:text-gold-bright transition-colors">
              pročitaj zapis →
            </div>
          </Link>
        </section>
      )}

      {sessionsByNewest.length > 1 && (
        <section className="mb-14">
          <SectionHeading eyebrow="Ranije" title="Prethodne sesije" />
          <div className="grid gap-3 sm:grid-cols-2">
            {sessionsByNewest.slice(1, 5).map(s => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="card-hover panel rounded-sm p-4 flex justify-between items-baseline gap-4"
              >
                <div className="min-w-0">
                  <div className="display text-[0.6rem] tracking-[0.35em] uppercase text-gold-dim">
                    Sesija {s.number}
                  </div>
                  <div className="display font-medium text-vellum truncate">
                    {s.title || s.date || `Sesija ${s.number}`}
                  </div>
                </div>
                {s.date && (
                  <div className="display text-[0.6rem] tracking-[0.3em] uppercase text-vellum-dim shrink-0">
                    {s.date}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {sessions.length === 0 && locations.length === 0 && (
        <div className="text-center text-vellum-dim italic py-16 panel rounded-sm">
          Kronika je prazna. Prvo poglavlje tek treba biti napisano.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="text-center group">
      <div className="display-decorative text-3xl md:text-4xl text-gold transition-colors group-hover:text-gold-bright">
        {value}
      </div>
      <div className="display text-[0.6rem] tracking-[0.4em] uppercase text-vellum-dim mt-1 group-hover:text-vellum transition-colors">
        {label}
      </div>
    </Link>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="display text-[0.6rem] tracking-[0.4em] uppercase text-gold-dim">
        {eyebrow}
      </div>
      <h2 className="display-decorative text-2xl md:text-3xl text-vellum mt-1">
        {title}
      </h2>
      <span className="block w-12 h-px bg-gold mt-2" />
    </div>
  );
}
