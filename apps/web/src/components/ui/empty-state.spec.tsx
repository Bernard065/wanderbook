import { render, screen } from '@testing-library/react';
import { Compass } from 'lucide-react';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('renders the title, description, and optional action', () => {
    render(
      <EmptyState
        icon={Compass}
        title="No adventures yet"
        description="Start your first journey to fill this space."
        action={<button type="button">Create trip</button>}
      />,
    );

    expect(screen.getByText('No adventures yet')).toBeTruthy();
    expect(
      screen.getByText('Start your first journey to fill this space.'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create trip' })).toBeTruthy();
  });
});
