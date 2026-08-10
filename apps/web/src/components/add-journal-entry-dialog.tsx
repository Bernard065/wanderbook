import { type ReactNode, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen } from 'lucide-react';

import {
  Dialog,
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

import { usePlaces } from '@/hooks/use-places';
import { useTrips } from '@/hooks/use-trips';
import { useUploadPhoto } from '@/hooks/use-photos';
import { useCreateJournalEntry } from '@/hooks/use-journal-entries';

import {
  journalEntrySchema,
  type JournalEntryFormValues,
} from '@/schemas/journal-schemas';

import {
  extractJsonFromMessage,
  extractMessageString,
} from '@/lib/error-utils';
import { showErrorToast, showToast } from '@/lib/toast';

const DRAFT_STORAGE_KEY = 'wanderbook-journal-entry-draft';
const NO_TRIP_VALUE = '__none__';

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
  children: ReactNode;
  dialogTitle?: string;
  dialogDescription?: string;
}

export function AddJournalEntryDialog({
  children,
  dialogTitle = 'Write a memory',
  dialogDescription = 'Capture a moment from one of your places while it is still fresh.',
}: AddJournalEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const { data: places = [] } = usePlaces();
  const { data: trips = [] } = useTrips();

  const uploadPhoto = useUploadPhoto();
  const createJournalEntry = useCreateJournalEntry();

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues,
    mode: 'onChange',
  });

  const watchedValues = useWatch({
    control: form.control,
  });

  useEffect(() => {
    if (!open || typeof window === 'undefined') {
      return;
    }

    try {
      const storedDraft = window.localStorage.getItem(
        DRAFT_STORAGE_KEY,
      );

      if (!storedDraft) {
        return;
      }

      const parsedDraft = JSON.parse(
        storedDraft,
      ) as Partial<JournalEntryFormValues>;

      form.reset({
        ...defaultValues,
        ...parsedDraft,
      });
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [form, open]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') {
      return;
    }

    const values = watchedValues;

    const hasAnyValue = Object.entries(values).some(([key, value]) => {
      if (key === 'isPrivate') {
        return value !== defaultValues.isPrivate;
      }

      return (
        value !== '' &&
        value !== null &&
        value !== undefined
      );
    });

    if (!hasAnyValue) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify(values),
    );
  }, [open, watchedValues]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setCoverFile(null);
    }
  }

  function handleCancel() {
    form.reset(defaultValues);
    setCoverFile(null);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }

    setOpen(false);
  }

  async function onSubmit(values: JournalEntryFormValues) {
    const coverUrl = values.coverUrl?.trim() || undefined;

    let finalCoverUrl = coverUrl;

    if (coverFile) {
      try {
        const uploadedPhoto = await uploadPhoto.mutateAsync({
          file: coverFile,
          caption: values.title.trim(),
        });

        finalCoverUrl = uploadedPhoto.url;
      } catch {
        showErrorToast('Failed to upload cover image.');
        return;
      }
    }

    createJournalEntry.mutate(
      {
        placeId: values.placeId,
        tripId: values.tripId?.trim() || undefined,
        title: values.title.trim(),
        content: values.content.trim(),
        entryDate: values.entryDate?.trim() || undefined,
        weather: values.weather?.trim() || undefined,
        tags: values.tags?.trim()
          ? values.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
        coverUrl: finalCoverUrl,
        mood: values.mood?.trim() || undefined,
        isPrivate: values.isPrivate,
      },
      {
        onSuccess: () => {
          form.reset(defaultValues);
          setCoverFile(null);
          setOpen(false);

          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(DRAFT_STORAGE_KEY);
          }

          showToast('Journal entry saved.');
        },

        onError: (error: unknown) => {
          const message = extractMessageString(error);
          const parsedError = extractJsonFromMessage(message);

          if (
            parsedError &&
            parsedError.errors &&
            typeof parsedError.errors === 'object'
          ) {
            Object.entries(parsedError.errors).forEach(
              ([key, value]) => {
                if (!(key in defaultValues)) {
                  return;
                }

                const fieldName =
                  key as keyof JournalEntryFormValues;

                const fieldMessage = Array.isArray(value)
                  ? value.join(', ')
                  : String(value);

                form.setError(fieldName, {
                  type: 'server',
                  message: fieldMessage,
                });
              },
            );

            return;
          }

          showErrorToast('Failed to save journal entry.');
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <BookOpen className="h-5 w-5" />
          </div>

          <div>
            <DialogTitle>{dialogTitle}</DialogTitle>

            <DialogDescription>
              {dialogDescription}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 py-2"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="placeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place</FormLabel>

                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Select a place" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {places.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-slate-500">
                            No places yet — add one first.
                          </div>
                        ) : (
                          places.map((place) => (
                            <SelectItem
                              key={place.id}
                              value={place.id}
                            >
                              {place.name}
                            </SelectItem>
                          ))
                        )}
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

                    <Select
                      value={field.value || NO_TRIP_VALUE}
                      onValueChange={(value) =>
                        field.onChange(
                          value === NO_TRIP_VALUE ? '' : value,
                        )
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Select a trip" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value={NO_TRIP_VALUE}>
                          No trip
                        </SelectItem>

                        {trips.map((trip) => (
                          <SelectItem
                            key={trip.id}
                            value={trip.id}
                          >
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
                        value={field.value ?? ''}
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
                      <Input
                        type="date"
                        {...field}
                        value={field.value ?? ''}
                      />
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
                      rows={6}
                      placeholder="What happened here? What did you notice, feel, or want to remember?"
                      {...field}
                      value={field.value ?? ''}
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
                        placeholder="e.g. Sunny, rainy, crisp"
                        {...field}
                        value={field.value ?? ''}
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
                        placeholder="e.g. Peaceful, excited, reflective"
                        {...field}
                        value={field.value ?? ''}
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
                        placeholder="Family, beach, summer"
                        {...field}
                        value={field.value ?? ''}
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
                      <Input
                        type="url"
                        placeholder="Paste an image URL"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Upload cover image</FormLabel>

              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file =
                      event.target.files?.[0] ?? null;

                    setCoverFile(file);
                  }}
                  className="cursor-pointer"
                />
              </FormControl>

              {coverFile ? (
                <p className="text-xs text-slate-500">
                  Selected: {coverFile.name}
                </p>
              ) : null}
            </FormItem>

            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border border-slate-200 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>

                  <div className="space-y-1">
                    <FormLabel className="cursor-pointer">
                      Keep this entry private
                    </FormLabel>

                    <p className="text-sm text-slate-500">
                      Private entries are only visible to you.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {createJournalEntry.error ? (
              <ErrorMessage
                error={createJournalEntry.error}
              />
            ) : null}

            <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={
                  createJournalEntry.isPending ||
                  uploadPhoto.isPending
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  createJournalEntry.isPending ||
                  uploadPhoto.isPending ||
                  !form.formState.isValid
                }
              >
                {uploadPhoto.isPending
                  ? 'Uploading image...'
                  : createJournalEntry.isPending
                    ? 'Saving...'
                    : 'Save Entry'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddJournalEntryDialog;
