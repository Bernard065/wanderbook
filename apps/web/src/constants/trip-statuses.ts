export const TRIP_STATUSES = [
  'planning',
  'ongoing',
  'completed',
  'cancelled',
] as const;

export type TripStatus = (typeof TRIP_STATUSES)[number];
