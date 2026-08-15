import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Globe,
  Lock,
  MapPin,
  Search,
  Star,
  StarOff,
  Trash2,
} from 'lucide-react';

import { AddJournalEntryDialog } from '@/components/add-journal-entry-dialog';
import { EditJournalEntryDialog } from '@/components/edit-journal-entry-dialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { Input } from '@/components/ui/input';

import {
  useAllJournalEntries,
  useDeleteJournalEntry,
  type JournalEntry,
} from '@/hooks/use-journal-entries';

import { usePlaces } from '@/hooks/use-places';
import { useTrips } from '@/hooks/use-trips';
import type { Place } from '@org/types';

interface PlaceWithCover extends Place {
  coverUrl?: string | null;
}

const FAVORITES_STORAGE_KEY = 'wanderbook-journal-favorites';

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

interface JournalSidebarItemProps {
  entry: JournalEntry;
  placeName?: string;
  coverUrl?: string | null;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

const JournalSidebarItem = ({
  entry,
  placeName,
  coverUrl,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: JournalSidebarItemProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`group relative cursor-pointer overflow-hidden rounded-3xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isSelected
          ? 'border-blue-300 bg-blue-50 shadow-sm'
          : 'border bg-card hover:border-input hover:shadow-sm'
      }`}
    >
      {coverUrl ? (
        <div className="relative h-36 w-full overflow-hidden">
          <img
            src={coverUrl}
            alt={placeName ?? entry.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-muted text-dark-foreground">
          <BookOpen className="h-10 w-10" />
        </div>
      )}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite();
        }}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-card/95 text-muted-foreground shadow-sm transition hover:scale-105 hover:text-amber-500"
      >
        {isFavorite ? (
          <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
        ) : (
          <StarOff className="h-4 w-4" />
        )}
      </button>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-semibold text-foreground">
            {entry.title}
          </h3>
        </div>

        <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">
          {entry.content}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {placeName ? (
            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-slate-600">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{placeName}</span>
            </span>
          ) : null}

          {entry.mood ? (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-primary">
              {entry.mood}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export function JournalPage() {
  const { data: entries, isLoading, error } = useAllJournalEntries();
  const { data: places } = usePlaces();
  const { data: trips } = useTrips();

  const { mutate: deleteEntry, isPending: isDeleting } =
    useDeleteJournalEntry();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string>();
  const [favoriteEntryIds, setFavoriteEntryIds] = useState<Set<string>>(
    new Set(),
  );

  const placeById = useMemo(
    () =>
      new Map(
        (places ?? []).map((place) => [place.id, place as PlaceWithCover]),
      ),
    [places],
  );

  const filteredEntries = useMemo(() => {
    if (!entries) return [];

    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return entries;
    }

    return entries.filter((entry) => {
      const place = placeById.get(entry.placeId);
      const placeName = place?.name ?? '';
      const tags = entry.tags?.join(' ') ?? '';

      return [
        entry.title,
        entry.content,
        entry.mood ?? '',
        entry.weather ?? '',
        tags,
        placeName,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [entries, placeById, searchTerm]);

  /*
   * Load favorites from localStorage.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

      if (!stored) return;

      const parsed: unknown = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        const validIds = parsed.filter(
          (value): value is string => typeof value === 'string',
        );

        setFavoriteEntryIds(new Set(validIds));
      }
    } catch {
      // Ignore malformed localStorage data.
    }
  }, []);

  /*
   * Persist favorites.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(Array.from(favoriteEntryIds)),
    );
  }, [favoriteEntryIds]);

  /*
   * Keep the selected entry valid when entries change.
   */
  useEffect(() => {
    if (!entries || entries.length === 0) {
      setSelectedEntryId(undefined);
      return;
    }

    if (!selectedEntryId) {
      setSelectedEntryId(entries[0].id);
      return;
    }

    const selectedStillExists = entries.some(
      (entry) => entry.id === selectedEntryId,
    );

    if (!selectedStillExists) {
      setSelectedEntryId(entries[0].id);
    }
  }, [entries, selectedEntryId]);

  /*
   * Keep the selected entry inside the current search results.
   */
  useEffect(() => {
    if (!filteredEntries.length) return;

    const selectedIsVisible =
      selectedEntryId &&
      filteredEntries.some((entry) => entry.id === selectedEntryId);

    if (!selectedIsVisible) {
      setSelectedEntryId(filteredEntries[0].id);
    }
  }, [filteredEntries, selectedEntryId]);

  const selectedEntry = useMemo(
    () => entries?.find((entry) => entry.id === selectedEntryId),
    [entries, selectedEntryId],
  );

  const selectedPlace = selectedEntry
    ? placeById.get(selectedEntry.placeId)
    : undefined;

  const tripById = useMemo(
    () => new Map((trips ?? []).map((trip) => [trip.id, trip.name])),
    [trips],
  );

  const selectedTripName = selectedEntry
    ? tripById.get(selectedEntry.tripId ?? '')
    : undefined;

  const toggleFavorite = (entryId: string) => {
    setFavoriteEntryIds((current) => {
      const next = new Set(current);

      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }

      return next;
    });
  };

  const handleDeleteSelectedEntry = () => {
    if (!selectedEntry) return;

    const confirmed = window.confirm(
      'Delete this journal entry? This action cannot be undone.',
    );

    if (!confirmed) return;

    deleteEntry(selectedEntry.id, {
      onSuccess: () => {
        setFavoriteEntryIds((current) => {
          const next = new Set(current);
          next.delete(selectedEntry.id);
          return next;
        });

        setSelectedEntryId(undefined);
      },
    });
  };

  const hasEntries = Boolean(entries?.length);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Journal
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Every story from every place you've visited.
              </p>
            </div>
          </div>
        </div>

        <AddJournalEntryDialog>
          <Button className="rounded-xl">
            <BookOpen className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </AddJournalEntryDialog>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-3xl border border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-5 w-5 animate-pulse text-muted-foreground" />
          </div>

          <p className="text-sm text-muted-foreground">Loading journal...</p>
        </div>
      )}

      {/* Error */}
      {error && <ErrorMessage error={error} />}

      {/* Empty state */}
      {!hasEntries && !isLoading && !error && (
        <EmptyState
          icon={BookOpen}
          title="No memories captured yet"
          description="Write your first journal entry and build a personal archive of your adventures."
          action={
            <AddJournalEntryDialog>
              <Button>Start writing</Button>
            </AddJournalEntryDialog>
          }
        />
      )}

      {/* Journal */}
      {hasEntries && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Search */}
            <div className="rounded-3xl border border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2.5 text-muted-foreground shadow-inner">
                <Search className="h-4 w-4 shrink-0" />

                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search journal entries..."
                  className="h-auto border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>

              {searchTerm.trim() && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {filteredEntries.length}{' '}
                  {filteredEntries.length === 1 ? 'entry' : 'entries'} found
                </p>
              )}
            </div>

            {/* Entries */}
            <div className="space-y-3">
              {filteredEntries.length === 0 ? (
                <div className="rounded-3xl border border bg-card p-6 text-center shadow-sm">
                  <Search className="mx-auto mb-3 h-8 w-8 text-dark-foreground" />

                  <p className="text-sm font-medium text-slate-700">
                    No entries found
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Try a different search term.
                  </p>
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <JournalSidebarItem
                    key={entry.id}
                    entry={entry}
                    placeName={placeById.get(entry.placeId)?.name}
                    coverUrl={placeById.get(entry.placeId)?.coverUrl}
                    isSelected={entry.id === selectedEntryId}
                    isFavorite={favoriteEntryIds.has(entry.id)}
                    onSelect={() => setSelectedEntryId(entry.id)}
                    onToggleFavorite={() => toggleFavorite(entry.id)}
                  />
                ))
              )}
            </div>
          </aside>

