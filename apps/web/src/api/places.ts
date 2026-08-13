import type { Place, PlaceCategory } from '@org/types';

import { apiRequest } from '@/lib/api-client';

export const PLACES_QUERY_KEY = ['places'] as const;

export interface CreatePlaceRequest {
  name: string;
  description?: string | null;
  country: string;
  region?: string | null;
  city?: string | null;
  category: PlaceCategory;
  gpsLat?: number | null;
  gpsLng?: number | null;
  rating?: number | null;
  visitDate?: string | null;
  notes?: string | null;
  favorite?: boolean | null;
  coverUrl?: string | null;
}

export interface UpdatePlaceRequest {
  name?: string;
  description?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  category?: PlaceCategory | null;
  gpsLat?: number | null;
  gpsLng?: number | null;
  rating?: number | null;
  visitDate?: string | null;
  notes?: string | null;
  favorite?: boolean | null;
  coverUrl?: string | null;
}

export type PlaceResponse = Place;
export type PlaceListResponse = Place[];

export function listPlaces(): Promise<PlaceListResponse> {
  return apiRequest<PlaceListResponse>('/places');
}

export function getPlace(placeId: string): Promise<PlaceResponse> {
  return apiRequest<PlaceResponse>(`/places/${placeId}`);
}

export function createPlace(input: CreatePlaceRequest): Promise<PlaceResponse> {
  return apiRequest<PlaceResponse>('/places', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updatePlace(
  placeId: string,
  input: UpdatePlaceRequest,
): Promise<PlaceResponse> {
  return apiRequest<PlaceResponse>(`/places/${placeId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deletePlace(placeId: string): Promise<void> {
  return apiRequest<void>(`/places/${placeId}`, {
    method: 'DELETE',
  });
}
