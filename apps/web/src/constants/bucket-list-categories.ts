export const BUCKET_LIST_CATEGORIES = [
  'country',
  'city',
  'landmark',
  'restaurant',
  'museum',
  'national_park',
  'road_trip',
  'festival',
  'custom',
] as const;

export type BucketListCategory = (typeof BUCKET_LIST_CATEGORIES)[number];
