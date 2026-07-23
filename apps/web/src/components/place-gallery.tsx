import { useRef, useState } from 'react';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePhotos, useUploadPhoto, useDeletePhoto } from '@/hooks/use-photos';

interface PlaceGalleryProps {
  placeId: string;
}

export function PlaceGallery({ placeId }: PlaceGalleryProps) {
  const { data: photos, isLoading, error } = usePhotos({ placeId });
  const { mutate: uploadPhoto, isPending: isUploading } = useUploadPhoto();
  const { mutate: deletePhoto } = useDeletePhoto();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    uploadPhoto(
      { file, placeId },
      {
        onError: (err) => setUploadError(err.message),
      },
    );
    e.target.value = '';
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Gallery</h2>
        <Button
          size="sm"
          variant="outline"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {uploadError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 mb-3">
          {uploadError}
        </p>
      )}

      {isLoading && <p>Loading photos...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {photos?.length === 0 && (
        <p className="text-gray-500">No photos yet. Upload your first one.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos?.map((photo) => (
          <div key={photo.id} className="relative group aspect-square">
            <button
              onClick={() => setPreviewPhoto(photo.url)}
              className="w-full h-full"
            >
              <img
                src={photo.url}
                alt={photo.caption ?? ''}
                className="w-full h-full object-cover rounded-lg"
              />
            </button>
            <button
              onClick={() => deletePhoto(photo.id)}
              className="absolute top-1 right-1 p-1.5 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5 text-white" />
            </button>
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
