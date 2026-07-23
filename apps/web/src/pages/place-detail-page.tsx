import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Star, Pencil, Trash2 } from 'lucide-react';
import { usePlace, useDeletePlace } from '@/hooks/use-places';
import { PlaceGallery } from '@/components/place-gallery';
import { PlaceJournal } from '@/components/place-journal';
import { PlaceExpenses } from '@/components/place-expenses';
import { AddPlaceDialog } from '@/components/add-place-dialog';
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

export function PlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: place, isLoading, error } = usePlace(id);
  const { mutateAsync: deletePlace, isPending: isDeleting } =
    useDeletePlace();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;
  if (!place) return <p>Place not found.</p>;

  async function handleDelete() {
    if (!place) return;
    await deletePlace(place.id);
    navigate('/places');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/places"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Places
        </Link>

        <div className="flex items-center gap-2">
          <AddPlaceDialog
            place={place}
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
          </AddPlaceDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this place?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{place.name}" and cannot be
                  undone. Journal entries, expenses, and photos linked to
                  it will also be affected.
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

      <h1 className="text-3xl font-bold">{place.name}</h1>

      <div className="flex items-center gap-1 text-gray-500 mt-1">
        <MapPin className="h-4 w-4" />
        <span>
          {place.city ? `${place.city}, ` : ''}
          {place.region ? `${place.region}, ` : ''}
          {place.country}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <span className="capitalize px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
          {place.category}
        </span>
        {place.rating != null && (
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {place.rating}
          </span>
        )}
      </div>

      {place.description && (
        <p className="mt-6 text-gray-700 max-w-2xl">{place.description}</p>
      )}

      {(place.gpsLat != null || place.gpsLng != null) && (
        <p className="mt-4 text-sm text-gray-400">
          GPS: {place.gpsLat}, {place.gpsLng}
        </p>
      )}

      <PlaceGallery placeId={place.id} />
      <PlaceJournal placeId={place.id} />
      <PlaceExpenses placeId={place.id} />
    </div>
  );
}
