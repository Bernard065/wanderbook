import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, Bell, ChevronDown, Menu, X } from 'lucide-react';
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
      <header className="h-16 border-b bg-white flex items-center px-3 gap-2 md:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search places, countries, journal..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setMobileSearchOpen(false)}
          className="p-2 shrink-0"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </header>
    );
  }

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-3 md:px-6 gap-2 md:gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button onClick={onMenuClick} className="md:hidden p-1 shrink-0">
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* Full search bar: tablet and up */}
        <div className="relative hidden md:block md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search places, countries, journal..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Search icon only: mobile */}
      <button
        onClick={() => setMobileSearchOpen(true)}
        className="md:hidden p-2 shrink-0"
      >
        <Search className="h-5 w-5 text-gray-600" />
      </button>

      <div className="flex items-center gap-1 md:gap-3 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="md:h-9 md:px-4">
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
            <DropdownMenuItem>Write Journal Entry</DropdownMenuItem>
            <DropdownMenuItem>Add Expense</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
            3
          </Badge>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
