import { useTrips } from './use-trips';
import { usePlaces } from './use-places';
import { useAllJournalEntries } from './use-journal-entries';

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
  const { data: journalEntries, isLoading: journalLoading } =
    useAllJournalEntries();

  const isLoading = tripsLoading || journalLoading;

  const placeNameById = new Map((places ?? []).map((p) => [p.id, p.name]));

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

  const journalEvents: TimelineEvent[] =
    journalEntries?.map((entry) => ({
      id: `journal-${entry.id}`,
      type: 'journal' as const,
      date: entry.createdAt,
      title: entry.title,
      subtitle: placeNameById.get(entry.placeId),
      path: `/places/${entry.placeId}`,
    })) ?? [];

  const events = [...tripEvents, ...journalEvents].sort(
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
