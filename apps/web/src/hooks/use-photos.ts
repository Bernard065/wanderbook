import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';

export interface Photo {
  id: string;
  placeId: string | null;
  caption: string | null;
  url: string;
  createdAt: string;
}

interface UsePhotosOptions {
  placeId?: string;
}

export function usePhotos(options: UsePhotosOptions = {}) {
  const params = new URLSearchParams();
  if (options.placeId) params.set('place_id', options.placeId);
  const qs = params.toString();

  return useQuery({
    queryKey: ['photos', options],
    queryFn: () => apiRequest<Photo[]>(`/photos${qs ? `?${qs}` : ''}`),
  });
}

export interface UploadPhotoInput {
  file: File;
  placeId?: string;
  caption?: string;
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, placeId, caption }: UploadPhotoInput) => {
      const formData = new FormData();
      formData.append('file', file);
      if (placeId) formData.append('place_id', placeId);
      if (caption) formData.append('caption', caption);

      return apiRequest<Photo>('/photos', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/photos/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}
