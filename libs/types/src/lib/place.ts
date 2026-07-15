export type PlaceCategory =
  | 'mountain'
  | 'beach'
  | 'museum'
  | 'restaurant'
  | 'park'
  | 'national_park'
  | 'hotel'
  | 'church'
  | 'mosque'
  | 'temple'
  | 'waterfall'
  | 'lake'
  | 'river'
  | 'forest'
  | 'island'
  | 'village'
  | 'market'
  | 'bridge'
  | 'monument'
  | 'zoo'
  | 'stadium'
  | 'airport'
  | 'cafe'
  | 'university'
  | 'shopping_mall'
  | 'historic_site'
  | 'landmark'
  | 'custom';

export interface Place {
  id: string;
  name: string;
  description?: string;
  country: string;
  region?: string;
  city?: string;
  category: PlaceCategory;
  gpsLat?: number;
  gpsLng?: number;
  rating?: number;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
}