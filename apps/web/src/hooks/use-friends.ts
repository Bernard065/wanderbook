import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';

export interface FriendUser {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  friend: FriendUser;
  createdAt: string;
}

const FRIENDS_KEY = ['friends'];

export function useFriendships() {
  return useQuery({
    queryKey: FRIENDS_KEY,
    queryFn: () => apiRequest<Friendship[]>('/friends'),
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) =>
      apiRequest<Friendship>('/friends/requests', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEY });
    },
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      friendshipId,
      status,
    }: {
      friendshipId: string;
      status: 'accepted' | 'rejected';
    }) =>
      apiRequest<Friendship>(
        `/friends/requests/${friendshipId}?status=${status}`,
        { method: 'PATCH' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEY });
    },
  });
}

export function useRemoveFriendship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: string) =>
      apiRequest<void>(`/friends/${friendshipId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEY });
    },
  });
}
