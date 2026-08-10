import { z } from 'zod';

import { BUCKET_LIST_CATEGORIES } from '@/constants/bucket-list-categories';
import { BUCKET_LIST_STATUSES } from '@/constants/bucket-list-statuses';

export const bucketListItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less'),

  category: z.enum(BUCKET_LIST_CATEGORIES),

  status: z.enum(BUCKET_LIST_STATUSES),

  notes: z
    .string()
    .trim()
    .max(2000, 'Notes must be 2000 characters or less')
    .optional(),

  coverImageUrl: z
    .union([
      z.string().trim().url('Please enter a valid image URL'),
      z.literal(''),
    ])
    .optional(),

  country: z
    .string()
    .trim()
    .max(100, 'Country must be 100 characters or less')
    .optional(),

  priority: z
    .enum(['low', 'medium', 'high', 'must_have'])
    .optional(),

  targetYear: z
    .number()
    .int('Target year must be a whole number')
    .min(1900, 'Target year must be 1900 or later')
    .max(3000, 'Target year must be 3000 or earlier')
    .optional(),

  estimatedBudget: z
    .number()
    .min(0, 'Estimated budget cannot be negative')
    .optional(),
});

export type BucketListItemFormValues = z.infer<
  typeof bucketListItemSchema
>;
