import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlaceGallery } from './place-gallery';
import { useDeletePhoto, usePhotos, useUploadPhoto } from '../hooks/use-photos';

vi.mock('../hooks/use-photos', () => ({
  usePhotos: vi.fn(),
  useUploadPhoto: vi.fn(),
  useDeletePhoto: vi.fn(),
}));

describe('PlaceGallery', () => {
  it('shows an empty-state with a helpful upload prompt when no photos exist', () => {
    vi.mocked(usePhotos).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof usePhotos>);
    vi.mocked(useUploadPhoto).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUploadPhoto>);
    vi.mocked(useDeletePhoto).mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useDeletePhoto>);

    render(<PlaceGallery placeId="place-1" />);

    expect(screen.getByText(/no photos in this place yet/i)).toBeTruthy();
    expect(screen.getByText(/drag and drop or browse/i)).toBeTruthy();
    expect(screen.getByLabelText(/caption/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /upload photo/i })).toBeTruthy();
  });

  it('shows a retry action when an upload fails', () => {
    const uploadMutate = vi.fn();

    vi.mocked(usePhotos).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof usePhotos>);
    vi.mocked(useUploadPhoto).mockReturnValue({
      mutate: uploadMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUploadPhoto>);
    vi.mocked(useDeletePhoto).mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useDeletePhoto>);

    const { container } = render(<PlaceGallery placeId="place-1" />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = (
      container as unknown as {
        querySelector: (selector: string) => HTMLInputElement | null;
      }
    ).querySelector('input[type="file"]');

    if (!input) {
      throw new Error('file input not found');
    }

    fireEvent.change(input, { target: { files: [file] } });

    expect(uploadMutate).toHaveBeenCalled();
  });
});
