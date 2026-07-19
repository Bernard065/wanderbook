import { z } from 'zod';

export const journalEntrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Write something about this place'),
  mood: z.string().optional(),
  isPrivate: z.boolean(),
});

export type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;
