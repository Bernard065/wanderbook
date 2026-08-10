import { useState, type ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { BUCKET_LIST_CATEGORIES } from '@/constants/bucket-list-categories';
import { BUCKET_LIST_STATUSES } from '@/constants/bucket-list-statuses';
import { useCreateBucketListItem } from '@/hooks/use-bucket-list';
import {
  extractJsonFromMessage,
  extractMessageString,
} from '@/lib/error-utils';
import {
  bucketListItemSchema,
  type BucketListItemFormValues,
} from '@/schemas/bucket-list-schemas';

interface AddBucketListItemDialogProps {
  children: ReactNode;
}

const defaultValues: BucketListItemFormValues = {
  name: '',
  category: 'country',
  status: 'dreaming',
  notes: '',
  coverImageUrl: '',
  country: '',
  priority: 'medium',
  targetYear: undefined,
  estimatedBudget: undefined,
};

export function AddBucketListItemDialog({
  children,
}: AddBucketListItemDialogProps) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending, error } = useCreateBucketListItem();

  const form = useForm<BucketListItemFormValues>({
    resolver: zodResolver(bucketListItemSchema),
    defaultValues,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      form.reset(defaultValues);
      form.clearErrors();
    }
  };

  const handleServerValidationErrors = (err: unknown) => {
    const message = extractMessageString(err);
    const json = extractJsonFromMessage(message);

    if (
      !json ||
      !json.errors ||
      typeof json.errors !== 'object' ||
      Array.isArray(json.errors)
    ) {
      return;
    }

    for (const [fieldName, fieldErrors] of Object.entries(json.errors)) {
      if (!(fieldName in defaultValues)) {
        continue;
      }

      const errorMessage = Array.isArray(fieldErrors)
        ? fieldErrors.join(', ')
        : String(fieldErrors);

      form.setError(fieldName as keyof BucketListItemFormValues, {
        type: 'server',
        message: errorMessage,
      });
    }
  };

  const onSubmit = (values: BucketListItemFormValues) => {
    form.clearErrors();

    mutate(
      {
        name: values.name.trim(),
        category: values.category,
        status: values.status,
        notes: values.notes?.trim() || undefined,
        coverImageUrl: values.coverImageUrl?.trim() || undefined,
        country: values.country?.trim() || undefined,
        priority: values.priority,
        targetYear: values.targetYear,
        estimatedBudget: values.estimatedBudget,
      },
      {
        onSuccess: () => {
          form.reset(defaultValues);
          setOpen(false);
        },
        onError: handleServerValidationErrors,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to Bucket List</DialogTitle>

          <DialogDescription>
            Add a dream destination or experience to your bucket list.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Visit Mount Fuji"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>

                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {BUCKET_LIST_CATEGORIES.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                          >
                            {category.replace(/_/g, ' ')}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>

                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {BUCKET_LIST_STATUSES.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                          >
                            {status.replace(/_/g, ' ')}
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
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder="e.g. Japan"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        type="url"
                        placeholder="https://example.com/image.jpg"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>

                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="must_have">
                          Must Have
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Year</FormLabel>

                    <FormControl>
                      <Input
                        value={field.value ?? ''}
                        type="number"
                        min={1900}
                        max={3000}
                        placeholder="2030"
                        onChange={(event) => {
                          const value = event.target.value;

                          field.onChange(
                            value === ''
                              ? undefined
                              : Number(value),
                          );
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Budget</FormLabel>

                    <FormControl>
                      <Input
                        value={field.value ?? ''}
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="5000"
                        onChange={(event) => {
                          const value = event.target.value;

                          field.onChange(
                            value === ''
                              ? undefined
                              : Number(value),
                          );
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>

                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
                      rows={3}
                      placeholder="Add any notes, plans, or ideas..."
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <ErrorMessage error={error} />}

            <DialogFooter className="gap-2 pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
