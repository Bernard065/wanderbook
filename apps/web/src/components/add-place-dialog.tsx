import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { PLACE_CATEGORIES } from '@/constants/place-categories';
import {
  useUpdatePlace,
  type CreatePlaceInput,
} from '@/hooks/use-places';
import { useCreatePlaceLocal } from '@/hooks/use-create-place-local';
import { useUploadPhoto } from '@/hooks/use-photos';

import {
  placeSchema,
  type PlaceFormValues,
} from '@/schemas/place-schemas';

import {
  extractJsonFromMessage,
  extractMessageString,
} from '@/lib/error-utils';

import { ErrorMessage } from '@/components/ui/error-message';
import { showToast, showErrorToast } from '@/lib/toast';

import type { Place } from '@org/types';

type PlaceWithExtras = Place & {
  visitDate?: string | null;
  notes?: string | null;
  favorite?: boolean | null;
  coverUrl?: string | null;
};

interface AddPlaceDialogProps {
  children: React.ReactNode;
  place?: Place;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const emptyValues: PlaceFormValues = {
  name: '',
  country: '',
  region: '',
  city: '',
  category: '' as PlaceFormValues['category'],
  gpsLat: '',
  gpsLng: '',
  visitDate: '',
  notes: '',
  favorite: false,
  coverUrl: '',
};

const placeToFormValues = (
  place: PlaceWithExtras,
): PlaceFormValues => {
  return {
    name: place.name,
    country: place.country,
    region: place.region ?? '',
    city: place.city ?? '',
    category: place.category,
    gpsLat: place.gpsLat != null ? String(place.gpsLat) : '',
    gpsLng: place.gpsLng != null ? String(place.gpsLng) : '',
    visitDate: place.visitDate ?? '',
    notes: place.notes ?? '',
    favorite: !!place.favorite,
    coverUrl: place.coverUrl ?? '',
  };
};

export function AddPlaceDialog({
  children,
  place,
  open: controlledOpen,
  onOpenChange,
}: AddPlaceDialogProps) {
  const isEditMode = !!place;

  const [uncontrolledOpen, setUncontrolledOpen] =
    useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const createPlaceMutation = useCreatePlaceLocal();

  const {
    isPending: isCreating,
    error: createError,
  } = createPlaceMutation;

  const {
    mutate: updatePlace,
    isPending: isUpdating,
    error: updateError,
  } = useUpdatePlace();

  const uploadPhoto = useUploadPhoto();

  const isPending = isEditMode ? isUpdating : isCreating;
  const error = isEditMode ? updateError : createError;

  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: place
      ? placeToFormValues(place)
      : emptyValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        place ? placeToFormValues(place) : emptyValues,
      );
    }
  }, [open, place, form]);

  async function onSubmit(values: PlaceFormValues) {
    const payload: CreatePlaceInput = {
      name: values.name,
      country: values.country,
      region: values.region || null,
      city: values.city || null,
      category: values.category,
      gpsLat: values.gpsLat
        ? parseFloat(values.gpsLat)
        : null,
      gpsLng: values.gpsLng
        ? parseFloat(values.gpsLng)
        : null,
      visitDate: values.visitDate || undefined,
      notes: values.notes || undefined,
      favorite: !!values.favorite,
      coverUrl: values.coverUrl || undefined,
    };

    if (coverFile) {
      try {
        const uploaded = await uploadPhoto.mutateAsync({
          file: coverFile,
          caption: values.name,
        });

        payload.coverUrl = uploaded.url;
      } catch {
        showErrorToast('Failed to upload cover image');
      }
    }

    if (isEditMode) {
      updatePlace(
        {
          id: place.id,
          ...payload,
        },
        {
          onSuccess: () => setOpen(false),

          onError: (err: unknown) => {
            const msg = extractMessageString(err);
            const json = extractJsonFromMessage(msg);

            if (
              json &&
              json.errors &&
              typeof json.errors === 'object'
            ) {
              Object.entries(json.errors).forEach(([key, value]) => {
                const message = Array.isArray(value)
                  ? value.join(', ')
                  : String(value);

                try {
                  form.setError(
                    key as keyof PlaceFormValues,
                    {
                      type: 'server',
                      message,
                    },
                  );
                } catch {
                  // Ignore unknown form fields.
                }
              });
            }
          },
        },
      );
    } else {
      try {
        await createPlaceMutation.mutateAsync(payload);

        form.reset(emptyValues);
        setOpen(false);
        setCoverFile(null);

        showToast('Place added');
      } catch (err: unknown) {
        const msg = extractMessageString(err);
        const json = extractJsonFromMessage(msg);

        if (
          json &&
          json.errors &&
          typeof json.errors === 'object'
        ) {
          Object.entries(json.errors).forEach(([key, value]) => {
            const message = Array.isArray(value)
              ? value.join(', ')
              : String(value);

            try {
              form.setError(
                key as keyof PlaceFormValues,
                {
                  type: 'server',
                  message,
                },
              );
            } catch {
              // Ignore unknown form fields.
            }
          });
        }

        showErrorToast('Failed to add place');
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Place' : 'Add a Place'}
          </DialogTitle>

          <DialogDescription>
            {isEditMode
              ? 'Update the details for this place.'
              : 'Add a new place to your WanderBook. You can fill in more details later.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 py-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Mt Kenya"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Kenya"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Nyeri"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="max-h-64">
                        {PLACE_CATEGORIES.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="capitalize"
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gpsLat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gpsLng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="coverUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cover image (optional)
                    </FormLabel>

                    <FormControl>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file =
                            event.target.files?.[0] ?? null;

                          setCoverFile(file);

                          field.onChange(
                            file ? file.name : '',
                          );
                        }}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visitDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="favorite"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>

                      <FormLabel className="m-0">
                        Mark as favorite
                      </FormLabel>

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
                        placeholder="Optional notes about this place"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && <ErrorMessage error={error} />}

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending
                  ? 'Saving...'
                  : isEditMode
                    ? 'Save Changes'
                    : 'Save Place'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
