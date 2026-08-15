import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { BookOpen, Bookmark, Camera, Luggage, MapPin } from 'lucide-react';

import { PlaceCard } from '@/components/place-card';
import { TripCard } from '@/components/trip-card';
import { SearchSection } from '@/components/search/search-section';
import { ErrorMessage } from '@/components/ui/error-message';
import { useSearch, type SearchResults } from '@/hooks/use-search';

const SEARCH_SUGGESTIONS = ['beach', 'summer', 'family', 'hotel'];

const CARD_GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
});

const EMPTY_RESULTS: SearchResults = {
  places: [],
  trips: [],
  journalEntries: [],
  memories: [],
  bucketListItems: [],
};

function formatResultCount(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function SearchPage() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('q')?.trim() ?? '';

  const { data, isLoading, error } = useSearch(query);

  const {
    places = [],
    trips = [],
    journalEntries = [],
    memories = [],
    bucketListItems = [],
  } = data ?? EMPTY_RESULTS;

  const totalResults = useMemo(
    () =>
      places.length +
      trips.length +
      journalEntries.length +
      memories.length +
      bucketListItems.length,
    [
      places.length,
      trips.length,
      journalEntries.length,
      memories.length,
      bucketListItems.length,
    ],
  );

  const summary = useMemo(() => {
    if (totalResults === 0) {
      return 'No matches yet. Try a broader keyword or one of the suggestions below.';
    }

    return [
      `${totalResults} total ${totalResults === 1 ? 'result' : 'results'}`,
      `across ${formatResultCount(places.length, 'place')}`,
      formatResultCount(trips.length, 'trip'),
      formatResultCount(
        journalEntries.length,
        'journal entry',
        'journal entries',
      ),
      formatResultCount(memories.length, 'memory', 'memories'),
      formatResultCount(
        bucketListItems.length,
        'bucket list item',
        'bucket list items',
      ),
    ].join(' ');
  }, [
    totalResults,
    places.length,
    trips.length,
    journalEntries.length,
    memories.length,
    bucketListItems.length,
  ]);

  if (!query) {
    return (
      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Search
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Search your places, trips, journal entries, memories, and bucket
            list items.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Search results
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Showing results for{' '}
          <span className="font-medium text-foreground">
            &quot;{query}&quot;
          </span>
        </p>

        <p className="mt-2 text-sm text-muted-foreground">{summary}</p>
      </div>

      {isLoading && (
        <div
          className="py-12 text-center text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          Searching…
        </div>
      )}

      {error && <ErrorMessage error={error} />}

      {!isLoading && !error && totalResults === 0 && (
        <div className="rounded-xl border border-dashed border-input p-12 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            No results found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Try a different keyword or check your spelling.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SEARCH_SUGGESTIONS.map((suggestion) => (
              <Link
                key={suggestion}
                to={`/search?q=${encodeURIComponent(suggestion)}`}
                className="rounded-full border border bg-card px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-input hover:text-foreground"
              >
                {suggestion}
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !error && totalResults > 0 && (
        <div className="grid gap-8">
          {places.length > 0 && (
            <SearchSection icon={MapPin} title="Places" count={places.length}>
              <div className={CARD_GRID_CLASS}>
                {places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </SearchSection>
          )}

          {trips.length > 0 && (
            <SearchSection icon={Luggage} title="Trips" count={trips.length}>
              <div className={CARD_GRID_CLASS}>
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
                    className="block rounded-xl border border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <h3 className="font-medium text-foreground">
                      {entry.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {entry.content}
                    </p>
                  </Link>
                ))}
              </div>
            </SearchSection>
          )}

          {memories.length > 0 && (
            <SearchSection
              icon={Camera}
              title="Memories"
              count={memories.length}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {memories.map((photo) => {
                  const content = (
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
                          decoding="async"
                          className="h-40 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />

                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-slate-950/10 to-transparent"
                        />

                        <span className="absolute bottom-2 left-2 rounded-full bg-card/90 px-2 py-1 text-[11px] font-medium text-slate-700">
                          {photo.placeId ? 'Memory' : 'Gallery'}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col p-3">
                        <p className="truncate text-sm font-medium text-foreground">
                          {photo.caption ?? 'Photo memory'}
                        </p>

                        <time
                          dateTime={photo.createdAt}
                          className="mt-1 text-xs text-muted-foreground"
                        >
                          {dateFormatter.format(new Date(photo.createdAt))}
                        </time>

                        <p className="mt-2 text-xs font-medium text-primary">
                          {photo.placeId ? 'Open memory →' : 'Gallery photo'}
                        </p>
                      </div>
                    </div>
                  );

                  if (!photo.placeId) {
                    return (
                      <div
                        key={photo.id}
                        className="overflow-hidden rounded-xl border border bg-card shadow-sm"
                      >
                        {content}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={photo.id}
                      to={`/places/${photo.placeId}`}
                      aria-label={`Open memory: ${
                        photo.caption ?? 'Photo memory'
                      }`}
                      className="group block overflow-hidden rounded-xl border border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </SearchSection>
          )}

          {bucketListItems.length > 0 && (
            <SearchSection
              icon={Bookmark}
              title="Bucket list"
              count={bucketListItems.length}
            >
              <div className={CARD_GRID_CLASS}>
                {bucketListItems.map((item) => (
                  <Link
                    key={item.id}
                    to="/bucket-list"
                    className="block rounded-xl border border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <h3 className="font-medium text-foreground">{item.name}</h3>

                    <p className="mt-1 text-sm capitalize text-muted-foreground">
                      {item.category.replace(/_/g, ' ')}
                    </p>

                    {item.notes && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {item.notes}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </SearchSection>
          )}
        </div>
      )}
    </div>
  );
}
