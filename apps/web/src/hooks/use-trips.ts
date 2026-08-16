import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Trip, TripStatus } from '@org/types';
import { apiRequest } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { useHasHydrated } from '@/hooks/use-has-hydrated';

const TRIPS_KEY = ['trips'];

export function useTrips() {
  const hasHydrated = useHasHydrated();
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: TRIPS_KEY,
    queryFn: () => apiRequest<Trip[]>('/trips'),
    enabled: hasHydrated && !!token,
  });
}

export function useTrip(id: string | undefined) {
  const hasHydrated = useHasHydrated();
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ['trips', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Trip ID is required.');
      }

      return apiRequest<Trip>(`/trips/${id}`);
    },
    enabled: hasHydrated && !!token && !!id,
  });
}

export interface CreateTripInput {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
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
    mutationFn: ({ id, ...input }: Partial<CreateTripInput> & { id: string }) =>
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
