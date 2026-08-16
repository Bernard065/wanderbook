import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createPlace,
  deletePlace,
  getPlace,
  listPlaces,
  PLACES_QUERY_KEY,
  updatePlace,
  type CreatePlaceRequest,
  type UpdatePlaceRequest,
} from '@/api/places';
import { useAuthStore } from '@/stores/auth-store';
import { useHasHydrated } from '@/hooks/use-has-hydrated';

export type CreatePlaceInput = CreatePlaceRequest;

export interface UpdatePlaceInput extends UpdatePlaceRequest {
  id: string;
}

/**
 * Fetch all places.
 */
export function usePlaces() {
  const hasHydrated = useHasHydrated();
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: PLACES_QUERY_KEY,
    queryFn: listPlaces,
    enabled: hasHydrated && !!token,
  });
}

/**
 * Fetch a single place by ID.
 */
export function usePlace(id: string | undefined) {
  const hasHydrated = useHasHydrated();
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: [...PLACES_QUERY_KEY, id],
    queryFn: () => {
      if (!id) {
        throw new Error('Place ID is required.');
      }

      return getPlace(id);
    },
    enabled: hasHydrated && !!token && Boolean(id),
  });
}

/**
 * Create a new place.
 */
export function useCreatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlaceInput) => createPlace(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLACES_QUERY_KEY,
      });
    },
  });
}

/**
 * Update an existing place.
 */
export function useUpdatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdatePlaceInput) => updatePlace(id, input),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: PLACES_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [...PLACES_QUERY_KEY, variables.id],
      });
    },
  });
}

/**
 * Delete a place.
 */
export function useDeletePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlace(id),

    onSuccess: (_data, id) => {
      queryClient.removeQueries({
        queryKey: [...PLACES_QUERY_KEY, id],
      });

      queryClient.invalidateQueries({
        queryKey: PLACES_QUERY_KEY,
      });
    },
  });
}
