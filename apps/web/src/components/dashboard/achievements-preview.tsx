import { Link } from 'react-router';
import { useAchievements } from '@/hooks/use-achievements';

export function AchievementsPreview() {
  const { achievements, unlockedIds } = useAchievements();
  const unlocked = achievements
    .filter((a) => unlockedIds.has(a.id))
    .slice(0, 4);

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Achievements</h3>
        <Link to="/achievements" className="text-xs text-blue-600 font-medium">
          View all
        </Link>
      </div>
      {unlocked.length === 0 ? (
        <p className="text-xs text-gray-400">
          Add places and trips to start unlocking achievements.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {unlocked.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.id} className="text-center">
                <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-[10px] text-gray-500 mt-1 truncate">
                  {a.name}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
