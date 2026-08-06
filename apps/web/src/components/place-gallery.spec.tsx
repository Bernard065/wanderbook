import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText(/upload a photo to start/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /upload photo/i })).toBeTruthy();
  });
});
