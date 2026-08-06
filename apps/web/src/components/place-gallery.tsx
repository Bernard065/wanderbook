import { useRef, useState } from 'react';
import { ImagePlus, Sparkles, Trash2, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePhotos, useUploadPhoto, useDeletePhoto } from '@/hooks/use-photos';
import {
  extractMessageString,
  extractJsonFromMessage,
} from '@/lib/error-utils';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    uploadPhoto(
      { file, placeId },
      {
        onError: (err: unknown) => {
          const msg = extractMessageString(err);
          const json = extractJsonFromMessage(msg);
          if (json && typeof json === 'object' && json !== null) {
            const detail = (json as { detail?: unknown }).detail;
            if (typeof detail === 'string') {
              setUploadError(detail);
              return;
            }
          }
          setUploadError(msg || 'The upload failed. Please try again.');
        },
      },
    );
    e.target.value = '';
  }

  const openFilePicker = () => {
    fileInputRef.current?.click();
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Gallery</h2>
          <p className="text-sm text-slate-500">
            Capture memories from this place and keep them easy to revisit.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={isUploading}
          onClick={openFilePicker}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <UploadCloud className="h-4 w-4 animate-pulse" /> Uploading...
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" /> Upload Photo
            </>
          )}
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
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {uploadError}
        </div>
      )}

      {isUploading && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <Sparkles className="h-4 w-4" />
          Uploading your photo…
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
          Loading photos…
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
          Error: {error.message}
        </div>
      )}
      {!isLoading && !error && photos?.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="font-medium text-slate-700">
            No photos in this place yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Upload a photo to start building a richer memory of this stop.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-4"
            onClick={openFilePicker}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Add the first photo
          </Button>
        </div>
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
                alt={photo.caption ?? 'Photo'}
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
