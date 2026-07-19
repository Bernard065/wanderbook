import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateJournalEntry } from '@/hooks/use-journal-entries';
import {
  journalEntrySchema,
  type JournalEntryFormValues,
} from '@/schemas/journal-schemas';

interface AddJournalEntryFormProps {
  placeId: string;
}

const defaultValues: JournalEntryFormValues = {
  title: '',
  content: '',
  mood: '',
  isPrivate: true,
};

export function AddJournalEntryForm({ placeId }: AddJournalEntryFormProps) {
  const { mutate, isPending, error } = useCreateJournalEntry();

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues,
  });

  function onSubmit(values: JournalEntryFormValues) {
    mutate(
      {
        placeId,
        title: values.title,
        content: values.content,
        mood: values.mood || undefined,
        isPrivate: values.isPrivate,
      },
      {
        onSuccess: () => form.reset(defaultValues),
      },
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="border rounded-lg p-4 space-y-3"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Sunrise at the summit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What happened here?</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mood</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Peaceful, Excited" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="mt-0!">Keep this entry private</FormLabel>
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
            {error.message}
          </p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Add Entry'}
        </Button>
      </form>
    </Form>
  );
}
