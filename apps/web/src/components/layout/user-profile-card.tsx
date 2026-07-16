export function UserProfileCard() {
  const xpCurrent = 4680;
  const xpTotal = 6000;
  const xpPercent = Math.round((xpCurrent / xpTotal) * 100);

  return (
    <div className="flex items-center gap-3 px-3 md:px-2 lg:px-3 py-4 border-t">
      <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
        B
      </div>
      <div className="min-w-0 md:hidden lg:block">
        <p className="text-sm font-medium truncate">Bernad K.</p>
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
