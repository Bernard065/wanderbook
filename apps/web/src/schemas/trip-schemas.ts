import { z } from 'zod';
import { TRIP_STATUSES } from '@/constants/trip-statuses';

export const tripSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(TRIP_STATUSES),
  placeIds: z.array(z.string()).min(1, 'Select at least one place'),
});

// Ensure date ordering is sensible: if both dates provided, start <= end
export const tripSchemaWithChecks = tripSchema.superRefine(
  (val: z.infer<typeof tripSchema>, ctx) => {
    if (val.startDate && val.endDate) {
      try {
        const start = new Date(val.startDate);
        const end = new Date(val.endDate);
        if (
          Number.isFinite(start.getTime()) &&
          Number.isFinite(end.getTime())
        ) {
          if (start.getTime() > end.getTime()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['endDate'],
              message: 'End date must be the same or after start date',
            });
          }
        }
      } catch {
        console.error('Failed to parse dates for tripSchemaWithChecks', val);
      }
    }
  },
);

export type TripFormValues = z.infer<typeof tripSchema>;
