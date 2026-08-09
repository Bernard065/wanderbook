import { Compass, Sparkles } from 'lucide-react';
import { TripCard } from '@/components/trip-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { useTrips } from '@/hooks/use-trips';
import { useSharedTrips } from '@/hooks/use-trip-shares';

export function TripsPage() {
  const { data: trips, isLoading, error } = useTrips();
  const { data: sharedTrips } = useSharedTrips();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Trips</h1>
        <p className="text-sm text-slate-600">
          Shape your travel story around each adventure, from planning to memory
          capture.
        </p>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading trips...</p>}
      {error && <ErrorMessage error={error} />}

      {!isLoading && !error && trips?.length === 0 && (
        <EmptyState
          icon={Compass}
          title="No trips yet"
          description="Create your first itinerary and start turning travel plans into a living journal."
        />
      )}

      {!isLoading && trips && trips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      {sharedTrips && sharedTrips.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="text-lg font-semibold">Shared with me</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sharedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
