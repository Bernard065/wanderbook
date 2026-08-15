import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Clock3, Luggage, MapPin, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import type { TimelineEvent, TimelineEventType } from '@/hooks/use-timeline';

const FILTERS: Array<{
  value: TimelineEventType | 'all';
  label: string;
}> = [
  { value: 'all', label: 'All Activities' },
  { value: 'trip', label: 'Trips' },
  { value: 'place', label: 'Places' },
  { value: 'journal', label: 'Journal' },
  { value: 'memory', label: 'Memories' },
];

const typeMeta: Record<
  TimelineEventType,
  {
    label: string;
    icon: typeof Luggage;
    color: string;
  }
> = {
  trip: {
    label: 'Trip',
    icon: Luggage,
    color: 'bg-sky-500 text-white',
  },
  place: {
    label: 'Place',
    icon: MapPin,
    color: 'bg-emerald-500 text-white',
  },
  journal: {
    label: 'Journal',
    icon: BookOpen,
    color: 'bg-amber-500 text-foreground',
  },
  memory: {
    label: 'Memory',
    icon: Sparkles,
    color: 'bg-violet-500 text-white',
  },
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getMonthLabel(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'long',
  });
}

function getYear(date: string) {
  return new Date(date).getFullYear().toString();
}

function getMonthIndex(monthLabel: string) {
  return MONTH_NAMES.indexOf(monthLabel);
}

interface TimelineViewProps {
  events: TimelineEvent[];
  showFilters?: boolean;
  limit?: number;
  hideContainer?: boolean;
  className?: string;
}

function groupEventsByYearMonth(
  events: TimelineEvent[],
): Record<string, Record<string, TimelineEvent[]>> {
  return events.reduce<Record<string, Record<string, TimelineEvent[]>>>(
    (acc, event) => {
      const year = getYear(event.date);
      const month = getMonthLabel(event.date);

      if (!acc[year]) {
        acc[year] = {};
      }

      acc[year][month] = acc[year][month] ?? [];
      acc[year][month].push(event);

      return acc;
    },
    {},
  );
}

export function TimelineView({
  events,
  showFilters = true,
  limit,
  hideContainer = false,
  className,
}: TimelineViewProps) {
  const [activeFilter, setActiveFilter] = useState<
    TimelineEventType | 'all'
  >('all');

  const filteredEvents = useMemo(() => {
    const sortedEvents = [...events].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const filtered =
      activeFilter === 'all'
        ? sortedEvents
        : sortedEvents.filter((event) => event.type === activeFilter);

    return limit ? filtered.slice(0, limit) : filtered;
  }, [activeFilter, events, limit]);

  const groupedEvents = useMemo(() => {
    return groupEventsByYearMonth(filteredEvents);
  }, [filteredEvents]);

  const yearKeys = Object.keys(groupedEvents).sort(
    (a, b) => Number(b) - Number(a),
  );

  const content = (
    <div className={cn('space-y-6', className)}>
      {showFilters ? (
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              variant={
                activeFilter === filter.value ? 'secondary' : 'outline'
              }
              size="sm"
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      ) : null}

      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Clock3}
          title="No timeline events yet"
          description="Add a trip, place, memory, or journal entry to start building your travel story."
        />
      ) : (
        <div className="space-y-10">
          {yearKeys.map((year) => {
            const months = groupedEvents[year];

            const monthKeys = Object.keys(months).sort(
              (a, b) => getMonthIndex(b) - getMonthIndex(a),
            );

            const totalEvents = Object.values(months).reduce(
              (total, monthEvents) => total + monthEvents.length,
              0,
            );

            return (
              <section key={year} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    {year}
                  </span>

                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-slate-600">
                    {totalEvents} event
                    {totalEvents === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="space-y-6">
                  {monthKeys.map((month) => (
                    <div
                      key={`${year}-${month}`}
                      className="rounded-3xl border border bg-muted p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {month}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {months[month].length} item
                            {months[month].length === 1 ? '' : 's'}
                          </p>
                        </div>

                        <span className="text-xs text-muted-foreground">{year}</span>
                      </div>

                      <div className="relative pl-6">
                        <div className="absolute bottom-0 left-3 top-0 w-px bg-muted" />

                        <div className="space-y-4">
                          {months[month].map((event) => {
                            const meta = typeMeta[event.type];
                            const Icon = meta.icon;

                            const dotColor =
                              event.type === 'trip'
                                ? 'bg-sky-500'
                                : event.type === 'place'
                                  ? 'bg-emerald-500'
                                  : event.type === 'journal'
                                    ? 'bg-amber-500'
                                    : 'bg-violet-500';

                            return (
                              <Link
                                key={event.id}
                                to={event.path}
                                className="group relative block overflow-hidden rounded-3xl border border bg-card p-4 shadow-sm shadow-slate-200/20 transition hover:-translate-y-0.5 hover:shadow-md"
                              >
                                <span
                                  className={cn(
                                    'absolute -left-1.5 top-5 h-3.5 w-3.5 rounded-full shadow-sm',
                                    dotColor,
                                  )}
                                />

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="mb-2 flex items-center gap-2">
                                      <span
                                        className={cn(
                                          'grid h-9 w-9 shrink-0 place-items-center rounded-2xl',
                                          meta.color,
                                        )}
                                      >
                                        <Icon className="h-4 w-4" />
                                      </span>

                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                          {event.title}
                                        </p>

                                        {event.subtitle ? (
                                          <p className="truncate text-xs text-muted-foreground">
                                            {event.subtitle}
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 rounded-2xl bg-muted px-3 py-2 text-xs font-medium text-slate-600">
                                    {new Date(
                                      event.date,
                                    ).toLocaleDateString(undefined, {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </div>
                                </div>

                                <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                  <span>{meta.label}</span>
                                  <span aria-hidden="true">·</span>
                                  <span>
                                    {event.type === 'memory'
                                      ? 'Memories'
                                      : event.type === 'journal'
                                        ? 'Journal entry'
                                        : event.type === 'trip'
                                          ? 'Trip'
                                          : 'Place'}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );

  if (hideContainer) {
    return content;
  }

  return (
    <div className="rounded-3xl border border bg-card p-4 shadow-sm sm:p-6">
      {content}
    </div>
  );
}

export default TimelineView;
