import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import { SearchPage } from './search-page';
import { useSearch } from '@/hooks/use-search';

vi.mock('@/hooks/use-search', () => ({
  useSearch: vi.fn(),
}));

describe('SearchPage', () => {
  it('renders empty search state when no query is present', () => {
    vi.mocked(useSearch).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSearch>);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/search']}>
          <Routes>
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Search' })).toBeTruthy();
    expect(
      screen.getByText(
        /Search your places, trips, journal entries, and photos./,
      ),
    ).toBeTruthy();
  });

  it('renders photo results when search returns photos', () => {
    vi.mocked(useSearch).mockReturnValue({
      data: {
        places: [],
        trips: [],
        journalEntries: [],
        photos: [
          {
            id: 'photo-1',
            placeId: 'place-1',
            caption: 'Beach sunset',
            url: 'https://example.test/test-key',
            createdAt: '2026-08-07T00:00:00Z',
          },
        ],
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSearch>);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/search?q=beach']}>
          <Routes>
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole('heading', { name: 'Search results' }),
    ).toBeTruthy();
    expect(screen.getByText('Photos')).toBeTruthy();
    expect(screen.getByAltText('Photo: Beach sunset')).toBeTruthy();
  });
});
