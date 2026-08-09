import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreatePlaceInput } from './use-places';
import type { Place } from '@org/types';

const PLACES_KEY = ['places'];

type LocalPlace = Place & {
  visitDate?: string | null;
  notes?: string | null;
  favorite?: boolean;
  coverUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function useCreatePlaceLocal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePlaceInput) => {
      // simulate network latency
      await new Promise((r) => setTimeout(r, 300));
      const newPlace: LocalPlace = {
        id: `local-${Date.now()}`,
        name: input.name,
        country: input.country,
        region: input.region ?? null,
        city: input.city ?? null,
        category: input.category,
        gpsLat: input.gpsLat ?? null,
        gpsLng: input.gpsLng ?? null,
        visitDate: input.visitDate ?? null,
        notes: input.notes ?? null,
        favorite: !!input.favorite,
        coverUrl: input.coverUrl ?? null,
        // optional fields for local UI
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // update local cache
      queryClient.setQueryData(PLACES_KEY, (old: Place[] | undefined) => {
        const list = old ? [...old] : [];
        list.unshift(newPlace as unknown as Place);
        return list;
      });

      return newPlace;
    },
    onSuccess: (_data, _vars) => {
      queryClient.invalidateQueries({ queryKey: PLACES_KEY });
    },
  });
}
