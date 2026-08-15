import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Menu, Plus, Search, X } from 'lucide-react';

import { AddExpenseDialog } from '@/components/add-expense-dialog';
import { AddJournalEntryDialog } from '@/components/add-journal-entry-dialog';
import { AddPlaceDialog } from '@/components/add-place-dialog';
import { AddTripDialog } from '@/components/add-trip-dialog';
import { SearchDropdown } from '@/components/layout/search-dropdown';
import { UploadDocumentDialog } from '@/components/upload-document-dialog';
import { UploadMediaDialog } from '@/components/upload-media-dialog';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

function AddNewMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className="gap-1 md:h-9 md:px-4"
          aria-label="Add new"
        >
          <Plus className="size-4" aria-hidden="true" />

          <span className="hidden sm:inline">Add New</span>

          <ChevronDown className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <AddPlaceDialog>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            Add Place
          </DropdownMenuItem>
        </AddPlaceDialog>

        <AddTripDialog>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            Create Trip
          </DropdownMenuItem>
        </AddTripDialog>

        <AddJournalEntryDialog
          dialogTitle="Write a Journal Entry"
          dialogDescription="Capture your thoughts, notes, and travel stories."
        >
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            Write Journal Entry
          </DropdownMenuItem>
        </AddJournalEntryDialog>

        <AddJournalEntryDialog
          dialogTitle="Add Memory"
          dialogDescription="Capture a new travel memory in your journal."
        >
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            Add Memory
          </DropdownMenuItem>
        </AddJournalEntryDialog>

        <AddExpenseDialog>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            Add Expense
          </DropdownMenuItem>
        </AddExpenseDialog>

        <UploadMediaDialog>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            Upload Media
          </DropdownMenuItem>
        </UploadMediaDialog>

        <UploadDocumentDialog>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            Add Document
          </DropdownMenuItem>
        </UploadDocumentDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const navigate = useNavigate();

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  const initials = user ? getInitials(user.fullName, user.email) : '?';
  const avatarUrl = user?.profilePhotoUrl?.trim() || undefined;

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="flex items-center gap-1 rounded-md p-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Avatar className="size-8">
            {avatarUrl ? (
              <AvatarImage
                src={avatarUrl}
                alt={user?.fullName || user?.email || 'User avatar'}
              />
            ) : null}

            <AvatarFallback className="bg-primary font-medium text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <ChevronDown
            className="hidden size-4 text-muted-foreground sm:block"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {user ? (
          <div className="border-b px-3 py-2">
            <p className="truncate text-sm font-medium text-foreground">
              {user.fullName}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        ) : null}

        <DropdownMenuItem onClick={() => navigate('/profile')}>
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const openMobileSearch = useCallback(() => {
    setMobileSearchOpen(true);
  }, []);

  const closeMobileSearch = useCallback(() => {
    setMobileSearchOpen(false);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const isSearchShortcut =
        event.key.toLowerCase() === 'k' &&
        (event.metaKey || event.ctrlKey);

      if (!isSearchShortcut) {
        return;
      }

      event.preventDefault();
      setMobileSearchOpen(true);
    };

    window.addEventListener('keydown', handleShortcut);

    return () => {
      window.removeEventListener('keydown', handleShortcut);
    };
  }, []);

  if (mobileSearchOpen) {
    return (
      <header className="flex h-16 items-center gap-3 border-b border bg-card px-4 md:px-6">
        <SearchDropdown
          className="min-w-0 flex-1"
          autoFocus
          onNavigate={closeMobileSearch}
          onClose={closeMobileSearch}
        />

        <button
          type="button"
          onClick={closeMobileSearch}
          aria-label="Close search"
          className="shrink-0 rounded-md p-2 text-slate-600 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>
    );
  }

  return (
    <header className="flex h-16 items-center gap-3 border-b border bg-card px-4 md:px-6">
      {/* Left side */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="shrink-0 rounded-md p-2 text-slate-600 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        {/* Desktop search */}
        <SearchDropdown className="hidden max-w-xl flex-1 md:block" />
      </div>

      {/* Mobile search */}
      <button
        type="button"
        onClick={openMobileSearch}
        aria-label="Search"
        className="shrink-0 rounded-md p-2 text-slate-600 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
      >
        <Search className="size-5" aria-hidden="true" />
      </button>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-1 md:gap-3">
        <AddNewMenu />
        <UserMenu />
      </div>
    </header>
  );
}

export default Topbar;
