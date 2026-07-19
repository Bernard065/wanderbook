import { JournalEntryCard } from '@/components/journal-entry-card';
import { AddJournalEntryForm } from '@/components/add-journal-entry-form';
import { useJournalEntries } from '@/hooks/use-journal-entries';

interface PlaceJournalProps {
  placeId: string;
}

export function PlaceJournal({ placeId }: PlaceJournalProps) {
  const { data: entries, isLoading, error } = useJournalEntries(placeId);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-3">Journal</h2>

      <div className="mb-6">
        <AddJournalEntryForm placeId={placeId} />
      </div>

      {isLoading && <p>Loading journal...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {entries?.length === 0 && (
        <p className="text-gray-500">
          No journal entries yet. Write about your experience above.
        </p>
      )}

      <div className="space-y-3">
        {entries?.map((entry) => (
          <JournalEntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
