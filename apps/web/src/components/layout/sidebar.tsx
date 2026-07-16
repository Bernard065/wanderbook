import { NavLink } from 'react-router';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/constants/nav-items';
import { MapPin } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-60 border-r bg-white flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 flex items-center gap-2">
        <MapPin className="h-6 w-6 text-blue-600" />
        <span className="font-semibold text-lg">WanderBook</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
