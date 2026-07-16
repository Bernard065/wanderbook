import { NavLink } from 'react-router';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/constants/nav-items';
import { MapPin, X } from 'lucide-react';
import { TravelBookPromo } from './travel-book-promo';
import { UserProfileCard } from './user-profile-card';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'flex flex-col bg-white border-r h-screen z-50',
          'fixed inset-y-0 left-0 w-64 transition-transform duration-200',
          'md:static md:translate-x-0 md:w-16 lg:w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-4 md:px-3 lg:px-6 py-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-6 w-6 text-blue-600 shrink-0" />
            <span className="font-semibold text-lg md:hidden lg:inline truncate">
              WanderBook
            </span>
          </div>
          <button onClick={onClose} className="md:hidden p-1">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'md:justify-center lg:justify-start',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="md:hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <TravelBookPromo />
        </div>
        <UserProfileCard />
      </aside>
    </>
  );
}
