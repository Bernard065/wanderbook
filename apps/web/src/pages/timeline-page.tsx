import { TimelineView } from '@/components/timeline/timeline';
import { PageHeader } from '@/components/ui/page-header';
import { useTimeline } from '@/hooks/use-timeline';

export function TimelinePage() {
const { isLoading, events } = useTimeline();

return ( <div className="space-y-6"> <PageHeader
     title="Timeline"
     description="Relive your journeys, places, journal entries, and memories in chronological order."
   />

```
  <div className="grid gap-6">
    {isLoading ? (
      <div className="rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-600">
          Loading timeline...
        </p>
      </div>
    ) : (
      <TimelineView events={events} showFilters />
    )}
  </div>
</div>

);
}

export default TimelinePage;
