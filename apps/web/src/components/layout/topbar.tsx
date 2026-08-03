import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus,
  Bell,
  ChevronDown,
  Menu,
  X,
  Search,
  Settings,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { AddPlaceDialog } from '@/components/add-place-dialog';
import { AddTripDialog } from '@/components/add-trip-dialog';
import { AddFlightDialog } from '@/components/add-flight-dialog';
import { AddJournalEntryDialog } from '@/components/add-journal-entry-dialog';
import { SearchDropdown } from '@/components/layout/search-dropdown';

import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/get-initials';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const initials = user ? getInitials(user.fullName, user.email) : '?';

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  if (mobileSearchOpen) {
    return (
      <header className="flex h-16 items-center gap-2 border-b bg-white px-3 md:hidden">
        <SearchDropdown
          className="flex-1"
          autoFocus
          onNavigate={() => setMobileSearchOpen(false)}
        />

        <button
          type="button"
          onClick={() => setMobileSearchOpen(false)}
          className="shrink-0 p-2"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </header>
    );
  }

  return (
    <header className="flex h-16 items-center justify-between gap-2 border-b bg-white px-3 md:gap-4 md:px-6">
      {/* Left */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="shrink-0 p-1 md:hidden"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        <SearchDropdown className="hidden max-w-xl flex-1 md:block" />
      </div>

      {/* Mobile Search Button */}
      <button
        type="button"
        onClick={() => setMobileSearchOpen(true)}
        className="shrink-0 p-2 md:hidden"
      >
        <Search className="h-5 w-5 text-gray-600" />
      </button>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-1 md:gap-3">
        {/* Add New */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1 md:h-9 md:px-4">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add New</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <AddPlaceDialog>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Add Place
              </DropdownMenuItem>
            </AddPlaceDialog>

            <AddTripDialog>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Add Trip
              </DropdownMenuItem>
            </AddTripDialog>

            <AddFlightDialog>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Log Flight
              </DropdownMenuItem>
            </AddFlightDialog>

            <AddJournalEntryDialog>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Add Journal Entry
              </DropdownMenuItem>
            </AddJournalEntryDialog>

            <DropdownMenuItem>Add Expense</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <button
          type="button"
          className="relative hidden rounded-full p-2 hover:bg-gray-100 sm:inline-flex"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center p-0 text-[10px]">
            3
          </Badge>
        </button>

        {/* Settings */}
        <button
          type="button"
          className="hidden rounded-full p-2 hover:bg-gray-100 sm:inline-flex"
        >
          <Settings className="h-5 w-5 text-gray-600" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 rounded-md"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 font-medium text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/settings')}>
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
