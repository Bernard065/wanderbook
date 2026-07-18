import { TripCard } from '@/components/trip-card';
import { useTrips } from '@/hooks/use-trips';

export function TripsPage() {
  const { data: trips, isLoading, error } = useTrips();

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
    </div>
  );
}
