import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Place } from '@org/types';
import { apiRequest } from '@/lib/api-client';

const PLACES_KEY = ['places'];

export function usePlaces() {
  return useQuery({
    queryKey: PLACES_KEY,
    queryFn: () => apiRequest<Place[]>('/places'),
  });
}

export function usePlace(id: string | undefined) {
  return useQuery({
    queryKey: ['places', id],
    queryFn: () => apiRequest<Place>(`/places/${id}`),
    enabled: !!id,
  });
}

export interface CreatePlaceInput {
  name: string;
  country: string;
  region?: string | null;
  city?: string | null;
  category: string;
  gpsLat?: number | null;
  gpsLng?: number | null;
}

export function useCreatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlaceInput) =>
      apiRequest<Place>('/places', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLACES_KEY });
    },
  });
}
