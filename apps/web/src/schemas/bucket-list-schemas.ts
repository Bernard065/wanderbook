import { z } from 'zod';
import { BUCKET_LIST_CATEGORIES } from '@/constants/bucket-list-categories';
import { BUCKET_LIST_STATUSES } from '@/constants/bucket-list-statuses';

export const bucketListItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(BUCKET_LIST_CATEGORIES),
  status: z.enum(BUCKET_LIST_STATUSES),
  notes: z.string().optional(),
});

export type BucketListItemFormValues = z.infer<typeof bucketListItemSchema>;
