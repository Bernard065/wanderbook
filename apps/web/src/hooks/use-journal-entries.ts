import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';

export interface JournalEntry {
  id: string;
  placeId: string;
  title: string;
  content: string;
  mood: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalEntryInput {
  placeId: string;
  title: string;
  content: string;
  mood?: string;
  isPrivate?: boolean;
}

export function useJournalEntries(placeId: string | undefined) {
  return useQuery({
    queryKey: ['journal-entries', { placeId }],
    queryFn: () =>
      apiRequest<JournalEntry[]>(`/journal-entries?place_id=${placeId}`),
    enabled: !!placeId,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateJournalEntryInput) =>
      apiRequest<JournalEntry>('/journal-entries', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['journal-entries', { placeId: data.placeId }],
      });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/journal-entries/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
}
