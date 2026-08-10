import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Compass } from 'lucide-react';
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
import {
  tripSchemaWithChecks,
  type TripFormValues,
} from '@/schemas/trip-schemas';
import { ErrorMessage } from '@/components/ui/error-message';
import type { Trip } from '@org/types';

interface AddTripDialogProps {
  children: ReactNode;
  trip?: Trip;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const emptyValues: TripFormValues = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  budget: '',
  status: 'planning',
  placeIds: [],
};

const tripToFormValues = (trip: Trip): TripFormValues => {
  return {
    name: trip.name,
    description: trip.description ?? '',
    startDate: trip.startDate ?? '',
    endDate: trip.endDate ?? '',
    budget: trip.budget?.toString() ?? '',
    status: trip.status,
    placeIds: trip.places.map((p) => p.id),
  };
};

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
  const {
    mutate: createTrip,
    isPending: isCreating,
    error: createError,
  } = useCreateTrip();
  const {
    mutate: updateTrip,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateTrip();

  const isPending = isEditMode ? isUpdating : isCreating;
  const error = isEditMode ? updateError : createError;

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchemaWithChecks),
    defaultValues: trip ? tripToFormValues(trip) : emptyValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (open) {
      form.reset(trip ? tripToFormValues(trip) : emptyValues);
    }
  }, [open, trip, form]);

  const onSubmit = (values: TripFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      budget: values.budget ? parseFloat(values.budget) : undefined,
      status: values.status,
      placeIds: values.placeIds,
    };

    if (isEditMode) {
      updateTrip(
        { id: trip.id, ...payload },
        {
          onSuccess: () => setOpen(false),
          onError: (err: unknown) => {
            // attempt to parse server validation errors and map to form fields
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
                  form.setError(k as keyof TripFormValues, {
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
    } else {
      createTrip(payload, {
        onSuccess: () => {
          form.reset(emptyValues);
          setOpen(false);
        },
        onError: (err: unknown) => {
          const maybeMessage2 = (err as { message?: unknown })?.message;
          let msg2 = '';
          if (typeof maybeMessage2 === 'string') msg2 = maybeMessage2;
          else if (typeof maybeMessage2 === 'object' && maybeMessage2 !== null)
            msg2 = JSON.stringify(maybeMessage2);
          else msg2 = String(err);
          const json = extractJsonFromMessage(msg2);
          if (json && json.errors && typeof json.errors === 'object') {
            Object.entries(json.errors).forEach(([k, v]) => {
              const m = Array.isArray(v) ? v.join(', ') : String(v);
              try {
                form.setError(k as keyof TripFormValues, {
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
      });
    }
  };

  const extractJsonFromMessage = (msg: string) => {
    // attempt to find a JSON object in the message text
    const braceIndex = msg.indexOf('{');
    if (braceIndex >= 0) {
      const maybe = msg.slice(braceIndex);
      try {
        return JSON.parse(maybe);
      } catch {
        return null;
      }
    }
    // fallback: try after em-dash separator
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
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>
              {isEditMode ? 'Edit Trip' : 'Plan a new trip'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the details for this trip.'
                : 'Lay out your itinerary and connect the places you want to remember.'}
            </DialogDescription>
          </div>
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
                    <Textarea
                      placeholder="Capture the mood of the trip or why it matters."
                      rows={2}
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
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 2500"
                      {...field}
                    />
                  </FormControl>
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
                  <div className="border rounded-md max-h-40 overflow-y-auto p-2 space-y-1 bg-slate-50/60">
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
