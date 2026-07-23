import { useState } from 'react';
import { Link } from 'react-router';
import { X } from 'lucide-react';
import { usePhotos } from '@/hooks/use-photos';
import { usePlaces } from '@/hooks/use-places';

export function GalleryPage() {
  const { data: photos, isLoading, error } = usePhotos();
  const { data: places } = usePlaces();
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const placeNameById = new Map((places ?? []).map((p) => [p.id, p.name]));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Gallery</h1>
      <p className="text-gray-500 mb-6">
        Every photo you've captured, across every place.
      </p>

      {isLoading && <p>Loading photos...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {photos?.length === 0 && (
        <p className="text-gray-500">
          No photos yet. Visit a place and upload your first one.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {photos?.map((photo) => (
          <div key={photo.id} className="group">
            <button
              onClick={() => setPreviewPhoto(photo.url)}
              className="w-full aspect-square block"
            >
              <img
                src={photo.url}
                alt={photo.caption ?? ''}
                className="w-full h-full object-cover rounded-lg"
              />
            </button>
            {photo.placeId && placeNameById.has(photo.placeId) && (
              <Link
                to={`/places/${photo.placeId}`}
                className="text-xs text-gray-500 hover:text-blue-600 mt-1 block truncate"
              >
                {placeNameById.get(photo.placeId)}
              </Link>
            )}
          </div>
        ))}
      </div>

      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
            onClick={() => setPreviewPhoto(null)}
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <img
            src={previewPhoto}
            alt=""
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
