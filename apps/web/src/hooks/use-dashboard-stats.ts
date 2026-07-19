import { usePlaces } from './use-places';
import { useTrips } from './use-trips';

export function useDashboardStats() {
  const { data: places, isLoading: placesLoading } = usePlaces();
  const { data: trips, isLoading: tripsLoading } = useTrips();

  const countries = new Set(places?.map((p) => p.country)).size;
  const cities = new Set(
    places?.map((p) => p.city).filter((c): c is string => !!c),
  ).size;
  const placesCount = places?.length ?? 0;
  const tripsCount = trips?.length ?? 0;

  return {
    isLoading: placesLoading || tripsLoading,
    countries,
    cities,
    placesCount,
    tripsCount,
    places: places ?? [],
    trips: trips ?? [],
  };
}
