'use client';
import { useLocations } from '@/lib/hooks/useLocations';
import { LocationCard } from '@/components/locations/LocationCard';
import { PageHeader } from '@/components/shared/PageHeader';

export default function LocationsPage() {
  const { data, isLoading } = useLocations();
  return (
    <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto">
      <PageHeader eyebrow="From the gazetteer" title="Locations" />
      {isLoading ? (
        <div className="text-vellum-dim italic">Loading the maps…</div>
      ) : !data || data.length === 0 ? (
        <div className="text-vellum-dim italic py-12 text-center panel rounded-sm">
          No locations yet recorded.
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {data.map(l => <LocationCard key={l.id} location={l} />)}
        </div>
      )}
    </div>
  );
}
