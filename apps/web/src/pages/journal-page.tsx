import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { JournalEntryListItem } from '@/components/journal-entry-list-item';
import { AddJournalEntryDialog } from '@/components/add-journal-entry-dialog';
import { useAllJournalEntries } from '@/hooks/use-journal-entries';
import { usePlaces } from '@/hooks/use-places';

export function JournalPage() {
  const { data: entries, isLoading, error } = useAllJournalEntries();
  const { data: places } = usePlaces();

  const placeNameById = new Map((places ?? []).map((p) => [p.id, p.name]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-sm text-slate-600 mt-1">
            Every story from every place you've visited.
          </p>
        </div>
        <AddJournalEntryDialog>
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Write Entry
          </Button>
        </AddJournalEntryDialog>
      </div>

      {isLoading && (
        <p className="text-sm text-slate-500">Loading journal...</p>
      )}
      {error && <ErrorMessage error={error} />}

      {!isLoading && !error && entries?.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No memories captured yet"
          description="Write your first journal entry and build a personal archive of your adventures."
          action={
            <AddJournalEntryDialog>
              <Button>Start writing</Button>
            </AddJournalEntryDialog>
          }
        />
      )}

      {entries && entries.length > 0 && (
        <div className="space-y-3 max-w-2xl">
          {entries.map((entry) => (
            <JournalEntryListItem
              key={entry.id}
              entry={entry}
              placeName={placeNameById.get(entry.placeId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
