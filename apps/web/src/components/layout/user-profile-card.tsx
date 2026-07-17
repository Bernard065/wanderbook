import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/get-initials';

export function UserProfileCard() {
  const user = useAuthStore((s) => s.user);

  const xpCurrent = 4680;
  const xpTotal = 6000;
  const xpPercent = Math.round((xpCurrent / xpTotal) * 100);

  const initials = user ? getInitials(user.fullName, user.email) : '?';
  const displayName = user?.fullName || user?.email || 'Guest';

  return (
    <div className="flex items-center gap-3 px-3 md:px-2 lg:px-3 py-4 border-t">
      <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
        {initials}
      </div>
      <div className="min-w-0 md:hidden lg:block">
        <p className="text-sm font-medium truncate">{displayName}</p>
        <p className="text-xs text-gray-500">Explorer Level 5</p>
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
