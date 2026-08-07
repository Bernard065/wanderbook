import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Place, Trip } from '@org/types';

import type { JournalEntry } from '@/hooks/use-journal-entries';
import type { Photo } from '@/hooks/use-photos';
import { apiRequest } from '@/lib/api-client';

export interface SearchResults {
  places: Place[];
  trips: Trip[];
  journalEntries: JournalEntry[];
  photos: Photo[];
}

export function useSearch(query: string) {
  const searchQuery = query.trim();

  return useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => {
      const params = new URLSearchParams({ q: searchQuery });
      return apiRequest<SearchResults>(`/search?${params}`);
    },
    enabled: searchQuery.length >= 2,
    placeholderData: keepPreviousData,
  });
}
