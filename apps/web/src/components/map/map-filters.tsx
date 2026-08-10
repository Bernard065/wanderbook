import { useMemo } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type {
  MapFilterOptions,
  MapFilterState,
} from '@/hooks/use-map-data';

interface MapFiltersProps {
  filters: MapFilterState;
  options: MapFilterOptions;
  onChange: (
    filter: keyof MapFilterState,
    value: string,
  ) => void;
}

export function MapFilters({
  filters,
  options,
  onChange,
}: MapFiltersProps) {
  const selectedTripName = useMemo(() => {
    if (filters.trip === 'all') {
      return 'All trips';
    }

    return (
      options.trips.find(
        (trip) => trip.id === filters.trip,
      )?.name ?? 'All trips'
    );
  }, [filters.trip, options.trips]);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Country */}
      <div className="space-y-2">
        <label
          htmlFor="map-country-filter"
          className="text-sm font-semibold text-slate-900"
        >
          Country
        </label>

        <Select
          value={filters.country}
          onValueChange={(value) =>
            onChange('country', value)
          }
        >
          <SelectTrigger
            id="map-country-filter"
            className="w-full"
            size="sm"
          >
            <SelectValue placeholder="All countries" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All countries
            </SelectItem>

            {options.countries.map((country) => (
              <SelectItem
                key={country}
                value={country}
              >
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trip */}
      <div className="space-y-2">
        <label
          htmlFor="map-trip-filter"
          className="text-sm font-semibold text-slate-900"
        >
          Trip
        </label>

        <Select
          value={filters.trip}
          onValueChange={(value) =>
            onChange('trip', value)
          }
        >
          <SelectTrigger
            id="map-trip-filter"
            className="w-full"
            size="sm"
          >
            <SelectValue placeholder="All trips">
              {selectedTripName}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All trips
            </SelectItem>

            {options.trips.map((trip) => (
              <SelectItem
                key={trip.id}
                value={trip.id}
              >
                {trip.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year */}
      <div className="space-y-2">
        <label
          htmlFor="map-year-filter"
          className="text-sm font-semibold text-slate-900"
        >
          Year
        </label>

        <Select
          value={filters.year}
          onValueChange={(value) =>
            onChange('year', value)
          }
        >
          <SelectTrigger
            id="map-year-filter"
            className="w-full"
            size="sm"
          >
            <SelectValue placeholder="All years" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All years
            </SelectItem>

            {options.years.map((year) => (
              <SelectItem
                key={year}
                value={year}
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
