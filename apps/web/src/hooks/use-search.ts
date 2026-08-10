import { useQuery } from '@tanstack/react-query';

import type { SearchResults } from '@/types/search';
import { apiRequest } from '@/lib/api-client';

export type { SearchResults } from '@/types/search';

const SEARCH_QUERY_KEY = 'search';

export function useSearch(query: string) {
  const searchQuery = query.trim();

  return useQuery<SearchResults>({
    queryKey: [SEARCH_QUERY_KEY, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: searchQuery,
      });

      return apiRequest<SearchResults>(`/search?${params.toString()}`);
    },
    enabled: searchQuery.length >= 2,
  });
}
