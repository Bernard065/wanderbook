import { Link } from 'react-router';
import { Luggage, BookOpen } from 'lucide-react';
import { useTimeline } from '@/hooks/use-timeline';

export function TimelinePage() {
  const { isLoading, eventsByYear } = useTimeline();
  const years = Object.keys(eventsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Timeline</h1>
      <p className="text-gray-500 mb-6">Replay your journeys, year by year.</p>

      {isLoading && <p>Loading timeline...</p>}

      {!isLoading && years.length === 0 && (
        <p className="text-gray-500">
          No trips or journal entries yet. Add one to see it here.
        </p>
      )}

      <div className="space-y-8">
        {years.map((year) => (
          <div key={year}>
            <h2 className="text-xl font-bold text-gray-300 mb-4">{year}</h2>
            <div className="space-y-3 border-l-2 border-gray-100 pl-6 ml-2">
              {eventsByYear[year].map((event) => {
                const Icon = event.type === 'trip' ? Luggage : BookOpen;
                return (
                  <Link
                    key={event.id}
                    to={event.path}
                    className="block relative"
                  >
                    <span className="absolute -left-[1.85rem] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                        <p className="font-medium">{event.title}</p>
                      </div>
                      {event.subtitle && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {event.subtitle}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(event.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
