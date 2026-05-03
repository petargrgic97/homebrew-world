'use client';
import Link from 'next/link';
import { useLocations } from '@/lib/hooks/useLocations';
import { LocationCard } from '@/components/locations/LocationCard';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';

export default function DMLocationsPage() {
  const { data, isLoading } = useLocations();
  return (
    <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Iz atlasa"
        title="Lokacije"
        actions={
          <Button asChild>
            <Link href="/dm/locations/new">+ Označi lokaciju</Link>
          </Button>
        }
      />
      {isLoading ? (
        <div className="text-vellum-dim italic">Učitavam…</div>
      ) : !data || data.length === 0 ? (
        <div className="text-vellum-dim italic py-12 text-center panel rounded-sm">
          Još nema zabilježenih lokacija.
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {data.map(l => (
            <LocationCard key={l.id} location={l} basePath="/dm/locations" />
          ))}
        </div>
      )}
    </div>
  );
}
