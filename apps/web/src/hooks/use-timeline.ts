import { useTrips } from './use-trips';
import { usePlaces } from './use-places';
import { useAllJournalEntries } from './use-journal-entries';
import { usePhotos } from './use-photos';

export type TimelineEventType =
  | 'trip'
  | 'place'
  | 'journal'
  | 'memory';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;
  title: string;
  subtitle?: string;
  path: string;
}

export function useTimeline() {
  const { data: trips, isLoading: tripsLoading } = useTrips();

  const { data: places, isLoading: placesLoading } = usePlaces();

  const { data: journalEntries, isLoading: journalLoading } =
    useAllJournalEntries();

  const { data: photos, isLoading: photosLoading } = usePhotos();

  const isLoading =
    tripsLoading ||
    journalLoading ||
    placesLoading ||
    photosLoading;

  const placeNameById = new Map(
    (places ?? []).map((place) => [place.id, place.name]),
  );

  const tripEvents: TimelineEvent[] =
    trips
      ?.filter((trip) => trip.startDate)
      .map((trip) => ({
        id: `trip-${trip.id}`,
        type: 'trip' as const,
        date: trip.startDate as string,
        title: trip.name,
        subtitle:
          trip.places.length > 0
            ? trip.places.map((place) => place.name).join(', ')
            : undefined,
        path: `/trips/${trip.id}`,
      })) ?? [];

  const placeEvents: TimelineEvent[] =
    places?.map((place) => ({
      id: `place-${place.id}`,
      type: 'place' as const,
      date: place.createdAt,
      title: place.name,
      subtitle: [place.city, place.country]
        .filter(Boolean)
        .join(', '),
      path: `/places/${place.id}`,
    })) ?? [];

  const journalEvents: TimelineEvent[] =
    journalEntries?.map((entry) => ({
      id: `journal-${entry.id}`,
      type: 'journal' as const,
      date: entry.createdAt,
      title: entry.title,
      subtitle: entry.placeId
        ? placeNameById.get(entry.placeId)
        : undefined,
      path: entry.placeId ? `/places/${entry.placeId}` : '/journal',
    })) ?? [];

  const memoryEvents: TimelineEvent[] =
    photos
      ?.filter((photo) => photo.placeId)
      .map((photo) => ({
        id: `memory-${photo.id}`,
        type: 'memory' as const,
        date: photo.createdAt,
        title: photo.caption ?? 'Memory',
        subtitle: photo.placeId
          ? placeNameById.get(photo.placeId)
          : undefined,
        path: photo.placeId
          ? `/places/${photo.placeId}`
          : '/gallery',
      })) ?? [];

  const events: TimelineEvent[] = [
    ...tripEvents,
    ...placeEvents,
    ...journalEvents,
    ...memoryEvents,
  ].sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime(),
  );

  const eventsByYear = events.reduce<Record<string, TimelineEvent[]>>(
    (acc, event) => {
      const year = new Date(event.date).getFullYear().toString();

      acc[year] = acc[year] ?? [];
      acc[year].push(event);

      return acc;
    },
    {},
  );

  return {
    isLoading,
    events,
    eventsByYear,
    places: places ?? [],
  };
}
