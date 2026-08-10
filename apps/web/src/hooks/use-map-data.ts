import { useMemo } from 'react';
import type { Place, Trip } from '@org/types';

export type MapMarkerType = 'country' | 'city' | 'place';

export interface MapMarker {
  id: string;
  type: MapMarkerType;
  label: string;
  country: string;
  city?: string;
  coordinates: [number, number];
  placeIds: string[];
  tripIds: string[];
  count: number;
}

export interface MapFilterState {
  country: string;
  trip: string;
  year: string;
}

export interface MapFilterOptions {
  countries: string[];
  trips: { id: string; name: string }[];
  years: string[];
}

export interface MapStats {
  countriesVisited: number;
  citiesVisited: number;
  placesVisited: number;
  daysTraveled: number;
  distanceTraveled: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getYear(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.getFullYear().toString();
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
) {
  const earthRadiusKm = 6371;
  const dLat = degreesToRadians(end.lat - start.lat);
  const dLng = degreesToRadians(end.lng - start.lng);
  const lat1 = degreesToRadians(start.lat);
  const lat2 = degreesToRadians(end.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function asCoordinate(place: Place) {
  return [place.gpsLng as number, place.gpsLat as number] as [number, number];
}

function averageCoordinates(places: Place[]): [number, number] {
  const coords = places.filter(
    (place) => place.gpsLat != null && place.gpsLng != null,
  );
  if (coords.length === 0) {
    return [0, 0];
  }

  const total = coords.reduce(
    (acc, place) => {
      return {
        lat: acc.lat + (place.gpsLat as number),
        lng: acc.lng + (place.gpsLng as number),
      };
    },
    { lat: 0, lng: 0 },
  );

  return [total.lng / coords.length, total.lat / coords.length];
}

function sortYears(values: string[]) {
  return Array.from(new Set(values))
    .filter(Boolean)
    .sort((left, right) => Number(right) - Number(left));
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values))
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
}

function buildPlaceMap(places: Place[], trips: Trip[]) {
  const map = new Map<string, Place>();

  places.forEach((place) => {
    map.set(place.id, place);
  });

  trips.forEach((trip) => {
    trip.places?.forEach((place) => {
      if (!map.has(place.id)) {
        map.set(place.id, place);
      }
    });
  });

  return map;
}

function isValidCoordinate(place: Place) {
  return place.gpsLat != null && place.gpsLng != null;
}

export function useMapData(
  places: Place[],
  trips: Trip[],
  filters: MapFilterState,
) {
  const placeById = useMemo(
    () => buildPlaceMap(places, trips),
    [places, trips],
  );
  const allPlaces = useMemo(() => Array.from(placeById.values()), [placeById]);

  const tripMap = useMemo(
    () => new Map(trips.map((trip) => [trip.id, trip])),
    [trips],
  );

  const placeTripIds = useMemo(() => {
    const map = new Map<string, string[]>();

    trips.forEach((trip) => {
      trip.places?.forEach((place) => {
        const existing = map.get(place.id) ?? [];
        map.set(place.id, Array.from(new Set([...existing, trip.id])));
      });
    });

    return map;
  }, [trips]);

  const activeTrip =
    filters.trip === 'all' ? undefined : tripMap.get(filters.trip);

  const placeYearIds = useMemo(
    () =>
      new Set(
        allPlaces
          .filter((place) => getYear(place.createdAt) === filters.year)
          .map((place) => place.id),
      ),
    [allPlaces, filters.year],
  );

  const tripYearIds = useMemo(
    () =>
      new Set(
        trips
          .filter((trip) =>
            [trip.startDate, trip.endDate].some(
              (date) => date != null && getYear(date) === filters.year,
            ),
          )
          .map((trip) => trip.id),
      ),
    [trips, filters.year],
  );

  const filteredPlaces = useMemo(() => {
    return allPlaces.filter((place) => {
      if (filters.country !== 'all' && place.country !== filters.country) {
        return false;
      }

      if (activeTrip && !placeTripIds.get(place.id)?.includes(activeTrip.id)) {
        return false;
      }

      if (filters.year !== 'all') {
        const placeYearMatch = placeYearIds.has(place.id);
        const tripYearMatch = placeTripIds
          .get(place.id)
          ?.some((tripId) => tripYearIds.has(tripId));

        if (!placeYearMatch && !tripYearMatch) {
          return false;
        }
      }

      return true;
    });
  }, [
    allPlaces,
    activeTrip,
    filters.country,
    filters.year,
    placeTripIds,
    placeYearIds,
    tripYearIds,
  ]);

  const countryMarkers = useMemo(() => {
    const groups = new Map<string, Place[]>();

    filteredPlaces.forEach((place) => {
      const country = place.country.trim();
      const current = groups.get(country) ?? [];
      current.push(place);
      groups.set(country, current);
    });

    return Array.from(groups.entries())
      .filter(([, placesForCountry]) =>
        placesForCountry.some(isValidCoordinate),
      )
      .map(([country, placesForCountry]) => {
        const coords = averageCoordinates(placesForCountry);
        const placeIds = Array.from(
          new Set(placesForCountry.map((place) => place.id)),
        );
        const tripIds = Array.from(
          new Set(
            placesForCountry.flatMap(
              (place) => placeTripIds.get(place.id) ?? [],
            ),
          ),
        );

        return {
          id: `country-${country}`,
          type: 'country' as const,
          label: country,
          country,
          coordinates: coords,
          placeIds,
          tripIds,
          count: placeIds.length,
        };
      });
  }, [filteredPlaces, placeTripIds]);

  const cityMarkers = useMemo(() => {
    const groups = new Map<string, Place[]>();

    filteredPlaces.forEach((place) => {
      const city = place.city?.trim();
      if (!city) {
        return;
      }

      const groupKey = `${city} • ${place.country}`;
      const current = groups.get(groupKey) ?? [];
      current.push(place);
      groups.set(groupKey, current);
    });

    return Array.from(groups.entries())
      .filter(([, placesForCity]) => placesForCity.some(isValidCoordinate))
      .map(([groupKey, placesForCity]) => {
        const coords = averageCoordinates(placesForCity);
        const placeIds = Array.from(
          new Set(placesForCity.map((place) => place.id)),
        );
        const tripIds = Array.from(
          new Set(
            placesForCity.flatMap((place) => placeTripIds.get(place.id) ?? []),
          ),
        );

        return {
          id: `city-${groupKey}`,
          type: 'city' as const,
          label: groupKey,
          country: placesForCity[0].country,
          city: placesForCity[0].city,
          coordinates: coords,
          placeIds,
          tripIds,
          count: placeIds.length,
        };
      });
  }, [filteredPlaces, placeTripIds]);

  const placeMarkers = useMemo(
    () =>
      filteredPlaces.filter(isValidCoordinate).map((place) => ({
        id: `place-${place.id}`,
        type: 'place' as const,
        label: place.name,
        country: place.country,
        city: place.city,
        coordinates: asCoordinate(place),
        placeIds: [place.id],
        tripIds: placeTripIds.get(place.id) ?? [],
        count: 1,
      })),
    [filteredPlaces, placeTripIds],
  );

  const markers = useMemo(
    () => [...countryMarkers, ...cityMarkers, ...placeMarkers],
    [countryMarkers, cityMarkers, placeMarkers],
  );

  const filteredTrips = useMemo(
    () =>
      trips.filter((trip) => {
        if (filters.trip !== 'all' && trip.id !== filters.trip) {
          return false;
        }

        if (filters.year !== 'all') {
          return [trip.startDate, trip.endDate].some(
            (date) => date != null && getYear(date) === filters.year,
          );
        }

        return true;
      }),
    [filters.trip, filters.year, trips],
  );

  const daysTraveled = useMemo(() => {
    return filteredTrips.reduce((acc, trip) => {
      if (!trip.startDate || !trip.endDate) {
        return acc;
      }

      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return acc;
      }

      const difference =
        Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
      return acc + Math.max(0, difference);
    }, 0);
  }, [filteredTrips]);

