import { useTrips } from './use-trips';
import { usePlaces } from './use-places';

export type TimelineEventType = 'trip' | 'journal';

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
  const { data: places } = usePlaces();

  const isLoading = tripsLoading;

  const tripEvents: TimelineEvent[] =
    trips
      ?.filter((t) => t.startDate)
      .map((t) => ({
        id: `trip-${t.id}`,
        type: 'trip' as const,
        date: t.startDate as string,
        title: t.name,
        subtitle:
          t.places.length > 0
            ? t.places.map((p) => p.name).join(', ')
            : undefined,
        path: `/trips/${t.id}`,
      })) ?? [];

  const events = [...tripEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
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

  return { isLoading, events, eventsByYear, places: places ?? [] };
}
