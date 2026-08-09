import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { Sidebar } from './sidebar';

vi.mock('./user-profile-card', () => ({
  UserProfileCard: () => <div data-testid="profile-card" />,
}));

describe('Sidebar', () => {
  it('renders the dashboard nav item as active for the dashboard route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={<Sidebar mobileOpen={false} onClose={() => undefined} />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const dashboardLink = screen.getByRole('link', {
      name: /dashboard/i,
    });

    expect(dashboardLink).toBeTruthy();
    expect(dashboardLink.textContent).toContain('Dashboard');
  });
});
