import type { Place } from './place.js';

export type TripStatus = 'planning' | 'ongoing' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status: TripStatus;
  places: Place[];
  createdAt: string;
  updatedAt: string;
}
