import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import type { Place } from '@org/types';
import { ArrowLeft, MapPin, Star } from 'lucide-react';

export function PlaceDetailPage() {
  const { id } = useParams();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/places/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: Place) => setPlace(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
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
