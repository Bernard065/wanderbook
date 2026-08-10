import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  ChevronDown,
  Menu,
  Plus,
  Search,
  Settings,
  X,
} from 'lucide-react';

import { AddFlightDialog } from '@/components/add-flight-dialog';
import { AddJournalEntryDialog } from '@/components/add-journal-entry-dialog';
import { AddPlaceDialog } from '@/components/add-place-dialog';
import { AddTripDialog } from '@/components/add-trip-dialog';
import { SearchDropdown } from '@/components/layout/search-dropdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/get-initials';
import { useAuthStore } from '@/stores/auth-store';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  const initials = user
    ? getInitials(user.fullName, user.email)
    : '?';

  const openMobileSearch = useCallback(() => {
    setMobileSearchOpen(true);
  }, []);

  const closeMobileSearch = useCallback(() => {
    setMobileSearchOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      const isSearchShortcut =
        event.key.toLowerCase() === 'k' &&
        (event.metaKey || event.ctrlKey);

      if (!isSearchShortcut) {
        return;
      }

      event.preventDefault();

      setMobileSearchOpen(true);

      window.requestAnimationFrame(() => {
        const input =
          document.querySelector<HTMLInputElement>(
            '[data-global-search-input]',
          );

        input?.focus();
      });
    };

    window.addEventListener('keydown', handleShortcut);

    return () => {
      window.removeEventListener('keydown', handleShortcut);
    };
  }, []);

  if (mobileSearchOpen) {
    return (
      <header className="flex h-16 items-center gap-2 border-b bg-white px-3 md:px-6">
        <SearchDropdown
          className="flex-1"
          autoFocus
          onNavigate={closeMobileSearch}
        />

        <button
          type="button"
          onClick={closeMobileSearch}
          aria-label="Close search"
          className="shrink-0 rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>
    );
  }

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b bg-white px-3 md:px-6">
      {/* Left */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="shrink-0 rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        <SearchDropdown className="hidden max-w-xl flex-1 md:block" />
      </div>

      {/* Mobile Search */}
      <button
        type="button"
        onClick={openMobileSearch}
        aria-label="Search"
        className="shrink-0 rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
      >
        <Search className="size-5" aria-hidden="true" />
      </button>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-1 md:gap-3">
        {/* Add New */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="gap-1 md:h-9 md:px-4"
              aria-label="Add new"
            >
              <Plus className="size-4" aria-hidden="true" />

              <span className="hidden sm:inline">Add New</span>

              <ChevronDown
                className="size-4"
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <AddPlaceDialog>
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
              >
                Add Place
              </DropdownMenuItem>
            </AddPlaceDialog>

            <AddTripDialog>
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
              >
                Add Trip
              </DropdownMenuItem>
            </AddTripDialog>

            <AddFlightDialog>
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
              >
                Log Flight
              </DropdownMenuItem>
            </AddFlightDialog>

            <AddJournalEntryDialog>
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
              >
                Add Journal Entry
              </DropdownMenuItem>
            </AddJournalEntryDialog>

            <DropdownMenuItem>Add Expense</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative hidden rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:inline-flex"
        >
          <Bell className="size-5" aria-hidden="true" />

          <Badge
            aria-label="3 unread notifications"
            className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
          >
            3
          </Badge>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
          className="hidden rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:inline-flex"
        >
          <Settings className="size-5" aria-hidden="true" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open account menu"
              className="flex items-center gap-1 rounded-md p-1 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-blue-600 font-medium text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <ChevronDown
                className="hidden size-4 text-slate-400 sm:block"
                aria-hidden="true"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {user && (
              <div className="border-b px-3 py-2">
                <p className="truncate text-sm font-medium text-slate-900">
                  {user.fullName}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {user.email}
                </p>
              </div>
            )}

            <DropdownMenuItem
              onClick={() => navigate('/profile')}
            >
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate('/settings')}
            >
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
