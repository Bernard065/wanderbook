import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  ImagePlus,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { Input } from '@/components/ui/input';
import { usePhotos, useUploadPhoto, useDeletePhoto } from '@/hooks/use-photos';
import {
  extractJsonFromMessage,
  extractMessageString,
} from '@/lib/error-utils';

interface PlaceGalleryProps {
  placeId: string;
}

interface PendingUpload {
  id: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export function PlaceGallery({ placeId }: PlaceGalleryProps) {
  const { data: photos, isLoading, error } = usePhotos({ placeId });
  const { mutate: uploadPhoto, isPending: isUploading } = useUploadPhoto();
  const { mutate: deletePhoto } = useDeletePhoto();

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingUpload[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRefs = useRef<number[]>([]);

  useEffect(() => {
    if (!previewPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewPhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewPhoto]);

  useEffect(() => {
    return () => {
      intervalRefs.current.forEach((value) => window.clearInterval(value));
      intervalRefs.current = [];
    };
  }, []);

  const uploadFile = (file: File, existingId?: string) => {
    const id =
      existingId ??
      `${file.name}-${file.size}-${file.lastModified}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    const uploadItem: PendingUpload = {
      id,
      file,
      status: 'uploading',
      progress: 0,
    };

    setUploadError(null);
    setPendingFiles((current) => {
      if (existingId) {
        return current.map((item) =>
          item.id === existingId ? uploadItem : item,
        );
      }

      return [...current, uploadItem];
    });

    const intervalId = window.setInterval(() => {
      setPendingFiles((current) =>
        current.map((item) =>
          item.id === id && item.status === 'uploading'
            ? { ...item, progress: Math.min(item.progress + 12, 90) }
            : item,
        ),
      );
    }, 180);

    intervalRefs.current.push(intervalId);

    uploadPhoto(
      {
        file,
        placeId,
        caption: caption.trim() || undefined,
      },
      {
        onSuccess: () => {
          window.clearInterval(intervalId);
          intervalRefs.current = intervalRefs.current.filter(
            (value) => value !== intervalId,
          );

          setPendingFiles((current) =>
            current.map((item) =>
              item.id === id
                ? { ...item, status: 'success', progress: 100 }
                : item,
            ),
          );
        },
        onError: (err: unknown) => {
          window.clearInterval(intervalId);
          intervalRefs.current = intervalRefs.current.filter(
            (value) => value !== intervalId,
          );

          const msg = extractMessageString(err);
          const json = extractJsonFromMessage(msg);

          let errorMessage = msg || 'The upload failed. Please try again.';
          if (json && typeof json === 'object') {
            const detail = (json as { detail?: unknown }).detail;
            if (typeof detail === 'string') {
              errorMessage = detail;
            }
          }

          setPendingFiles((current) =>
            current.map((item) =>
              item.id === id
                ? { ...item, status: 'error', progress: 0, error: errorMessage }
                : item,
            ),
          );
          setUploadError(errorMessage);
        },
      },
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    if (files.length === 0) return;

    files.forEach((file) => uploadFile(file));

    e.target.value = '';
    setCaption('');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);

    if (files.length === 0) return;

    files.forEach((file) => uploadFile(file));
    setCaption('');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }

    setIsDragging(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (photoId: string) => {
    if (!window.confirm('Delete this photo?')) {
      return;
    }

    deletePhoto(photoId);
  };

  return (
    <div className="mt-8 rounded-2xl border border bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Gallery</h2>
          <p className="text-sm text-muted-foreground">
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
              <UploadCloud className="h-4 w-4 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" />
              Upload Photo
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
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
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-primary">
          <Sparkles className="h-4 w-4" />
          Uploading your photo…
        </div>
      )}

      <div className="mb-4 rounded-xl border border bg-muted p-3">
        <label
          htmlFor="photo-caption"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Caption
        </label>

        <Input
          id="photo-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a short memory for this photo"
        />

        <p className="mt-2 text-xs text-muted-foreground">
          Captions are optional, but they make the gallery easier to revisit
          later.
        </p>
      </div>

      {pendingFiles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {pendingFiles.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-full border border bg-card px-3 py-2 text-sm text-slate-600 shadow-sm"
            >
              {item.status === 'success' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : item.status === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <UploadCloud className="h-4 w-4 text-primary" />
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="max-w-36 truncate">{item.file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.status === 'uploading'
                      ? `${item.progress}%`
                      : item.status === 'success'
                        ? 'uploaded'
                        : 'needs retry'}
                  </span>
                </div>

                <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.status === 'success'
                        ? 'bg-green-500'
                        : item.status === 'error'
                          ? 'bg-red-400'
                          : 'bg-blue-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              {item.status === 'error' && (
                <button
                  type="button"
                  className="ml-1 text-xs font-medium text-primary hover:text-primary"
                  onClick={() => uploadFile(item.file, item.id)}
                >
                  Retry
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border bg-muted px-3 py-3 text-sm text-muted-foreground">
          Loading photos…
        </div>
      )}

      {error && <ErrorMessage error={error} />}

      {!isLoading &&
        !error &&
        photos?.length === 0 &&
        pendingFiles.length > 0 && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
            <Sparkles className="mx-auto mb-3 h-6 w-6 text-primary" />
            <p className="font-medium text-blue-800">
              Your first photo is uploading...
            </p>
          </div>
        )}

      {!isLoading &&
        !error &&
        photos?.length === 0 &&
        pendingFiles.length === 0 && (
          <div
            className={`rounded-xl border border-dashed p-6 text-center transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-input bg-muted'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className="font-medium text-slate-700">
              No photos in this place yet
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Drag and drop or browse to add your first photo.
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos?.map((photo) => (
          <div key={photo.id} className="group relative aspect-square">
            <button
              type="button"
              aria-label={`Preview ${photo.caption ?? 'photo'}`}
              className="h-full w-full"
              onClick={() => setPreviewPhoto(photo.url)}
            >
              <img
                src={photo.url}
                alt={photo.caption ?? 'Photo'}
                loading="lazy"
                decoding="async"
                className="h-full w-full rounded-lg object-cover"
              />
            </button>

            <button
              type="button"
              aria-label="Delete photo"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => handleDelete(photo.id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        ))}
      </div>

      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <button
            type="button"
            aria-label="Close preview"
            className="absolute right-4 top-4 rounded-full bg-card/10 p-2 hover:bg-card/20"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewPhoto(null);
            }}
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <img
            src={previewPhoto}
            alt="Preview"
            className="max-h-full max-w-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
