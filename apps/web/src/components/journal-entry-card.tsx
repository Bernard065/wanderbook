import { Trash2, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteJournalEntry } from '@/hooks/use-journal-entries';
import type { JournalEntry } from '@/hooks/use-journal-entries';

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const { mutate: deleteEntry, isPending } = useDeleteJournalEntry();

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{entry.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(entry.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {entry.mood && ` · ${entry.mood}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {entry.isPrivate ? (
            <Lock className="h-3.5 w-3.5 text-gray-400" />
          ) : (
            <Globe className="h-3.5 w-3.5 text-gray-400" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isPending}
            onClick={() => deleteEntry(entry.id)}
          >
            <Trash2 className="h-3.5 w-3.5 text-gray-400" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">
        {entry.content}
      </p>
    </div>
  );
}