  const distanceTraveled = useMemo(() => {
    const coordinates = filteredPlaces
      .filter(isValidCoordinate)
      .sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime() ||
          left.name.localeCompare(right.name),
      )
      .map((place) => ({
        lat: place.gpsLat as number,
        lng: place.gpsLng as number,
      }));

    return coordinates.reduce((acc, coords, index, array) => {
      if (index === 0) {
        return 0;
      }

      return acc + haversineDistanceKm(array[index - 1], coords);
    }, 0);
  }, [filteredPlaces]);

  const stats = useMemo(() => {
    return {
      countriesVisited: new Set(filteredPlaces.map((place) => place.country))
        .size,
      citiesVisited: new Set(
        filteredPlaces.map((place) => place.city?.trim() ?? '').filter(Boolean),
      ).size,
      placesVisited: filteredPlaces.length,
      daysTraveled,
      distanceTraveled: Math.round(distanceTraveled),
    };
  }, [filteredPlaces, daysTraveled, distanceTraveled]);

  const filterOptions = useMemo(() => {
    const countries = uniqueValues(allPlaces.map((place) => place.country));
    const years = sortYears(
      allPlaces
        .map((place) => getYear(place.createdAt))
        .concat(
          trips
            .flatMap((trip) => [trip.startDate, trip.endDate])
            .map((date) => getYear(date)),
        ),
    );

    return {
      countries,
      trips: trips
        .map((trip) => ({ id: trip.id, name: trip.name }))
        .sort((left, right) => left.name.localeCompare(right.name)),
      years,
    };
  }, [allPlaces, trips]);

  return {
    markers,
    stats,
    filterOptions,
    filteredPlaces,
    placeById,
    tripMap,
  };
}
