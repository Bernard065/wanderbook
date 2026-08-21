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
          'z-50 flex h-screen flex-col border-r border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] backdrop-blur-sm',
          'fixed inset-y-0 left-0 w-64 transition-transform duration-200',
          'md:static md:translate-x-0 md:w-24 lg:w-[220px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-5 md:px-3 lg:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] text-white shadow-[0_12px_30px_-16px_rgba(59,130,246,0.9)]">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="truncate text-[1.7rem] font-semibold tracking-[-0.06em] text-slate-900 md:hidden lg:inline lg:text-[1.85rem]">
              WanderBook
            </span>
          </div>
          <button onClick={onClose} className="p-1 md:hidden">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3 py-2"
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
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  'md:justify-center lg:justify-start',
                  active
                    ? 'bg-[linear-gradient(135deg,#e0f2fe_0%,#dbeafe_45%,#ede9fe_100%)] text-[#1d4ed8] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.08),0_18px_28px_-20px_rgba(59,130,246,0.5)]'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
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
