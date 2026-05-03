'use client';
import Link from 'next/link';
import { usePlots } from '@/lib/hooks/usePlots';
import { PlotCard } from '@/components/plots/PlotCard';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';

export default function DMPlotsPage() {
  const { data, isLoading } = usePlots();
  return (
    <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Niti u tijeku"
        title="Spletke"
        actions={
          <Button asChild>
            <Link href="/dm/plots/new">+ Smisli spletku</Link>
          </Button>
        }
      />
      {isLoading ? (
        <div className="text-vellum-dim italic">Učitavam…</div>
      ) : !data || data.length === 0 ? (
        <div className="text-vellum-dim italic py-12 text-center panel rounded-sm">
          Još nema iskovanih spletki.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map(p => <PlotCard key={p.id} plot={p} />)}
        </div>
      )}
    </div>
  );
}
