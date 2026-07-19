import { useSearchParams, Link } from 'react-router';
import { MapPin, Luggage, BookOpen } from 'lucide-react';
import { PlaceCard } from '@/components/place-card';
import { TripCard } from '@/components/trip-card';
import { useSearch } from '@/hooks/use-search';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { data, isLoading, error } = useSearch(query);

  const totalResults =
    (data?.places.length ?? 0) +
    (data?.trips.length ?? 0) +
    (data?.journalEntries.length ?? 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Search results</h1>
      <p className="text-gray-500 mb-6">
        {query ? `Showing results for "${query}"` : 'Enter a search term'}
      </p>

      {isLoading && <p>Searching...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}

      {!isLoading && query && totalResults === 0 && (
        <p className="text-gray-500">No results found.</p>
      )}

      {data && data.places.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4" /> Places
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      )}

      {data && data.trips.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Luggage className="h-4 w-4" /> Trips
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}

      {data && data.journalEntries.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4" /> Journal entries
          </h2>
          <div className="space-y-3">
            {data.journalEntries.map((entry) => (
              <Link
                key={entry.id}
                to={`/places/${entry.placeId}`}
                className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <p className="font-medium">{entry.title}</p>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {entry.content}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
