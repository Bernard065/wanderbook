import { useTimeline } from '@/hooks/use-timeline';
import { Link } from 'react-router';

export function TravelTimeline() {
  const { eventsByYear } = useTimeline();

  const years = Object.keys(eventsByYear ?? {}).sort((a, b) =>
    b.localeCompare(a),
  );

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Travel Timeline</h3>
        <Link to="/timeline" className="text-xs text-blue-600 font-medium">
          View Full Timeline
        </Link>
      </div>

      {years.length === 0 ? (
        <p className="text-sm text-slate-500">No timeline events yet.</p>
      ) : (
        <div className="space-y-4">
          {years.map((year) => (
            <div key={year}>
              <div className="mb-2 text-xs font-semibold text-slate-600">
                {year}
              </div>

              <div className="relative pl-4">
                <div className="absolute left-1 top-0 bottom-0 w-px bg-slate-100" />
                <div className="space-y-3 pl-3">
                  {(eventsByYear[year] ?? []).map((ev) => (
                    <div
                      key={`${ev.type}-${ev.id}`}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-1 h-3 w-3 rounded-full bg-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {ev.title}
                        </p>
                        <p className="text-xs text-slate-500">{ev.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TravelTimeline;
