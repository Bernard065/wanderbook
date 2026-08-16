import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

import { ProtectedRoute } from './protected-route';
import { useAuthStore, type AuthUser } from '@/stores/auth-store';

describe('auth routes', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it('does not render protected content before auth hydration finishes', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(container.innerHTML).toBe('');
  });

  it('renders protected content after auth is hydrated', () => {
    const user: AuthUser = {
      id: 'user-1',
      email: 'user@example.com',
      fullName: 'Test User',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    useAuthStore.setState({
      token: 'abc123',
      user,
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard')).toBeTruthy();
  });
});
