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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PLACE_CATEGORIES } from '@/constants/place-categories';
import { useCreatePlace, useUpdatePlace } from '@/hooks/use-places';
import { placeSchema, type PlaceFormValues } from '@/schemas/place-schemas';
import type { Place } from '@org/types';

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
  category: undefined as never,
  gpsLat: '',
  gpsLng: '',
};

function placeToFormValues(place: Place): PlaceFormValues {
  return {
    name: place.name,
    country: place.country,
    region: place.region ?? '',
    city: place.city ?? '',
    category: place.category,
    gpsLat: place.gpsLat != null ? String(place.gpsLat) : '',
    gpsLng: place.gpsLng != null ? String(place.gpsLng) : '',
  };
}

export function AddPlaceDialog({
  children,
  place,
  open: controlledOpen,
  onOpenChange,
}: AddPlaceDialogProps) {
  const isEditMode = !!place;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const { mutate: createPlace, isPending: isCreating, error: createError } =
    useCreatePlace();
  const { mutate: updatePlace, isPending: isUpdating, error: updateError } =
    useUpdatePlace();

  const isPending = isEditMode ? isUpdating : isCreating;
  const error = isEditMode ? updateError : createError;

  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: place ? placeToFormValues(place) : emptyValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(place ? placeToFormValues(place) : emptyValues);
    }
  }, [open, place, form]);

  function onSubmit(values: PlaceFormValues) {
    const payload = {
      name: values.name,
      country: values.country,
      region: values.region || null,
      city: values.city || null,
      category: values.category,
      gpsLat: values.gpsLat ? parseFloat(values.gpsLat) : null,
      gpsLng: values.gpsLng ? parseFloat(values.gpsLng) : null,
    };

    if (isEditMode) {
      updatePlace(
        { id: place.id, ...payload },
        { onSuccess: () => setOpen(false) },
      );
    } else {
      createPlace(payload, {
        onSuccess: () => {
          form.reset(emptyValues);
          setOpen(false);
        },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Place' : 'Add a Place'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details for this place.'
              : "Add a new place to your WanderBook. You can fill in more details later."}
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
                    <Input placeholder="e.g. Mt Kenya" {...field} />
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
                      <Input placeholder="e.g. Kenya" {...field} />
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
                      <Input placeholder="e.g. Nyeri" {...field} />
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
                      <Input placeholder="Optional" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-64">
                        {PLACE_CATEGORIES.map((cat) => (
                          <SelectItem
                            key={cat}
                            value={cat}
                            className="capitalize"
                          >
                            {cat.replace(/_/g, ' ')}
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
                      <Input placeholder="Optional" {...field} />
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
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                {error.message}
              </p>
            )}

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
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
