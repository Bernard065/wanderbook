import { useMemo, useState } from 'react';
import { Compass, Sparkles } from 'lucide-react';

import { AddTripDialog } from '@/components/add-trip-dialog';
import { TripCard } from '@/components/trip-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useAllJournalEntries } from '@/hooks/use-journal-entries';
import { usePhotos } from '@/hooks/use-photos';
import { useTrips } from '@/hooks/use-trips';

import type { Trip } from '@org/types';

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

interface TripWithMetadata extends Trip {
  coverUrl?: string;
  destination: string;
  memoriesCount: number;
  yearValues: string[];
  countryValues: string[];
  searchText: string;
}

const sortOptions: Array<{
  value: SortOption;
  label: string;
}> = [
  {
    value: 'newest',
    label: 'Newest start date',
  },
  {
    value: 'oldest',
    label: 'Oldest start date',
  },
  {
    value: 'name-asc',
    label: 'Name A–Z',
  },
  {
    value: 'name-desc',
    label: 'Name Z–A',
  },
];

function getValidDateTime(value?: string | null): number | null {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? null : time;
}

export function TripsPage() {
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const { data: trips, isLoading, error } = useTrips();

  const { data: photos } = usePhotos();
  const { data: journalEntries } = useAllJournalEntries();

  /**
   * Group photos by place.
   */
  const photosByPlaceId = useMemo(() => {
    const map = new Map<string, string[]>();

    (photos ?? []).forEach((photo) => {
      if (!photo.placeId || !photo.url) {
        return;
      }

      const current = map.get(photo.placeId) ?? [];

      current.push(photo.url);
      map.set(photo.placeId, current);
    });

    return map;
  }, [photos]);

  /**
   * Count journal entries by place.
   */
  const journalCountByPlaceId = useMemo(() => {
    const map = new Map<string, number>();

    (journalEntries ?? []).forEach((entry) => {
      if (!entry.placeId) {
        return;
      }

      map.set(entry.placeId, (map.get(entry.placeId) ?? 0) + 1);
    });

    return map;
  }, [journalEntries]);

  /**
   * Build the additional metadata needed by each trip card
   * and by the filters/search system.
   */
  const derivedTrips = useMemo<TripWithMetadata[]>(() => {
    if (!trips) {
      return [];
    }

    return trips.map((trip) => {
      const placeIds = trip.places.map((place) => place.id);

      const yearValues = new Set<string>();

      const startDate = getValidDateTime(trip.startDate);

      if (startDate !== null) {
        yearValues.add(String(new Date(startDate).getFullYear()));
      }

      const endDate = getValidDateTime(trip.endDate);

      if (endDate !== null) {
        yearValues.add(String(new Date(endDate).getFullYear()));
      }

      const photosCount = placeIds.reduce(
        (count, placeId) => count + (photosByPlaceId.get(placeId)?.length ?? 0),
        0,
      );

      const journalCount = placeIds.reduce(
        (count, placeId) => count + (journalCountByPlaceId.get(placeId) ?? 0),
        0,
      );

      /**
       * First photo belonging to any place in the trip
       * becomes the trip cover.
       */
      const coverUrl = placeIds.flatMap(
        (placeId) => photosByPlaceId.get(placeId) ?? [],
      )[0];

      const firstPlace = trip.places[0];

      const destination = firstPlace
        ? [firstPlace.city, firstPlace.country].filter(Boolean).join(', ') ||
          'Unknown destination'
        : 'Unknown destination';

      const searchText = [
        trip.name,
        destination,
        trip.places
          .map((place) => place.name)
          .filter(Boolean)
          .join(' '),
        trip.places
          .map((place) => place.city)
          .filter(Boolean)
          .join(' '),
        trip.places
          .map((place) => place.country)
          .filter(Boolean)
          .join(' '),
      ]
        .join(' ')
        .toLowerCase();

      const countryValues = Array.from(
        new Set(trip.places.map((place) => place.country).filter(Boolean)),
      ) as string[];

      return {
        ...trip,
        coverUrl,
        destination,
        memoriesCount: photosCount + journalCount,
        yearValues: Array.from(yearValues),
        countryValues,
        searchText,
      };
    });
  }, [trips, photosByPlaceId, journalCountByPlaceId]);

  /**
   * Available years.
   */
  const years = useMemo(
    () =>
      Array.from(new Set(derivedTrips.flatMap((trip) => trip.yearValues))).sort(
        (a, b) => Number(b) - Number(a),
      ),
    [derivedTrips],
  );

  /**
   * Available countries.
   */
  const countries = useMemo(
    () =>
      Array.from(
        new Set(derivedTrips.flatMap((trip) => trip.countryValues)),
      ).sort((a, b) => a.localeCompare(b)),
    [derivedTrips],
  );

  const normalizedSearch = search.trim().toLowerCase();

  /**
   * Apply search and filters.
   */
  const filteredTrips = useMemo(
    () =>
      derivedTrips.filter((trip) => {
        const matchesSearch =
          normalizedSearch === '' || trip.searchText.includes(normalizedSearch);

        const matchesYear =
          yearFilter === 'all' || trip.yearValues.includes(yearFilter);

        const matchesCountry =
          countryFilter === 'all' || trip.countryValues.includes(countryFilter);

        return matchesSearch && matchesYear && matchesCountry;
      }),
    [derivedTrips, normalizedSearch, yearFilter, countryFilter],
  );

  /**
   * Sort filtered trips.
   */
  const sortedTrips = useMemo(() => {
    return [...filteredTrips].sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }

      const aTime = getValidDateTime(a.startDate) ?? 0;

      const bTime = getValidDateTime(b.startDate) ?? 0;

      return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
    });
  }, [filteredTrips, sortBy]);

  const noTripsYet = !isLoading && !error && trips?.length === 0;

  const noResults =
    !isLoading && !error && Boolean(trips?.length) && sortedTrips.length === 0;

  const clearFilters = () => {
    setSearch('');
    setYearFilter('all');
    setCountryFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title="Trips"
        description="Shape your travel story around each adventure, from planning to memory capture."
        action={
          <AddTripDialog>
            <Button>
              <Compass className="h-4 w-4" />
              Create Trip
            </Button>
          </AddTripDialog>
        }
      />

      {/* Search and filters */}
      <div className="space-y-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Search trips, destinations, and places"
          aria-label="Search trips"
        />

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Year */}
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger
              size="sm"
              className="w-full"
              aria-label="Filter by year"
            >
              <SelectValue placeholder="All years" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All years</SelectItem>

              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Country */}
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger
              size="sm"
              className="w-full"
              aria-label="Filter by country"
            >
              <SelectValue placeholder="All countries" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>

              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger size="sm" className="w-full" aria-label="Sort trips">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>

            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="overflow-hidden rounded-xl border border bg-card"
            >
              <div className="aspect-video animate-pulse bg-muted" />

              <div className="space-y-4 p-4">
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-muted" />

                <div className="space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-muted" />
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                  <div className="h-5 animate-pulse rounded bg-muted" />
                  <div className="h-5 animate-pulse rounded bg-muted" />
                  <div className="h-5 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <ErrorMessage error={error} />}

      {/* No trips */}
      {noTripsYet && (
        <EmptyState
          icon={Compass}
          title="No trips yet"
          description="Create your first itinerary and start turning travel plans into a living journal."
          action={
            <AddTripDialog>
              <Button>Create your first trip</Button>
            </AddTripDialog>
          }
        />
      )}

      {/* No search results */}
      {noResults && (
        <EmptyState
          icon={Sparkles}
          title="No matching trips"
          description="Try a different search or clear the filters to see more results."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      )}

      {/* Trips */}
      {!isLoading && sortedTrips.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              coverUrl={trip.coverUrl}
              destination={trip.destination}
              memoriesCount={trip.memoriesCount}
            />
          ))}
        </div>
      )}

      {/* Result count */}
      {!isLoading && sortedTrips.length > 0 && trips?.length ? (
        <div className="text-sm text-muted-foreground">
          Showing {sortedTrips.length} of {trips.length} trips
        </div>
      ) : null}
    </div>
  );
}
