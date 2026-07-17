import { useParams, Link } from 'react-router';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { usePlace } from '@/hooks/use-places';

export function PlaceDetailPage() {
  const { id } = useParams();
  const { data: place, isLoading, error } = usePlace(id);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;
  if (!place) return <p>Place not found.</p>;

  return (
    <div>
      <Link
        to="/places"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Places
      </Link>

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
    </div>
  );
}
