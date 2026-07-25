import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';

export interface Flight {
  id: string;
  tripId: string | null;
  airline: string | null;
  flightNumber: string | null;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  createdAt: string;
}

export interface CreateFlightInput {
  tripId?: string;
  airline?: string;
  flightNumber?: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
}

const FLIGHTS_KEY = ['flights'];

export function useFlights() {
  return useQuery({
    queryKey: FLIGHTS_KEY,
    queryFn: () => apiRequest<Flight[]>('/flights'),
  });
}

export function useCreateFlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFlightInput) =>
      apiRequest<Flight>('/flights', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FLIGHTS_KEY }),
  });
}
