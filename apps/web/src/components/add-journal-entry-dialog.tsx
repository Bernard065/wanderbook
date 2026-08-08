import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen } from 'lucide-react';
import { z } from 'zod';
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
import { useCreateJournalEntry } from '@/hooks/use-journal-entries';

const journalEntrySchema = z.object({
  placeId: z.string().min(1, 'Select a place'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Write something about this place'),
  mood: z.string().optional(),
  isPrivate: z.boolean(),
});

type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;

interface AddJournalEntryDialogProps {
  children: React.ReactNode;
}

const defaultValues: JournalEntryFormValues = {
  placeId: '',
  title: '',
  content: '',
  mood: '',
  isPrivate: true,
};

export function AddJournalEntryDialog({
  children,
}: AddJournalEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: places } = usePlaces();
  const { mutate, isPending, error } = useCreateJournalEntry();

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues,
    mode: 'onChange',
  });

  const onSubmit = (values: JournalEntryFormValues) => {
    mutate(
      {
        placeId: values.placeId,
        title: values.title,
        content: values.content,
        mood: values.mood || undefined,
        isPrivate: values.isPrivate,
      },
      {
        onSuccess: () => {
          form.reset(defaultValues);
          setOpen(false);
        },
        onError: (err: unknown) => {
          const maybeMessage = (err as { message?: unknown })?.message;
          let msg = '';
          if (typeof maybeMessage === 'string') msg = maybeMessage;
          else if (typeof maybeMessage === 'object' && maybeMessage !== null)
            msg = JSON.stringify(maybeMessage);
          else msg = String(err);
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
          }
        },
      },
    );
  };

  const extractJsonFromMessage = (msg: string) => {
    const braceIndex = msg.indexOf('{');
    if (braceIndex >= 0) {
      const maybe = msg.slice(braceIndex);
      try {
        return JSON.parse(maybe);
      } catch {
        return null;
      }
    }
    const parts = msg.split('—').map((p) => p.trim());
    if (parts.length > 1) {
      const last = parts[parts.length - 1];
      try {
        return JSON.parse(last);
      } catch {
        return null;
      }
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What happened here?</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="What happened here? What did you notice?"
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
                      placeholder="e.g. Peaceful, Excited, Awe-struck"
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

            <DialogFooter className="pt-2">
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
