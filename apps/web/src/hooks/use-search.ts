import { useQuery } from '@tanstack/react-query';
import type { Place, Trip } from '@org/types';
import { apiRequest } from '@/lib/api-client';
import type { JournalEntry } from '@/hooks/use-journal-entries';

export interface SearchResults {
  places: Place[];
  trips: Trip[];
  journalEntries: JournalEntry[];
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () =>
      apiRequest<SearchResults>(`/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length > 0,
  });
}
