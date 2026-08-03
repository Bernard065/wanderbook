import React, { Suspense } from 'react';
import { usePlaces } from '@/hooks/use-places';

const LeafletMap = React.lazy(
  () => import('@/components/dashboard/leaflet-map'),
);

export function MapPage() {
  const { data: places, isLoading, error } = usePlaces();

  const placesWithCoords = (places ?? []).filter(
    (p) => p.gpsLat != null && p.gpsLng != null,
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Map</h1>
      <p className="text-gray-500 mb-6">
        Every place you've visited, plotted on the globe.
      </p>

      {isLoading && <p>Loading map...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {!isLoading && placesWithCoords.length === 0 && (
        <p className="text-gray-500">
          No places with GPS coordinates yet. Add latitude/longitude when
          creating a place to see it here.
        </p>
      )}

      {placesWithCoords.length > 0 && (
        <div className="h-[70vh] rounded-lg overflow-hidden border">
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                Loading map...
              </div>
            }
          >
            <LeafletMap
              places={placesWithCoords}
              initialZoom={placesWithCoords.length === 1 ? 8 : 2}
              className="h-full w-full"
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
