import { z } from 'zod';
import { PLACE_CATEGORIES } from '@/constants/place-categories';

function isValidLatString(val: string | undefined) {
  if (!val) return true;
  const num = parseFloat(val);
  return !Number.isNaN(num) && num >= -90 && num <= 90;
}

function isValidLngString(val: string | undefined) {
  if (!val) return true;
  const num = parseFloat(val);
  return !Number.isNaN(num) && num >= -180 && num <= 180;
}

export const placeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  country: z.string().min(1, 'Country is required'),
  region: z.string().optional(),
  city: z.string().optional(),
  category: z.enum(PLACE_CATEGORIES, {
    message: 'Select a category',
  }),
  gpsLat: z
    .string()
    .optional()
    .refine(isValidLatString, 'Latitude must be between -90 and 90'),
  gpsLng: z
    .string()
    .optional()
    .refine(isValidLngString, 'Longitude must be between -180 and 180'),
});

export type PlaceFormValues = z.infer<typeof placeSchema>;
