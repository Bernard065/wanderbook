import { ACHIEVEMENT_CATEGORIES } from '@/constants/achievements';
import type { AchievementCategory } from '@/constants/achievements';
import { AchievementCard } from '@/components/achievement-card';
import { PageHeader } from '@/components/ui/page-header';
import { useAchievements } from '@/hooks/use-achievements';

export function AchievementsPage() {
  const {
    isLoading,
    achievements,
    unlockedIds,
    unlockedCount,
    totalCount,
    level,
    xp,
    xpIntoLevel,
    xpForNextLevel,
  } = useAchievements();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border bg-card/95 p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading achievements...</p>
      </div>
    );
  }

  const progress = Math.min(
    100,
    Math.round((xpIntoLevel / Math.max(1, xpForNextLevel)) * 100),
  );

  const categories = ACHIEVEMENT_CATEGORIES.filter((category) =>
    achievements.some((achievement) => achievement.category === category),
  );

  const groupedAchievements = achievements.reduce(
    (groups, achievement) => {
      const category = achievement.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(achievement);
      return groups;
    },
    {} as Record<AchievementCategory, typeof achievements>,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Achievements"
        description="Track your level, XP, and progress across explorer badge categories."
      />

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-6 rounded-3xl border border bg-card/95 p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.24em]">
              Explorer Progress
            </p>
            <p className="mt-4 text-3xl font-semibold text-foreground">
              Level {level}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {xp} XP total · {unlockedCount} of {totalCount} badges unlocked
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-700">Progress to next level</p>
              <p className="text-sm font-semibold text-foreground">
                {progress}%
              </p>
            </div>
            <div className="rounded-full bg-muted h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {xpIntoLevel} / {xpForNextLevel} XP towards level {level + 1}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {categories.map((category) => (
            <section key={category} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {category}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {
                      groupedAchievements[category].filter((achievement) =>
                        unlockedIds.has(achievement.id),
                      ).length
                    }{' '}
                    of {groupedAchievements[category].length} unlocked
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {groupedAchievements[category].map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={unlockedIds.has(achievement.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
