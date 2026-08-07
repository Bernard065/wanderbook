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
    });

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
});
