import { cn } from '@/lib/utils';
import { useAchievements } from '@/hooks/use-achievements';

export function AchievementsPage() {
  const { isLoading, achievements, unlockedIds, unlockedCount, totalCount, level, xp } =
    useAchievements();

  if (isLoading) return <p>Loading achievements...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Achievements</h1>
      <p className="text-gray-500 mb-6">
        {unlockedCount} of {totalCount} unlocked · Explorer Level {level} ·{' '}
        {xp} XP
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const Icon = achievement.icon;
          return (
            <div
              key={achievement.id}
              className={cn(
                'border rounded-lg p-4 text-center',
                isUnlocked ? 'bg-white' : 'bg-gray-50 opacity-60',
              )}
            >
              <div
                className={cn(
                  'h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3',
                  isUnlocked
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-200 text-gray-400',
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <p className="font-medium text-sm">{achievement.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {achievement.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
