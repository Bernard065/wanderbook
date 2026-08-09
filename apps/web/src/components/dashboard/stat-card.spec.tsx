import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Sparkles } from 'lucide-react';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  it('renders icon, label, value, unit, and supporting text', () => {
    render(
      <StatCard
        icon={Sparkles}
        label="Achievements"
        value={12}
        unit="pts"
        supportingText="New badges unlocked"
        iconClassName="bg-indigo-50 text-indigo-600"
      />,
    );

    expect(screen.getByText('Achievements')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('pts')).toBeTruthy();
    expect(screen.getByText('New badges unlocked')).toBeTruthy();
  });

  it('shows loading skeleton when isLoading is true', () => {
    const { container, queryByText } = render(
      <StatCard
        icon={Sparkles}
        label="Total Expenses"
        value={0}
        supportingText="Loading spending data"
        isLoading
      />,
    );

    expect(screen.getByText(/Total Expenses/i)).toBeTruthy();
    expect(queryByText('Loading spending data')).toBeNull();
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });
});
