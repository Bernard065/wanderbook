import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import type { BucketListCategory } from '@/constants/bucket-list-categories';
import type { BucketListStatus } from '@/constants/bucket-list-statuses';

export interface BucketListItem {
  id: string;
  name: string;
  category: BucketListCategory;
  status: BucketListStatus;
  notes: string | null;
  placeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBucketListItemInput {
  name: string;
  category: BucketListCategory;
  status: BucketListStatus;
  notes?: string;
  placeId?: string;
}

const BUCKET_LIST_KEY = ['bucket-list'];

export function useBucketList() {
  return useQuery({
    queryKey: BUCKET_LIST_KEY,
    queryFn: () => apiRequest<BucketListItem[]>('/bucket-list'),
  });
}

export function useCreateBucketListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBucketListItemInput) =>
      apiRequest<BucketListItem>('/bucket-list', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUCKET_LIST_KEY });
    },
  });
}

export function useUpdateBucketListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: Partial<CreateBucketListItemInput> & { id: string }) =>
      apiRequest<BucketListItem>(`/bucket-list/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUCKET_LIST_KEY });
    },
  });
}

export function useDeleteBucketListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/bucket-list/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['bucket-list', id] });
      queryClient.invalidateQueries({ queryKey: BUCKET_LIST_KEY });
    },
  });
}
