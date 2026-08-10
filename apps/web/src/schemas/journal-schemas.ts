import { z } from 'zod';

export const journalEntrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Write something about this place'),
  entryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a valid date')
    .optional()
    .or(z.literal('')),
  placeId: z.string().min(1, 'Select a place'),
  tripId: z.string().optional().or(z.literal('')),
  weather: z.string().optional(),
  tags: z.string().optional().or(z.literal('')),
  coverUrl: z.string().url().optional().or(z.literal('')),
  mood: z.string().optional(),
  isPrivate: z.boolean(),
});

export type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;
