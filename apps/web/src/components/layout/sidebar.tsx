import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/constants/nav-items';
import { MapPin, X } from 'lucide-react';
import { UserProfileCard } from './user-profile-card';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const isItemActive = (to: string, end: boolean | undefined) => {
    if (to === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }

    if (end) {
      return location.pathname === to;
    }

    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

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
          'flex flex-col bg-card border-r h-screen z-50',
          'fixed inset-y-0 left-0 w-64 transition-transform duration-200',
          'md:static md:translate-x-0 md:w-16 lg:w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Sidebar navigation"
      >
        <div className="px-4 md:px-3 lg:px-6 py-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-6 w-6 text-primary shrink-0" />
            <span className="font-semibold text-lg md:hidden lg:inline truncate">
              WanderBook
            </span>
          </div>
          <button onClick={onClose} className="md:hidden p-1">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav
          className="flex-1 px-3 space-y-1 overflow-y-auto"
          aria-label="Primary"
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => {
            const active = isItemActive(to, end);

            return (
              <Link
                key={to}
                to={to}
                title={label}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'md:justify-center lg:justify-start',
                  active
                    ? 'bg-blue-50 text-primary'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="md:hidden lg:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <UserProfileCard />
      </aside>
    </>
  );
}
