import { Link, useSearchParams } from 'react-router';
import { BookOpen, Camera, Luggage, MapPin } from 'lucide-react';

import { PlaceCard } from '@/components/place-card';
import { TripCard } from '@/components/trip-card';
import { useSearch, type SearchResults } from '@/hooks/use-search';

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
};

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';

  const { data, isLoading, error } = useSearch(query);

  const {
    places = [],
    trips = [],
    journalEntries = [],
    photos = [],
  }: SearchResults = data ?? {
    places: [],
    trips: [],
    journalEntries: [],
    photos: [],
  };

  const totalResults =
    places.length + trips.length + journalEntries.length + photos.length;

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
        <p className="mt-2 text-sm text-slate-500">
          {totalResults === 0
            ? 'No matches yet. Try a broader keyword or one of the suggestions below.'
            : `${totalResults} total result${totalResults === 1 ? '' : 's'} across ${places.length} place${places.length === 1 ? '' : 's'}, ${trips.length} trip${trips.length === 1 ? '' : 's'}, ${journalEntries.length} journal entr${journalEntries.length === 1 ? 'y' : 'ies'}, and ${photos.length} photo${photos.length === 1 ? '' : 's'}.`}
        </p>
      </header>

      {isLoading && (
        <div className="py-12 text-center text-slate-500">Searching…</div>
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
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
            {['beach', 'summer', 'family', 'hotel'].map((suggestion) => (
              <Link
                key={suggestion}
                to={`/search?q=${encodeURIComponent(suggestion)}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                {suggestion}
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !error && totalResults > 0 && (
        <>
          {places.length > 0 && (
            <SearchSection icon={MapPin} title="Places" count={places.length}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </SearchSection>
          )}

          {trips.length > 0 && (
            <SearchSection icon={Luggage} title="Trips" count={trips.length}>
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
            <SearchSection icon={Camera} title="Photos" count={photos.length}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo) => {
                  const card = (
                    <div className="flex h-full flex-col">
                      <div className="relative overflow-hidden">
                        <img
                          src={photo.url}
                          alt={
                            photo.caption
                              ? `Photo: ${photo.caption}`
                              : 'Travel photo'
                          }
                          loading="lazy"
                          className="h-40 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-700">
                          {photo.placeId ? 'Memory' : 'Gallery'}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col p-3">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {photo.caption ?? 'Photo memory'}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {dateFormatter.format(new Date(photo.createdAt))}
                        </p>

                        <p className="mt-2 text-xs font-medium text-blue-600">
                          Open memory →
                        </p>
                      </div>
                    </div>
                  );

                  if (!photo.placeId) {
                    return (
                      <div
                        key={photo.id}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                      >
                        {card}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={photo.id}
                      to={`/places/${photo.placeId}`}
                      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
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
