import type { Achievement } from '@/constants/achievements';
import { cn } from '@/lib/utils';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
}

export function AchievementCard({
  achievement,
  unlocked,
}: AchievementCardProps) {
  const Icon = achievement.icon;

  return (
    <div
      className={cn(
        'rounded-3xl border p-5 transition-all',
        unlocked
          ? 'bg-card border shadow-sm hover:shadow-md'
          : 'bg-muted border text-muted-foreground opacity-90',
      )}
    >
      <div
        className={cn(
          'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl',
          unlocked
            ? 'bg-linear-to-br from-blue-500 to-cyan-500 text-white shadow-lg'
            : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p
          className={cn(
            'font-semibold text-sm',
            unlocked ? 'text-foreground' : 'text-slate-700',
          )}
        >
          {achievement.name}
        </p>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
            unlocked
              ? 'bg-blue-100 text-primary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {unlocked ? 'Unlocked' : 'Locked'}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {achievement.description}
      </p>
    </div>
  );
}
