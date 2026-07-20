import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Trip, TripStatus } from '@org/types';
import { apiRequest } from '@/lib/api-client';

const TRIPS_KEY = ['trips'];

export function useTrips() {
  return useQuery({
    queryKey: TRIPS_KEY,
    queryFn: () => apiRequest<Trip[]>('/trips'),
  });
}

export function useTrip(id: string | undefined) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: () => apiRequest<Trip>(`/trips/${id}`),
    enabled: !!id,
  });
}

export interface CreateTripInput {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: TripStatus;
  placeIds: string[];
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTripInput) =>
      apiRequest<Trip>('/trips', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIPS_KEY });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: Partial<CreateTripInput> & { id: string }) =>
      apiRequest<Trip>(`/trips/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: TRIPS_KEY });
      queryClient.invalidateQueries({ queryKey: ['trips', variables.id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/trips/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['trips', id] });
      queryClient.invalidateQueries({ queryKey: TRIPS_KEY });
    },
  });
}
