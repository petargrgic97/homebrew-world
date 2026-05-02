'use client';
import Link from 'next/link';
import { usePcs } from '@/lib/hooks/usePcs';
import { PcCard } from '@/components/pcs/PcCard';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';

export default function DMPcsPage() {
  const { data, isLoading } = usePcs();
  return (
    <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="The fellowship"
        title="The Party"
        actions={
          <Button asChild>
            <Link href="/dm/pcs/new">+ Add Hero</Link>
          </Button>
        }
      />
      {isLoading ? (
        <div className="text-vellum-dim italic">Loading…</div>
      ) : !data || data.length === 0 ? (
        <div className="text-vellum-dim italic py-12 text-center panel rounded-sm">
          The party is yet to assemble.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map(p => <PcCard key={p.id} pc={p} basePath="/dm/pcs" />)}
        </div>
      )}
    </div>
  );
}
