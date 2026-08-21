import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { BucketListCategory } from '@/constants/bucket-list-categories';
import type { BucketListStatus } from '@/constants/bucket-list-statuses';
import { apiRequest } from '@/lib/api-client';
import { useAuthReady } from './use-auth-ready';

export type BucketListPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'must_have';

export interface BucketListItem {
  id: string;
  name: string;
  category: BucketListCategory;
  status: BucketListStatus;
  notes: string | null;
  coverImageUrl: string | null;
  country: string | null;
  priority: BucketListPriority | null;
  targetYear: number | null;
  estimatedBudget: number | null;
  placeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBucketListItemInput {
  name: string;
  category: BucketListCategory;
  status: BucketListStatus;
  notes?: string;
  coverImageUrl?: string;
  country?: string;
  priority?: BucketListPriority;
  targetYear?: number;
  estimatedBudget?: number;
  placeId?: string;
}

export type UpdateBucketListItemInput =
  Partial<Omit<CreateBucketListItemInput, 'name'>> & {
    id: string;
    name?: string;
  };

export const bucketListKeys = {
  all: ['bucket-list'] as const,

  lists: () => [...bucketListKeys.all, 'list'] as const,

  list: () => bucketListKeys.lists(),

  details: () => [...bucketListKeys.all, 'detail'] as const,

  detail: (id: string) =>
    [...bucketListKeys.details(), id] as const,
};

export function useBucketList() {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: bucketListKeys.list(),

    queryFn: () =>
      apiRequest<BucketListItem[]>('/bucket-list'),
    enabled: authReady,
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

    onSuccess: (createdItem) => {
      queryClient.setQueryData<BucketListItem>(
        bucketListKeys.detail(createdItem.id),
        createdItem,
      );

      void queryClient.invalidateQueries({
        queryKey: bucketListKeys.lists(),
      });
    },
  });
}

export function useUpdateBucketListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: UpdateBucketListItemInput) =>
      apiRequest<BucketListItem>(
        `/bucket-list/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(input),
        },
      ),

    onSuccess: (updatedItem) => {
      queryClient.setQueryData<BucketListItem>(
        bucketListKeys.detail(updatedItem.id),
        updatedItem,
      );

      void queryClient.invalidateQueries({
        queryKey: bucketListKeys.lists(),
      });
    },
  });
}

export function useDeleteBucketListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/bucket-list/${id}`, {
        method: 'DELETE',
      }),

    onSuccess: (_data, id) => {
      queryClient.removeQueries({
        queryKey: bucketListKeys.detail(id),
      });

      void queryClient.invalidateQueries({
        queryKey: bucketListKeys.lists(),
      });
    },
  });
}
