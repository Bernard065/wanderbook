import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, Globe, Lock } from 'lucide-react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorMessage } from '@/components/ui/error-message';

import { useTrips } from '@/hooks/use-trips';
import {
  useUpdateJournalEntry,
  type JournalEntry,
} from '@/hooks/use-journal-entries';
import {
  journalEntrySchema,
  type JournalEntryFormValues,
} from '@/schemas/journal-schemas';
import {
  extractMessageString,
  extractJsonFromMessage,
} from '@/lib/error-utils';

interface EditJournalEntryDialogProps {
  entry: JournalEntry;
}

const defaultValues: JournalEntryFormValues = {
  title: '',
  content: '',
  entryDate: '',
  placeId: '',
  tripId: '',
  weather: '',
  tags: '',
  coverUrl: '',
  mood: '',
  isPrivate: true,
};

export function EditJournalEntryDialog({
  entry,
}: EditJournalEntryDialogProps) {
  const [open, setOpen] = useState(false);

  const { data: trips } = useTrips();
  const { mutate, isPending, error } = useUpdateJournalEntry();

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      title: entry.title ?? '',
      content: entry.content ?? '',
      entryDate: entry.entryDate ?? '',
      placeId: entry.placeId ?? '',
      tripId: entry.tripId ?? '',
      weather: entry.weather ?? '',
      tags: entry.tags?.join(', ') ?? '',
      coverUrl: entry.coverUrl ?? '',
      mood: entry.mood ?? '',
      isPrivate: entry.isPrivate,
    });
  }, [open, entry, form]);

  const onSubmit = (values: JournalEntryFormValues) => {
    mutate(
      {
        id: entry.id,
        tripId: values.tripId || null,
        title: values.title,
        content: values.content,
        entryDate: values.entryDate || null,
        weather: values.weather || null,
        tags: values.tags
          ? values.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : null,
        coverUrl: values.coverUrl || null,
        mood: values.mood || undefined,
        isPrivate: values.isPrivate,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset(values);
        },
        onError: (err: unknown) => {
          const message = extractMessageString(err);
          const json = extractJsonFromMessage(message);

          if (json && json.errors && typeof json.errors === 'object') {
            Object.entries(json.errors).forEach(([key, value]) => {
              const fieldMessage = Array.isArray(value)
                ? value.join(', ')
                : String(value);

              try {
                form.setError(key as keyof JournalEntryFormValues, {
                  type: 'server',
                  message: fieldMessage,
                });
              } catch {
                // Ignore unknown server-side field keys.
              }
            });
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit entry</DialogTitle>

          <DialogDescription>
            Update the title, mood, privacy, or content of this journal entry.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>

                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tripId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip</FormLabel>

                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === 'none' ? '' : value)
                      }
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Select a trip" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="none">No trip</SelectItem>

                        {trips?.map((trip) => (
                          <SelectItem key={trip.id} value={trip.id}>
                            {trip.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>

                  <FormControl>
                    <Input placeholder="Entry title" {...field} />
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
                  <FormLabel>Journal content</FormLabel>

                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Write your memory"
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="weather"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weather</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Sunny, rainy, crisp"
                        {...field}
                      />
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
                      <Input
                        placeholder="Peaceful, excited, reflective"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Separate tags with commas"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover image URL</FormLabel>

                    <FormControl>
                      <Input placeholder="Paste an image URL" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-medium">
                        Privacy
                      </FormLabel>

                      <p className="text-sm text-slate-500">
                        Choose whether this entry is private or public.
                      </p>
                    </div>

                    <FormControl>
                      <label
                        htmlFor={`privacy-${entry.id}`}
                        className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                      >
                        <Checkbox
                          id={`privacy-${entry.id}`}
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />

                        {field.value ? (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Private</span>
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4" />
                            <span>Public</span>
                          </>
                        )}
                      </label>
                    </FormControl>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <ErrorMessage error={error} />}

            <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                size="sm"
                disabled={isPending || !form.formState.isValid}
              >
                {isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
