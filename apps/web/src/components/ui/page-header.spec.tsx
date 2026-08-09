import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders the title, description, and optional action', () => {
    render(
      <PageHeader
        title="Trips"
        description="Plan and revisit your adventures."
        action={<button type="button">Create trip</button>}
      />,
    );

    expect(screen.getByText('Trips')).toBeTruthy();
    expect(screen.getByText('Plan and revisit your adventures.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create trip' })).toBeTruthy();
  });
});
