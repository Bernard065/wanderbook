import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTrip, useDeleteTrip } from '@/hooks/use-trips';
import { AddTripDialog } from '@/components/add-trip-dialog';
import { TripExpenses } from '@/components/trip-expenses';
import type { Trip } from '@org/types';

const statusStyles: Record<Trip['status'], string> = {
  planning: 'bg-blue-50 text-blue-600',
  ongoing: 'bg-green-50 text-green-600',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-600',
};

export function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: trip, isLoading, error } = useTrip(id);
  const { mutateAsync: deleteTrip, isPending: isDeleting } = useDeleteTrip();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;
  if (!trip) return <p>Trip not found.</p>;

  async function handleDelete() {
    if (!trip) return;
    await deleteTrip(trip.id);
    navigate('/trips');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/trips"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trips
        </Link>

        <div className="flex items-center gap-2">
          <AddTripDialog
            trip={trip}
            open={editOpen}
            onOpenChange={setEditOpen}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </AddTripDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{trip.name}" and its
                  associated expenses. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">{trip.name}</h1>
        <Badge className={statusStyles[trip.status]} variant="secondary">
          {trip.status}
        </Badge>
      </div>

      {(trip.startDate || trip.endDate) && (
        <div className="flex items-center gap-1 text-gray-500 mt-2">
          <Calendar className="h-4 w-4" />
          <span>
            {trip.startDate ?? '?'} – {trip.endDate ?? '?'}
          </span>
        </div>
      )}

      {trip.description && (
        <p className="mt-4 text-gray-700 max-w-2xl">{trip.description}</p>
      )}

      <h2 className="text-lg font-semibold mt-8 mb-3">
        Places ({trip.places.length})
      </h2>

      {trip.places.length === 0 ? (
        <p className="text-gray-500">No places attached to this trip yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trip.places.map((place) => (
            <Link key={place.id} to={`/places/${place.id}`}>
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <p className="font-medium">{place.name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {place.city ? `${place.city}, ` : ''}
                  {place.country}
                </p>
                <p className="text-sm capitalize text-gray-500 mt-1">
                  {place.category}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <TripExpenses tripId={trip.id} />
    </div>
  );
}
