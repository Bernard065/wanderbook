import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
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
import { usePlaces } from '@/hooks/use-places';
import { useTrips } from '@/hooks/use-trips';
import { useUploadPhoto } from '@/hooks/use-photos';
import { useCreateJournalEntry } from '@/hooks/use-journal-entries';
import {
  journalEntrySchema,
  type JournalEntryFormValues,
} from '@/schemas/journal-schemas';
import {
  extractMessageString,
  extractJsonFromMessage,
} from '@/lib/error-utils';
import { showToast, showErrorToast } from '@/lib/toast';

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

interface AddJournalEntryDialogProps {
  children: React.ReactNode;
}

export function AddJournalEntryDialog({
  children,
}: AddJournalEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const { data: places } = usePlaces();
  const { data: trips } = useTrips();
  const uploadPhoto = useUploadPhoto();
  const { mutate, isPending, error } = useCreateJournalEntry();

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(
        'wanderbook-journal-entry-draft',
      );

      if (!stored) return;

      const parsed = JSON.parse(stored) as Partial<JournalEntryFormValues>;
      if (parsed) {
        form.reset({
          ...defaultValues,
          ...parsed,
        });
      }
    } catch {
      // Ignore malformed draft data.
    }
  }, [form]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const subscription = form.watch((values) => {
      const hasAnyValue = Object.values(values).some(
        (value) =>
          value !== '' &&
          value !== false &&
          value !== null &&
          value !== undefined,
      );

      if (!hasAnyValue) {
        window.localStorage.removeItem('wanderbook-journal-entry-draft');
        return;
      }

      window.localStorage.setItem(
        'wanderbook-journal-entry-draft',
        JSON.stringify(values),
      );
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: JournalEntryFormValues) => {
    let coverUrl = values.coverUrl || undefined;

    if (coverFile) {
      try {
        const uploaded = await uploadPhoto.mutateAsync({
          file: coverFile,
          caption: values.title,
        });
        coverUrl = uploaded.url;
      } catch {
        showErrorToast('Failed to upload cover image.');
        return;
      }
    }

    mutate(
      {
        placeId: values.placeId,
        tripId: values.tripId || undefined,
        title: values.title,
        content: values.content,
        entryDate: values.entryDate || undefined,
        weather: values.weather || undefined,
        tags: values.tags
          ? values.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
        coverUrl,
        mood: values.mood || undefined,
        isPrivate: values.isPrivate,
      },
      {
        onSuccess: () => {
          form.reset(defaultValues);
          setCoverFile(null);
          setOpen(false);
          window.localStorage.removeItem('wanderbook-journal-entry-draft');
          showToast('Journal entry saved.');
        },
        onError: (err: unknown) => {
          const msg = extractMessageString(err);
          const json = extractJsonFromMessage(msg);
          if (json && json.errors && typeof json.errors === 'object') {
            Object.entries(json.errors).forEach(([k, v]) => {
              const m = Array.isArray(v) ? v.join(', ') : String(v);
              try {
                form.setError(k as keyof JournalEntryFormValues, {
                  type: 'server',
                  message: m,
                });
              } catch {
                console.error(
                  'Failed to set form error for key',
                  k,
                  'with message',
                  m,
                );
              }
            });
          } else {
            showErrorToast('Failed to save journal entry.');
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>Write a memory</DialogTitle>
            <DialogDescription>
              Capture a moment from one of your places while it is still fresh.
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="placeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select a place" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {places?.length === 0 && (
                          <p className="px-3 py-2 text-sm text-gray-400">
                            No places yet — add one first.
                          </p>
                        )}
                        {places?.map((place) => (
                          <SelectItem key={place.id} value={place.id}>
                            {place.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tripId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select a trip" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No trip</SelectItem>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Sunrise at the summit"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What happened here?</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="What happened here? What did you notice?"
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
                        placeholder="e.g. Sunny, Rainy, Crisp"
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
                        placeholder="e.g. Peaceful, Excited, Reflective"
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

              <div className="space-y-4">
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

                <FormItem>
                  <FormLabel>Upload cover image</FormLabel>
                  <FormControl>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setCoverFile(file);
                      }}
                      className="block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:text-slate-700"
                    />
                  </FormControl>
                  {coverFile ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Selected file: {coverFile.name}
                    </p>
                  ) : null}
                </FormItem>
              </div>
            </div>

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
                  <FormLabel className="mt-0!">
                    Keep this entry private
                  </FormLabel>
                </FormItem>
              )}
            />

            {error && <ErrorMessage error={error} />}

            <DialogFooter className="pt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
              >
                {isPending ? 'Saving...' : 'Save Entry'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
