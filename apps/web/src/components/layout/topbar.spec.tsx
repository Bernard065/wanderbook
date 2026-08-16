import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '@/stores/auth-store';

import { Topbar } from './topbar';

vi.mock('@/components/layout/search-dropdown', () => ({
  SearchDropdown: () => <div data-testid="search-dropdown" />,
}));

describe('Topbar', () => {
  beforeEach(() => {
    useAuthStore.persist.clearStorage();
    useAuthStore.setState({
      token: 'token',
      user: {
        id: 'user-1',
        email: 'bob@example.com',
        fullName: 'Bob One',
        profilePhotoUrl: 'https://cdn.example.com/bob.png',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      isAuthenticated: true,
    });
  });

  it('renders the user profile photo from the auth store', () => {
    render(
      <MemoryRouter>
        <Topbar onMenuClick={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('img', { name: 'Bob One' })).toBeTruthy();
  });

  it('falls back to initials when the profile photo fails to load', () => {
    useAuthStore.setState({
      token: 'token',
      user: {
        id: 'user-1',
        email: 'bob@example.com',
        fullName: 'Bob One',
        profilePhotoUrl: 'https://cdn.example.com/broken.png',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      isAuthenticated: true,
    });

    render(
      <MemoryRouter>
        <Topbar onMenuClick={vi.fn()} />
      </MemoryRouter>,
    );

    const image = screen.getByRole('img', { name: 'Bob One' });
    fireEvent.error(image);

    expect(screen.queryByRole('img', { name: 'Bob One' })).toBeNull();
    expect(screen.getByText('BO')).toBeTruthy();
  });
});
