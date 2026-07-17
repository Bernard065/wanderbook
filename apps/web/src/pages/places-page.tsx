import { PlaceCard } from '@/components/place-card';
import { usePlaces } from '@/hooks/use-places';

export function PlacesPage() {
  const { data: places, isLoading, error } = usePlaces();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Places</h1>

      {isLoading && <p>Loading places...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {places?.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
}
