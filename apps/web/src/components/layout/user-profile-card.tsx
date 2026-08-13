import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/get-initials';
import { useAchievements } from '@/hooks/use-achievements';

export function UserProfileCard() {
  const user = useAuthStore((s) => s.user);
  const { level, xpIntoLevel, xpForNextLevel } = useAchievements();

  const initials = user ? getInitials(user.fullName, user.email) : '?';
  const displayName = user?.fullName || user?.email || 'Guest';
  const avatarUrl = user?.profilePhotoUrl || undefined;
  const xpPercent = Math.round((xpIntoLevel / xpForNextLevel) * 100);

  return (
    <div className="flex items-center gap-3 px-3 md:px-2 lg:px-3 py-4 border-t">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="bg-blue-600 text-sm font-medium text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 md:hidden lg:block">
        <p className="text-sm font-medium truncate">{displayName}</p>
        <p className="text-xs text-gray-500">Explorer Level {level}</p>
        <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full bg-blue-600"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
