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

export type CreatePlaceInput = CreatePlaceRequest;

export interface UpdatePlaceInput extends UpdatePlaceRequest {
  id: string;
}

/**
 * Fetch all places.
 */
export function usePlaces() {
  return useQuery({
    queryKey: PLACES_QUERY_KEY,
    queryFn: listPlaces,
  });
}

/**
 * Fetch a single place by ID.
 */
export function usePlace(id: string | undefined) {
  return useQuery({
    queryKey: [...PLACES_QUERY_KEY, id],
    queryFn: () => {
      if (!id) {
        throw new Error('Place ID is required.');
      }

      return getPlace(id);
    },
    enabled: Boolean(id),
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
    mutationFn: ({ id, ...input }: UpdatePlaceInput) =>
      updatePlace(id, input),

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
