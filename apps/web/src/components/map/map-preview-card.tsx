import {
  Globe2,
  Layers,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useMemo } from 'react';

import { SurfaceCard } from '@/components/ui/surface-card';
import type { MapMarker } from '@/hooks/use-map-data';

import type { Place, Trip } from '@org/types';

interface MapPreviewCardProps {
  marker: MapMarker | null;
  places: Place[];
  trips: Trip[];
}

function formatLocation(marker: MapMarker): string {
  if (marker.type === 'place') {
    return [marker.city, marker.country]
      .filter(Boolean)
      .join(', ');
  }

  if (marker.type === 'city') {
    return marker.label;
  }

  return marker.country;
}

function getMarkerIcon(marker: MapMarker) {
  switch (marker.type) {
    case 'country':
      return Globe2;

    case 'city':
      return Layers;

    case 'place':
      return MapPin;

    default:
      return MapPin;
  }
}

function getMarkerTypeLabel(marker: MapMarker): string {
  switch (marker.type) {
    case 'country':
      return 'Country';

    case 'city':
      return 'City';

    case 'place':
      return 'Place';

    default:
      return 'Location';
  }
}

export function MapPreviewCard({
  marker,
  places,
  trips,
}: MapPreviewCardProps) {
  const selectedPlaces = useMemo(() => {
    if (!marker) {
      return [];
    }

    const placesById = new Map(
      places.map((place) => [place.id, place]),
    );

    return marker.placeIds
      .map((placeId) => placesById.get(placeId))
      .filter((place): place is Place => Boolean(place));
  }, [marker, places]);

  const markerTrips = useMemo(() => {
    if (!marker) {
      return [];
    }

    const markerPlaceIds = new Set(marker.placeIds);

    return trips.filter((trip) =>
      trip.places.some((place) =>
        markerPlaceIds.has(place.id),
      ),
    );
  }, [marker, trips]);

  if (!marker) {
    return (
      <SurfaceCard>
        <div className="flex min-h-48 flex-col items-center justify-center px-6 py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100">
            <MapPin
              className="size-5 text-slate-500"
              aria-hidden="true"
            />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Select a marker
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Tap any marker to see the place preview and
            trip details.
          </p>
        </div>
      </SurfaceCard>
    );
  }

  const Icon = getMarkerIcon(marker);

  const headline =
    marker.type === 'place'
      ? selectedPlaces[0]?.name ?? marker.label
      : marker.type === 'city'
        ? marker.label
        : marker.country;

  const subtitle =
    marker.type === 'place'
      ? formatLocation(marker)
      : marker.type === 'city'
        ? `${marker.count} place${
            marker.count === 1 ? '' : 's'
          } in this city`
        : `${marker.count} place${
            marker.count === 1 ? '' : 's'
          } in this country`;

  return (
    <SurfaceCard>
      <div className="space-y-5">
        <header className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Icon
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {getMarkerTypeLabel(marker)}
            </p>

            <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">
              {headline}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          </div>
        </header>

        {marker.type === 'place' &&
        selectedPlaces[0] ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">
              {selectedPlaces[0].description ??
                'A memorable place from your travels.'}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Visited
                </p>

                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {selectedPlaces[0].visitCount ?? 1}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Trips
                </p>

                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {markerTrips.length}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">
              Explore{' '}
              {marker.type === 'country'
                ? 'a country-level summary'
                : 'a city-level summary'}{' '}
              and review the places visited there.
            </p>

            <div className="space-y-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <Sparkles
                    className="size-4"
                    aria-hidden="true"
                  />

                  <span className="text-sm font-semibold">
                    Top places
                  </span>
                </div>

                {selectedPlaces.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {selectedPlaces
                      .slice(0, 3)
                      .map((place) => (
                        <li
                          key={place.id}
                          className="flex items-start gap-2"
                        >
                          <span
                            className="mt-2 size-1 shrink-0 rounded-full bg-slate-400"
                            aria-hidden="true"
                          />

                          <span>{place.name}</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No places recorded yet.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <MapPin
                    className="size-4"
                    aria-hidden="true"
                  />

                  <span className="text-sm font-semibold">
                    Places visited
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-700">
                  {selectedPlaces.length}{' '}
                  {selectedPlaces.length === 1
                    ? 'place'
                    : 'places'}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <Layers
                    className="size-4"
                    aria-hidden="true"
                  />

                  <span className="text-sm font-semibold">
                    Trips touched
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-700">
                  {markerTrips.length}{' '}
                  {markerTrips.length === 1
                    ? 'trip'
                    : 'trips'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
