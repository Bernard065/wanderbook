import React, { Suspense } from 'react';
import { AlertCircle, Compass, MapPinned } from 'lucide-react';
import { ErrorMessage } from '@/components/ui/error-message';
import { PageHeader } from '@/components/ui/page-header';
import { StatusPanel } from '@/components/ui/status-panel';
import { SurfaceCard } from '@/components/ui/surface-card';
import { usePlaces } from '@/hooks/use-places';

const MapLibreMap = React.lazy(
  () => import('@/components/dashboard/maplibre-map'),
);

export function MapPage() {
  const { data: places, isLoading, error } = usePlaces();

  const placesWithCoords = (places ?? []).filter(
    (p) => p.gpsLat != null && p.gpsLng != null,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Map"
        description="Every place you've visited, plotted on the globe."
        eyebrow="Travel atlas"
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard className="overflow-hidden p-0">
          {isLoading ? (
            <div className="flex h-[70vh] items-center justify-center bg-slate-50">
              <StatusPanel
                title="Preparing your journeys"
                description="The map is loading your saved places."
                icon={<Compass className="h-5 w-5" />}
              />
            </div>
          ) : error ? (
            <div className="flex h-[70vh] items-center justify-center bg-slate-50 p-6">
              <ErrorMessage error={error} />
            </div>
          ) : placesWithCoords.length === 0 ? (
            <div className="flex h-[70vh] items-center justify-center bg-slate-50 p-6">
              <StatusPanel
                title="No map pins yet"
                description="Add latitude and longitude when creating a place to see it here."
                icon={<MapPinned className="h-5 w-5" />}
                tone="warning"
              />
            </div>
          ) : (
            <div className="h-[70vh] overflow-hidden">
              <Suspense
                fallback={
                  <div className="flex h-full w-full items-center justify-center text-sm text-slate-600">
                    Loading map...
                  </div>
                }
              >
                <MapLibreMap
                  places={placesWithCoords}
                  initialZoom={placesWithCoords.length === 1 ? 8 : 2}
                  className="h-full w-full"
                />
              </Suspense>
            </div>
          )}
        </SurfaceCard>

        <div className="space-y-4">
          <StatusPanel
            title="Atlas overview"
            description="Track the places you’ve visited and pick up your next route."
            icon={<AlertCircle className="h-5 w-5" />}
            tone="default"
          />
          <StatusPanel
            title="Added coordinates"
            description={`${placesWithCoords.length} place${placesWithCoords.length === 1 ? '' : 's'} available for the map.`}
            icon={<MapPinned className="h-5 w-5" />}
            tone="success"
          />
        </div>
      </div>
    </div>
  );
}
