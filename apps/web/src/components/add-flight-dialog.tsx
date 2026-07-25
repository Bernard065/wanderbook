import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Button } from '@/components/ui/button';
import { useCreateFlight } from '@/hooks/use-flights';

const flightSchema = z.object({
  airline: z.string().optional(),
  flightNumber: z.string().optional(),
  departureAirport: z.string().min(1, 'Departure airport is required'),
  arrivalAirport: z.string().min(1, 'Arrival airport is required'),
  departureDate: z.string().min(1, 'Date is required'),
});

type FlightFormValues = z.infer<typeof flightSchema>;

interface AddFlightDialogProps {
  children: React.ReactNode;
  tripId?: string;
}

const defaultValues: FlightFormValues = {
  airline: '',
  flightNumber: '',
  departureAirport: '',
  arrivalAirport: '',
  departureDate: '',
};

export function AddFlightDialog({ children, tripId }: AddFlightDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending, error } = useCreateFlight();

  const form = useForm<FlightFormValues>({
    resolver: zodResolver(flightSchema),
    defaultValues,
  });

  function onSubmit(values: FlightFormValues) {
    mutate(
      {
        tripId,
        airline: values.airline || undefined,
        flightNumber: values.flightNumber || undefined,
        departureAirport: values.departureAirport,
        arrivalAirport: values.arrivalAirport,
        departureDate: values.departureDate,
      },
      {
        onSuccess: () => {
          form.reset(defaultValues);
          setOpen(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log a Flight</DialogTitle>
          <DialogDescription>Track a flight for this trip.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="airline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Airline</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="flightNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight #</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departureAirport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. NBO" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="arrivalAirport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. NRT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departure date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                {isPending ? 'Saving...' : 'Log Flight'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
