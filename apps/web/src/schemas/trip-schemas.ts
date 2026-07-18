import { z } from 'zod';
import { TRIP_STATUSES } from '@/constants/trip-statuses';

export const tripSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(TRIP_STATUSES),
  placeIds: z.array(z.string()),
});

export type TripFormValues = z.infer<typeof tripSchema>;
