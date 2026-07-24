import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import type { FriendUser } from '@/hooks/use-friends';
import type { Trip } from '@org/types';

export interface TripShare {
  sharedWithUserId: string;
  sharedWith: FriendUser;
  createdAt: string;
}

export function useTripShares(tripId: string) {
  return useQuery({
    queryKey: ['trip-shares', tripId],
    queryFn: () => apiRequest<TripShare[]>(`/trips/${tripId}/shares`),
  });
}

export function useShareTrip(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiRequest<TripShare>(`/trips/${tripId}/shares`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-shares', tripId] });
    },
  });
}

export function useUnshareTrip(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiRequest<void>(`/trips/${tripId}/shares/${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-shares', tripId] });
    },
  });
}

export function useSharedTrips() {
  return useQuery({
    queryKey: ['trips', 'shared-with-me'],
    queryFn: () => apiRequest<Trip[]>('/trips/shared-with-me'),
  });
}
