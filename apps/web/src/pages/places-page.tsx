import { MapPin } from 'lucide-react';

import { PlaceCard } from '@/components/place-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { usePlaces } from '@/hooks/use-places';

export function PlacesPage() {
  const { data: places = [], isLoading, error } = usePlaces();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Places
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore the places you have visited and the memories attached to them.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="overflow-hidden rounded-xl border border bg-card"
            >
              <div className="h-40 animate-pulse bg-muted" />

              <div className="space-y-3 p-4">
                <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !isLoading && <ErrorMessage error={error} />}

      {!isLoading && !error && places.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="No places yet"
          description="Add your first place to start capturing locations, notes, photos, and memories."
        />
      )}

      {!isLoading && !error && places.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}
