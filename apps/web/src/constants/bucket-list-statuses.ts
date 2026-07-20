export const BUCKET_LIST_STATUSES = [
  'dreaming',
  'planning',
  'booked',
  'visited',
  'cancelled',
] as const;

export type BucketListStatus = (typeof BUCKET_LIST_STATUSES)[number];
