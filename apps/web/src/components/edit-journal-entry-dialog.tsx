import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, Globe, Lock } from 'lucide-react';

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
import { ErrorMessage } from '@/components/ui/error-message';

import { useUpdateJournalEntry } from '@/hooks/use-journal-entries';
import {
  journalEntrySchema,
  type JournalEntryFormValues,
} from '@/schemas/journal-schemas';
import { extractJsonFromMessage } from '@/lib/error-utils';
import type { JournalEntry } from '@/hooks/use-journal-entries';

interface EditJournalEntryDialogProps {
  entry: JournalEntry;
}

const defaultValues: JournalEntryFormValues = {
  title: '',
  content: '',
  mood: '',
  isPrivate: true,
};

export function EditJournalEntryDialog({
  entry,
}: EditJournalEntryDialogProps) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending, error } = useUpdateJournalEntry();

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      title: entry.title,
      content: entry.content,
      mood: entry.mood ?? '',
      isPrivate: entry.isPrivate,
    });
  }, [open, entry, form]);

  const onSubmit = (values: JournalEntryFormValues) => {
    mutate(
      {
        id: entry.id,
        title: values.title,
        content: values.content,
        mood: values.mood || undefined,
        isPrivate: values.isPrivate,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset(values);
        },
        onError: (err: unknown) => {
          const maybeMessage = (err as { message?: unknown })?.message;

          let message = '';

          if (typeof maybeMessage === 'string') {
            message = maybeMessage;
          } else if (
            typeof maybeMessage === 'object' &&
            maybeMessage !== null
          ) {
            message = JSON.stringify(maybeMessage);
          } else {
            message = String(err);
          }

          const json = extractJsonFromMessage(message);

          if (
            json &&
            json.errors &&
            typeof json.errors === 'object'
          ) {
            Object.entries(json.errors).forEach(([key, value]) => {
              const fieldMessage = Array.isArray(value)
                ? value.join(', ')
                : String(value);

              try {
                form.setError(
                  key as keyof JournalEntryFormValues,
                  {
                    type: 'server',
                    message: fieldMessage,
                  },
                );
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
            Update the title, mood, privacy, or content of this journal
            entry.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Entry title"
                      {...field}
                    />
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
