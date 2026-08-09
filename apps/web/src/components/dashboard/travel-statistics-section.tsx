import { SectionHeader } from '@/components/ui/section-header';
import { SurfaceCard } from '@/components/ui/surface-card';
import { StatCard } from './stat-card';
import type { LucideIcon } from 'lucide-react';

export interface TravelStatistic {
  icon: LucideIcon;
  label: string;
  value: number | string;
  unit?: string;
  supportingText?: string;
  iconClassName?: string;
  isLoading?: boolean;
}

interface TravelStatisticsSectionProps {
  stats: TravelStatistic[];
}

export function TravelStatisticsSection({
  stats,
}: TravelStatisticsSectionProps) {
  return (
    <SurfaceCard>
      <SectionHeader
        title="Travel statistics"
        description="A quick view of your journey metrics."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </SurfaceCard>
  );
}