          {/* Main journal */}
          <main className="min-w-0">
            {!selectedEntry ? (
              <div className="flex min-h-125 items-center justify-center rounded-3xl border border bg-card p-6 shadow-sm">
                <div className="text-center">
                  <BookOpen className="mx-auto mb-3 h-10 w-10 text-dark-foreground" />

                  <p className="text-sm text-muted-foreground">
                    Select a journal entry to view the full story.
                  </p>
                </div>
              </div>
            ) : (
              <article className="overflow-hidden rounded-3xl border border bg-card shadow-sm">
                {/* Cover */}
                {selectedPlace?.coverUrl ? (
                  <div className="relative h-64 w-full sm:h-80">
                    <img
                      src={selectedPlace.coverUrl}
                      alt={selectedPlace.name}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />

                    {selectedPlace.name && (
                      <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                        <MapPin className="h-4 w-4" />
                        {selectedPlace.name}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center bg-muted text-dark-foreground sm:h-80">
                    <BookOpen className="h-16 w-16" />
                  </div>
                )}

                {/* Content */}
                <div className="space-y-6 p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {selectedPlace?.name && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {selectedPlace.name}
                          </span>
                        )}

                        {selectedEntry.entryDate ? (
                          <span>{formatDate(selectedEntry.entryDate)}</span>
                        ) : (
                          <span>{formatDate(selectedEntry.createdAt)}</span>
                        )}

                        {selectedTripName ? (
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-slate-600">
                            {selectedTripName}
                          </span>
                        ) : null}

                        {selectedEntry.weather ? (
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-slate-600">
                            {selectedEntry.weather}
                          </span>
                        ) : null}

                        <span className="flex items-center gap-1.5">
                          {selectedEntry.isPrivate ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Globe className="h-4 w-4" />
                          )}

                          {selectedEntry.isPrivate ? 'Private' : 'Public'}
                        </span>

                        {selectedEntry.mood && (
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-slate-600">
                            {selectedEntry.mood}
                          </span>
                        )}
                      </div>

                      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        {selectedEntry.title}
                      </h2>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(selectedEntry.id)}
                      >
                        {favoriteEntryIds.has(selectedEntry.id) ? (
                          <Star className="mr-2 h-4 w-4 fill-amber-400 text-amber-500" />
                        ) : (
                          <StarOff className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}

                        {favoriteEntryIds.has(selectedEntry.id)
                          ? 'Favorited'
                          : 'Favorite'}
                      </Button>

                      <EditJournalEntryDialog entry={selectedEntry} />

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={isDeleting}
                        onClick={handleDeleteSelectedEntry}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>

                  <div className="h-px bg-muted" />

                  {/* Story */}
                  <div className="whitespace-pre-wrap text-[16px] leading-8 text-slate-700">
                    {selectedEntry.content}
                  </div>
                </div>
              </article>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
