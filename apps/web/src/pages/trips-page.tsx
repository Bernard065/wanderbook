import { TripCard } from '@/components/trip-card';
import { useTrips } from '@/hooks/use-trips';
import { useSharedTrips } from '@/hooks/use-trip-shares';

export function TripsPage() {
  const { data: trips, isLoading, error } = useTrips();
  const { data: sharedTrips } = useSharedTrips();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Trips</h1>

      {isLoading && <p>Loading trips...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {trips?.length === 0 && (
        <p className="text-gray-500">
          No trips yet. Use "Add New" to plan your first one.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {trips?.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>

      {sharedTrips && sharedTrips.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Shared with me</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sharedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
