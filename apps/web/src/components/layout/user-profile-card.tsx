import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/get-initials';
import { useAchievements } from '@/hooks/use-achievements';

export function UserProfileCard() {
  const user = useAuthStore((s) => s.user);
  const { level, xpIntoLevel, xpForNextLevel, isLoading } = useAchievements();

  const { fullName, email, profilePhotoUrl } = user ?? {};

  const initials = user ? getInitials(fullName ?? null, email ?? null) : '?';
  const displayName = fullName || email || 'Guest';
  const avatarUrl = profilePhotoUrl?.trim() || undefined;

  const xpPercent =
    xpForNextLevel > 0
      ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100))
      : 100;

  return (
    <div className="flex items-center gap-3 px-3 md:px-2 lg:px-3 py-4 border-t">
      <Avatar className="h-9 w-9 shrink-0">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
        <AvatarFallback className="bg-blue-600 text-sm font-medium text-white">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Text hidden at the icon-only rail (md), shown again once the sidebar widens (lg) */}
      <div className="min-w-0 md:hidden lg:block">
        <p className="text-sm font-medium truncate">{displayName}</p>

        {isLoading ? (
          <>
            <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-1.5 h-1.5 w-full animate-pulse rounded-full bg-gray-200" />
          </>
        ) : (
          <>
            <p className="text-xs text-gray-500">Explorer Level {level}</p>
            <div
              role="progressbar"
              aria-valuenow={xpPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`XP progress: ${xpPercent}%`}
              className="mt-1 h-1.5 w-full rounded-full bg-gray-200"
            >
              <div
                className="h-1.5 rounded-full bg-blue-600 transition-all"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
