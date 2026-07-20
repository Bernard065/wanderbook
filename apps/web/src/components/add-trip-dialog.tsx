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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TRIP_STATUSES } from '@/constants/trip-statuses';
import { usePlaces } from '@/hooks/use-places';
import { useCreateTrip, useUpdateTrip } from '@/hooks/use-trips';
import { tripSchema, type TripFormValues } from '@/schemas/trip-schemas';
import type { Trip } from '@org/types';

interface AddTripDialogProps {
  children: React.ReactNode;
  trip?: Trip;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const emptyValues: TripFormValues = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'planning',
  placeIds: [],
};

function tripToFormValues(trip: Trip): TripFormValues {
  return {
    name: trip.name,
    description: trip.description ?? '',
    startDate: trip.startDate ?? '',
    endDate: trip.endDate ?? '',
    status: trip.status,
    placeIds: trip.places.map((p) => p.id),
  };
}

export function AddTripDialog({
  children,
  trip,
  open: controlledOpen,
  onOpenChange,
}: AddTripDialogProps) {
  const isEditMode = !!trip;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const { data: places } = usePlaces();
  const { mutate: createTrip, isPending: isCreating, error: createError } =
    useCreateTrip();
  const { mutate: updateTrip, isPending: isUpdating, error: updateError } =
    useUpdateTrip();

  const isPending = isEditMode ? isUpdating : isCreating;
  const error = isEditMode ? updateError : createError;

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: trip ? tripToFormValues(trip) : emptyValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(trip ? tripToFormValues(trip) : emptyValues);
    }
  }, [open, trip, form]);

  function onSubmit(values: TripFormValues) {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      status: values.status,
      placeIds: values.placeIds,
    };

    if (isEditMode) {
      updateTrip(
        { id: trip.id, ...payload },
        { onSuccess: () => setOpen(false) },
      );
    } else {
      createTrip(payload, {
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
          <DialogTitle>{isEditMode ? 'Edit Trip' : 'Add a Trip'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details for this trip.'
              : "Plan a new trip and attach places you'll visit."}
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
                    <Input placeholder="e.g. Kenya Holiday 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End date</FormLabel>
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRIP_STATUSES.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="capitalize"
                        >
                          {status}
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
              name="placeIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Places</FormLabel>
                  <div className="border rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
                    {!places || places.length === 0 ? (
                      <p className="text-sm text-gray-400 px-1 py-1">
                        No places yet — add one first.
                      </p>
                    ) : (
                      places.map((place) => (
                        <label
                          key={place.id}
                          className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <Checkbox
                            checked={field.value.includes(place.id)}
                            onCheckedChange={(checked) => {
                              field.onChange(
                                checked
                                  ? [...field.value, place.id]
                                  : field.value.filter(
                                      (id: string) => id !== place.id,
                                    ),
                              );
                            }}
                          />
                          <span className="text-sm">{place.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    : 'Save Trip'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
