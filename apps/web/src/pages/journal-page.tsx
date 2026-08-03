import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JournalEntryListItem } from '@/components/journal-entry-list-item';
import { AddJournalEntryDialog } from '@/components/add-journal-entry-dialog';
import { useAllJournalEntries } from '@/hooks/use-journal-entries';
import { usePlaces } from '@/hooks/use-places';

export function JournalPage() {
  const { data: entries, isLoading, error } = useAllJournalEntries();
  const { data: places } = usePlaces();

  const placeNameById = new Map((places ?? []).map((p) => [p.id, p.name]));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-gray-500 text-sm mt-1">
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

      {isLoading && <p>Loading journal...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {entries?.length === 0 && (
        <p className="text-gray-500">
          No journal entries yet. Click "Write Entry" to capture your first
          memory.
        </p>
      )}

      <div className="space-y-3 max-w-2xl">
        {entries?.map((entry) => (
          <JournalEntryListItem
            key={entry.id}
            entry={entry}
            placeName={placeNameById.get(entry.placeId)}
          />
        ))}
      </div>
    </div>
  );
}
