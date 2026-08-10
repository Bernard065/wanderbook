import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { SearchDropdown } from './search-dropdown';
import { useSearch } from '@/hooks/use-search';

vi.mock('@/hooks/use-debounced-value', () => ({
  useDebouncedValue: (value: string) => value,
}));

vi.mock('@/hooks/use-search', () => ({
  useSearch: vi.fn(),
}));

describe('SearchDropdown', () => {
  it('renders loading skeletons while the search query is fetching', () => {
    vi.mocked(useSearch).mockReturnValue({
      data: undefined,
      isFetching: true,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSearch>);

    render(
      <MemoryRouter>
        <SearchDropdown />
      </MemoryRouter>,
    );

    fireEvent.focus(screen.getByPlaceholderText(/search places/i));
    fireEvent.change(screen.getByPlaceholderText(/search places/i), {
      target: { value: 'beach' },
    });

    expect(screen.getByText(/Searching for/i)).toBeTruthy();
    expect(screen.getAllByTestId('search-skeleton')).toHaveLength(3);
  });

  it('navigates to the highlighted result when Enter is pressed', () => {
    vi.mocked(useSearch).mockReturnValue({
      data: {
        places: [{ id: 'place-1', name: 'Beach House' }],
        trips: [],
        journalEntries: [],
        memories: [],
        bucketListItems: [],
      },
      isFetching: false,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSearch>);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<SearchDropdown />} />
          <Route path="/places/:id" element={<div>Place page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(/search places/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'beach' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('Place page')).toBeTruthy();
  });
});
