'use client';
import Link from 'next/link';
import { useCurrentMap } from '@/lib/hooks/useCurrentMap';
import { useSessions } from '@/lib/hooks/useSessions';
import { useLocations } from '@/lib/hooks/useLocations';
import { useNpcs } from '@/lib/hooks/useNpcs';
import { usePcs } from '@/lib/hooks/usePcs';
import { usePlots } from '@/lib/hooks/usePlots';
import { MapDisplay } from '@/components/map/MapDisplay';
import { Ornament } from '@/components/shared/Ornament';
import { PlotCard } from '@/components/plots/PlotCard';

export default function DMHome() {
  const { data: map } = useCurrentMap();
  const { data: sessions = [] } = useSessions();
  const { data: locations = [] } = useLocations();
  const { data: npcs = [] } = useNpcs();
  const { data: pcs = [] } = usePcs();
  const { data: plots = [] } = usePlots();
  const activePlots = plots.filter(p => p.status === 'active');

  return (
    <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <div className="display text-[0.7rem] tracking-[0.5em] uppercase text-gold-dim mb-3">
          ✦ Master’s tome ✦
        </div>
        <h1 className="display-decorative text-4xl md:text-5xl font-bold text-gold leading-none">
          Homebrew World
        </h1>
        <Ornament className="max-w-xs mx-auto mt-5" />
      </div>

      {/* Quick conjures */}
      <section className="mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <QuickAction href="/dm/sessions/new" label="Begin Session" />
          <QuickAction href="/dm/locations/new" label="Mark Location" />
          <QuickAction href="/dm/npcs/new" label="Inscribe NPC" />
          <QuickAction href="/dm/pcs/new" label="Add Hero" />
          <QuickAction href="/dm/plots/new" label="Plot Scheme" />
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-12 max-w-3xl mx-auto">
        <Stat label="Party" value={pcs.length} href="/dm/pcs" />
        <Stat label="Locations" value={locations.length} href="/dm/locations" />
        <Stat label="Personae" value={npcs.length} href="/dm/npcs" />
        <Stat label="Sessions" value={sessions.length} href="/dm/sessions" />
        <Stat label="Schemes" value={plots.length} href="/dm/plots" />
      </div>

      {activePlots.length > 0 && (
        <section className="mb-12">
          <SectionHeading eyebrow="Threads in motion" title="Active Schemes" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activePlots.slice(0, 6).map(p => <PlotCard key={p.id} plot={p} />)}
          </div>
        </section>
      )}

      {map && (
        <section className="mb-12">
          <SectionHeading eyebrow="The known lands" title="Current Map" />
          <Link href="/dm/map" className="block">
            <MapDisplay map={map} />
          </Link>
        </section>
      )}

      {sessions[0] && (
        <section>
          <SectionHeading eyebrow="Last entry" title="Most Recent Session" />
          <Link
            href={`/dm/sessions/${sessions[0].id}`}
            className="card-hover panel rounded-sm p-6 block"
          >
            <div className="display text-[0.65rem] tracking-[0.4em] uppercase text-gold-dim mb-2">
              Session {sessions[0].number}{sessions[0].date ? ` · ${sessions[0].date}` : ''}
            </div>
            <h3 className="display-decorative text-2xl text-gold leading-tight">
              {sessions[0].title || `Session ${sessions[0].number}`}
            </h3>
          </Link>
        </section>
      )}
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="panel rounded-sm py-3 px-3 text-center group hover:border-gold/40 hover:bg-gold/5 transition-colors"
    >
      <div className="display text-[0.62rem] tracking-[0.3em] uppercase text-gold group-hover:text-gold-bright">
        + {label}
      </div>
    </Link>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="text-center group">
      <div className="display-decorative text-2xl md:text-3xl text-gold transition-colors group-hover:text-gold-bright">
        {value}
      </div>
      <div className="display text-[0.55rem] tracking-[0.4em] uppercase text-vellum-dim mt-1">
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
      <h2 className="display-decorative text-2xl text-vellum mt-1">{title}</h2>
      <span className="block w-12 h-px bg-gold mt-2" />
    </div>
  );
}
