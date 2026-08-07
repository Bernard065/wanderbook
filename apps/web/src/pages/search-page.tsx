import { Link, useSearchParams } from 'react-router';
import { BookOpen, Camera, Luggage, MapPin } from 'lucide-react';

import { PlaceCard } from '@/components/place-card';
import { TripCard } from '@/components/trip-card';
import { useSearch } from '@/hooks/use-search';

const SearchSection = ({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  children: React.ReactNode;
}) => {
  return (
    <section className="mb-10">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Icon className="h-5 w-5" />
        <span>{title}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {count}
        </span>
      </h2>
      {children}
    </section>
  );
}

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';

  const { data, isLoading, error } = useSearch(query);

  const {
    places = [],
    trips = [],
    journalEntries = [],
    photos = [],
  } = data ?? {};

  const totalResults =
    places.length +
    trips.length +
    journalEntries.length +
    photos.length;

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  });

  if (!query) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <h1 className="mb-2 text-3xl font-bold">Search</h1>
        <p className="text-slate-500">
          Search your places, trips, journal entries, and photos.
        </p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="mb-1 text-2xl font-bold">Search results</h1>
        <p className="text-slate-500">
          Showing results for{' '}
          <span className="font-medium text-slate-900">"{query}"</span>
        </p>
      </header>

      {isLoading && (
        <div className="py-12 text-center text-slate-500">
          Searching…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error.message}
        </div>
      )}

      {!isLoading && !error && totalResults === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h2 className="mb-2 text-lg font-semibold">No results found</h2>
          <p className="text-slate-500">
            Try a different keyword or check your spelling.
          </p>
        </div>
      )}

      {!isLoading && !error && totalResults > 0 && (
        <>
          {places.length > 0 && (
            <SearchSection
              icon={MapPin}
              title="Places"
              count={places.length}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </SearchSection>
          )}

          {trips.length > 0 && (
            <SearchSection
              icon={Luggage}
              title="Trips"
              count={trips.length}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </SearchSection>
          )}

          {journalEntries.length > 0 && (
            <SearchSection
              icon={BookOpen}
              title="Journal entries"
              count={journalEntries.length}
            >
              <div className="space-y-3">
                {journalEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/places/${entry.placeId}`}
                    className="block rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <h3 className="font-medium">{entry.title}</h3>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {entry.content}
                    </p>
                  </Link>
                ))}
              </div>
            </SearchSection>
          )}

          {photos.length > 0 && (
            <SearchSection
              icon={Camera}
              title="Photos"
              count={photos.length}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo) => {
                  const card = (
                    <>
                      <img
                        src={photo.url}
                        alt={
                          photo.caption
                            ? `Photo: ${photo.caption}`
                            : 'Travel photo'
                        }
                        loading="lazy"
                        className="h-36 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />

                      <div className="p-3">
                        <p className="truncate text-sm font-medium">
                          {photo.caption ?? 'Photo memory'}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {dateFormatter.format(
                            new Date(photo.createdAt)
                          )}
                        </p>
                      </div>
                    </>
                  );

                  if (!photo.placeId) {
                    return (
                      <div
                        key={photo.id}
                        className="overflow-hidden rounded-lg border bg-white shadow-sm"
                      >
                        {card}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={photo.id}
                      to={`/places/${photo.placeId}`}
                      className="group block overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      {card}
                    </Link>
                  );
                })}
              </div>
            </SearchSection>
          )}
        </>
      )}
    </div>
  );
}
