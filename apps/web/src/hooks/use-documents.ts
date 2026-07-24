import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import type { DocumentType } from '@/constants/document-types';

export interface Document {
  id: string;
  placeId: string | null;
  tripId: string | null;
  fileName: string;
  documentType: DocumentType;
  url: string;
  createdAt: string;
}

interface UseDocumentsOptions {
  placeId?: string;
  tripId?: string;
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const params = new URLSearchParams();
  if (options.placeId) params.set('place_id', options.placeId);
  if (options.tripId) params.set('trip_id', options.tripId);
  const qs = params.toString();

  return useQuery({
    queryKey: ['documents', options],
    queryFn: () => apiRequest<Document[]>(`/documents${qs ? `?${qs}` : ''}`),
  });
}

export interface UploadDocumentInput {
  file: File;
  documentType: DocumentType;
  placeId?: string;
  tripId?: string;
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, documentType, placeId, tripId }: UploadDocumentInput) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      if (placeId) formData.append('place_id', placeId);
      if (tripId) formData.append('trip_id', tripId);

      return apiRequest<Document>('/documents', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/documents/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
