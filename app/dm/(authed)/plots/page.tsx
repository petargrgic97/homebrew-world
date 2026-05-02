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
        eyebrow="Threads in motion"
        title="Schemes"
        actions={
          <Button asChild>
            <Link href="/dm/plots/new">+ Plot Scheme</Link>
          </Button>
        }
      />
      {isLoading ? (
        <div className="text-vellum-dim italic">Loading…</div>
      ) : !data || data.length === 0 ? (
        <div className="text-vellum-dim italic py-12 text-center panel rounded-sm">
          No schemes yet conspired.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map(p => <PlotCard key={p.id} plot={p} />)}
        </div>
      )}
    </div>
  );
}
