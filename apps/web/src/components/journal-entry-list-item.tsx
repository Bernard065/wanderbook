import { Link } from 'react-router';
import { Lock, Globe, MapPin } from 'lucide-react';
import type { JournalEntry } from '@/hooks/use-journal-entries';

interface JournalEntryListItemProps {
  entry: JournalEntry;
  placeName?: string;
}

export function JournalEntryListItem({
  entry,
  placeName,
}: JournalEntryListItemProps) {
  return (
    <Link
      to={`/places/${entry.placeId}`}
      className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold">{entry.title}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
            {placeName && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {placeName}
              </span>
            )}
            <span>
              {new Date(entry.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {entry.mood && <span>· {entry.mood}</span>}
          </div>
        </div>
        {entry.isPrivate ? (
          <Lock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        ) : (
          <Globe className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        )}
      </div>
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
        {entry.content}
      </p>
    </Link>
  );
}
