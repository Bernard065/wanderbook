import { type FormEvent, type ReactNode, useId, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/components/ui/error-message';
import { useUploadPhoto } from '@/hooks/use-photos';

interface UploadMediaDialogProps {
  children: ReactNode;
  placeId?: string;
}

export function UploadMediaDialog({
  children,
  placeId,
}: UploadMediaDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');

  const fileInputId = useId();
  const captionInputId = useId();

  const uploadPhoto = useUploadPhoto();

  function resetForm() {
    setFile(null);
    setCaption('');
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen && !uploadPhoto.isPending) {
      resetForm();
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file || uploadPhoto.isPending) {
      return;
    }

    uploadPhoto.mutate(
      {
        file,
        placeId,
        caption: caption.trim() || undefined,
      },
      {
        onSuccess: () => {
          resetForm();
          setOpen(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Add a photo from your latest adventure.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 py-2"
        >
          <div className="space-y-2">
            <Label htmlFor={fileInputId}>Photo</Label>

            <input
              id={fileInputId}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploadPhoto.isPending}
              className="w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            />

            {file ? (
              <p className="text-xs text-slate-500">
                Selected: {file.name}
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Select an image from your device.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={captionInputId}>Caption</Label>

            <input
              id={captionInputId}
              type="text"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              disabled={uploadPhoto.isPending}
              placeholder="Add a short caption (optional)"
              maxLength={500}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <div className="flex justify-end">
              <span className="text-xs text-slate-400">
                {caption.length}/500
              </span>
            </div>
          </div>

          {uploadPhoto.error ? (
            <ErrorMessage error={uploadPhoto.error} />
          ) : null}

          <DialogFooter className="gap-2 pt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={uploadPhoto.isPending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={uploadPhoto.isPending || !file}
            >
              {uploadPhoto.isPending
                ? 'Uploading...'
                : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UploadMediaDialog;
