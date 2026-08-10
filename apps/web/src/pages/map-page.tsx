import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Compass,
  MapPin,
  Sparkles,
} from 'lucide-react';

import { ErrorMessage } from '@/components/ui/error-message';
import { PageHeader } from '@/components/ui/page-header';
import { StatusPanel } from '@/components/ui/status-panel';
import { SurfaceCard } from '@/components/ui/surface-card';

import { MapFilters } from '@/components/map/map-filters';
import { MapPreviewCard } from '@/components/map/map-preview-card';

import { useMapData, type MapFilterState } from '@/hooks/use-map-data';
import { usePlaces } from '@/hooks/use-places';
import { useTrips } from '@/hooks/use-trips';

const MapLibreWorldMap = lazy(() =>
  import('@/components/map/maplibre-world-map').then(
    ({ MapLibreWorldMap }) => ({
      default: MapLibreWorldMap,
    }),
  ),
);

const INITIAL_FILTERS: MapFilterState = {
  country: 'all',
  trip: 'all',
  year: 'all',
};

type FilterField = keyof MapFilterState;

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
}

function StatCard({
  label,
  value,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`rounded-3xl border bg-muted/50 p-4 ${className}`}
    >
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

export function MapPage() {
  const {
    data: places = [],
    isLoading: placesLoading,
    error: placesError,
  } = usePlaces();

  const {
    data: trips = [],
    isLoading: tripsLoading,
    error: tripsError,
  } = useTrips();

  const [filters, setFilters] =
    useState<MapFilterState>(INITIAL_FILTERS);

  const [selectedMarkerId, setSelectedMarkerId] =
    useState<string | null>(null);

  const {
    markers,
    stats,
    filterOptions,
  } = useMapData(
    places,
    trips,
    filters,
  );

  useEffect(() => {
    if (
      selectedMarkerId &&
      !markers.some(
        (marker) => marker.id === selectedMarkerId,
      )
    ) {
      setSelectedMarkerId(null);
    }
  }, [markers, selectedMarkerId]);

  const selectedMarker = useMemo(
    () =>
      markers.find(
        (marker) => marker.id === selectedMarkerId,
      ) ?? null,
    [markers, selectedMarkerId],
  );

  const isLoading = placesLoading || tripsLoading;
  const error = placesError ?? tripsError;

  const handleFilterChange = (
    field: FilterField,
    value: string,
  ) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const statistics = [
    {
      label: 'Countries visited',
      value: stats.countriesVisited,
    },
    {
      label: 'Cities visited',
      value: stats.citiesVisited,
    },
    {
      label: 'Places visited',
      value: stats.placesVisited,
    },
    {
      label: 'Days traveled',
      value: stats.daysTraveled,
    },
  ];

  const formattedDistance =
    `${stats.distanceTraveled.toLocaleString()} km`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Travel Map"
        description="Explore the places you've visited and see your journeys come to life."
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <SurfaceCard className="overflow-hidden p-0">
          {isLoading ? (
            <div className="flex h-[70vh] items-center justify-center bg-muted/30">
              <StatusPanel
                title="Preparing your journeys"
                description="The map is loading your saved places and trips."
                icon={
                  <Compass
                    className="size-5"
                    aria-hidden="true"
                  />
                }
              />
            </div>
          ) : error ? (
            <div className="flex h-[70vh] items-center justify-center bg-muted/30 p-6">
              <ErrorMessage error={error} />
            </div>
          ) : (
            <div className="h-[70vh] overflow-hidden">
              <Suspense
                fallback={
                  <div className="flex h-full w-full items-center justify-center bg-muted/30">
                    <StatusPanel
                      title="Loading map"
                      description="Preparing your travel map..."
                      icon={
                        <MapPin
                          className="size-5"
                          aria-hidden="true"
                        />
                      }
                    />
                  </div>
                }
              >
                <MapLibreWorldMap
                  markers={markers}
                  selectedMarkerId={selectedMarkerId}
                  onSelectMarker={setSelectedMarkerId}
                  initialZoom={2}
                  className="h-full w-full"
                />
              </Suspense>
            </div>
          )}
        </SurfaceCard>

        <div className="space-y-4">
          <SurfaceCard>
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">
                  Map filters
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Narrow markers by country, trip, or year.
                </p>
              </div>

              <MapFilters
                filters={filters}
                options={filterOptions}
                onChange={handleFilterChange}
              />
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2 className="text-base font-semibold">
                    Travel summary
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Your key travel totals from the current
                    filters.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {statistics.map((stat) => (
                  <StatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                  />
                ))}

                <StatCard
                  label="Distance traveled"
                  value={formattedDistance}
                  className="sm:col-span-2"
                />
              </div>
            </div>
          </SurfaceCard>

          <MapPreviewCard
            marker={selectedMarker}
            places={places}
            trips={trips}
          />
        </div>
      </div>
    </div>
  );
}
