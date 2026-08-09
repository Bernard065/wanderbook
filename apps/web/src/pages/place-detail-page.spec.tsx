import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { PlaceDetailPage } from './place-detail-page';

describe('PlaceDetailPage', () => {
  it('renders the overview tab for a known place', () => {
    render(
      <MemoryRouter initialEntries={['/places/kyoto']}>
        <Routes>
          <Route path="/places/:placeId" element={<PlaceDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /kyoto/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /overview/i })).toBeTruthy();
    expect(screen.getByText(/visit history/i)).toBeTruthy();
  });

  it('shows a not-found state for an unknown place id', () => {
    render(
      <MemoryRouter initialEntries={['/places/unknown-place']}>
        <Routes>
          <Route path="/places/:placeId" element={<PlaceDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/place not found/i)).toBeTruthy();
  });
});
