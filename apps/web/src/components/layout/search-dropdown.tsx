import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type * as React from 'react';
import { useNavigate } from 'react-router';
import {
  BookOpen,
  Camera,
  Luggage,
  MapPin,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react';

import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useSearch, type SearchResults } from '@/hooks/use-search';

interface SearchDropdownProps {
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
}

interface FlatResult {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
}

export function SearchDropdown({
  className,
  autoFocus,
  onNavigate,
}: SearchDropdownProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebouncedValue(query, 300);
  const trimmedQuery = query.trim();

  const { data, isFetching, isError } = useSearch(debouncedQuery);

  const {
    places = [],
    trips = [],
    journalEntries = [],
    photos = [],
  }: SearchResults = data ?? {
    places: [],
    trips: [],
    journalEntries: [],
    photos: [],
  };

  const totalResults =
    places.length + trips.length + journalEntries.length + photos.length;

  const resultsSummary = [
    { label: 'Places', count: places.length },
    { label: 'Trips', count: trips.length },
    { label: 'Journal entries', count: journalEntries.length },
    { label: 'Photos', count: photos.length },
  ].filter((item) => item.count > 0);

  const flatResults: FlatResult[] = [
    ...places.slice(0, 4).map((place) => ({
      id: `place-${place.id}`,
      path: `/places/${place.id}`,
      label: place.name,
      icon: MapPin,
    })),
    ...trips.slice(0, 4).map((trip) => ({
      id: `trip-${trip.id}`,
      path: `/trips/${trip.id}`,
      label: trip.name,
      icon: Luggage,
    })),
    ...journalEntries.slice(0, 4).map((entry) => ({
      id: `entry-${entry.id}`,
      path: `/places/${entry.placeId}`,
      label: entry.title,
      icon: BookOpen,
    })),
    ...photos.slice(0, 4).map((photo) => ({
      id: `photo-${photo.id}`,
      path: photo.placeId ? `/places/${photo.placeId}` : '/gallery',
      label: photo.caption ?? 'Photo',
      icon: Camera,
    })),
  ];

  const showDropdown = focused && trimmedQuery.length > 0;
  const isStaleQuery = debouncedQuery !== query;
  const showLoadingSkeletons = isFetching && trimmedQuery.length > 0;

  // Keep activeIndex in range whenever the result set changes shape.
  useEffect(() => {
    setActiveIndex((current) => {
      if (current < 0) return current;
      return current >= flatResults.length ? -1 : current;
    });
  }, [flatResults.length]);

  // Scroll the active item into view when navigating by keyboard.
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    if (activeEl && typeof activeEl.scrollIntoView === 'function') {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const closeDropdown = () => {
    setFocused(false);
    setActiveIndex(-1);
    onNavigate?.();
  };

  const clearQuery = () => {
    setQuery('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const goToResult = (path: string) => {
    navigate(path);
    setQuery('');
    closeDropdown();
  };

  const goToResults = () => {
    if (!trimmedQuery) return;
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    closeDropdown();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (activeIndex >= 0 && flatResults[activeIndex]) {
      goToResult(flatResults[activeIndex].path);
      return;
    }

    goToResults();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Escape':
        if (query) {
          clearQuery();
        } else {
          inputRef.current?.blur();
          closeDropdown();
        }
        return;

      case 'ArrowDown':
        if (!showDropdown || flatResults.length === 0) return;
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % flatResults.length);
        return;

      case 'ArrowUp':
        if (!showDropdown || flatResults.length === 0) return;
        event.preventDefault();
        setActiveIndex((index) =>
          index <= 0 ? flatResults.length - 1 : index - 1,
        );
        return;

      case 'Home':
        if (!showDropdown || flatResults.length === 0) return;
        event.preventDefault();
        setActiveIndex(0);
        return;

      case 'End':
        if (!showDropdown || flatResults.length === 0) return;
        event.preventDefault();
        setActiveIndex(flatResults.length - 1);
        return;

      case 'Enter':
        if (activeIndex >= 0 && flatResults[activeIndex]) {
          event.preventDefault();
          goToResult(flatResults[activeIndex].path);
        }
        return;

      default:
        return;
    }
  };

  const activeDescendantId =
    activeIndex >= 0 && flatResults[activeIndex]
      ? `search-option-${flatResults[activeIndex].id}`
      : undefined;

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const nextFocusTarget = event.relatedTarget as HTMLElement | null;
    const isMovingWithinDropdown =
      nextFocusTarget?.closest('[data-search-dropdown-root]') ?? false;

    if (isMovingWithinDropdown) {
      return;
    }

    window.setTimeout(() => setFocused(false), 150);
  };

  return (
    <div
      className={`relative w-full ${className ?? ''}`}
      data-search-dropdown-root
    >
      <form className="relative" role="search" onSubmit={handleSubmit}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 text-gray-400" />

        <input
          ref={inputRef}
          autoFocus={autoFocus}
          type="text"
          role="combobox"
          aria-label="Search places, countries, journal entries, and photos"
          aria-expanded={showDropdown}
          aria-controls="search-dropdown-listbox"
          aria-activedescendant={activeDescendantId}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          placeholder="Search places, countries, journal..."
          className="w-full rounded-md border bg-gray-50 py-2.5 pl-9 pr-9 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 md:py-2 md:text-sm"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
        />

        {query && (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 rounded p-1 -translate-y-1/2 hover:bg-gray-200"
            onMouseDown={(event) => event.preventDefault()}
            onClick={clearQuery}
          >
            <X className="h-4 w-4 text-gray-400 md:h-3.5 md:w-3.5" />
          </button>
        )}
      </form>

      {showDropdown && (
        <div
          id="search-dropdown-listbox"
          role="listbox"
          aria-label="Search results"
          ref={listRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[60vh] overflow-y-auto rounded-md border bg-white shadow-lg sm:max-h-80"
        >
          {showLoadingSkeletons && (
            <div className="px-4 py-3" role="status">
              <div className="mb-3 text-sm text-gray-400">
                Searching for "{trimmedQuery}"...
              </div>
              <div className="mb-3 h-2.5 w-32 animate-pulse rounded bg-slate-200" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    data-testid="search-skeleton"
                    className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2"
                  >
                    <div className="h-4 w-4 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-3 flex-1 animate-pulse rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isError && !isFetching && (
            <div className="px-4 py-3 text-sm text-red-600" role="alert">
              Something went wrong while searching. Please try again.
            </div>
          )}

          {!isFetching && !isError && totalResults > 0 && (
            <div className="grid gap-2 border-b px-4 py-3 text-xs text-slate-500 sm:grid-cols-2">
              {resultsSummary.map((item) => (
                <span key={item.label} className="truncate">
                  {item.label}: {item.count}
                </span>
              ))}
            </div>
          )}

          {!isFetching && !isError && !isStaleQuery && totalResults === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              <p className="font-medium text-slate-700">No results found</p>
              <p className="mt-1 text-gray-500">
                Try a broader term or search for places, trips, journal entries,
                or photos.
              </p>
            </div>
          )}

          {!isFetching &&
            !isError &&
            flatResults.map((result, index) => (
              <button
                key={result.id}
                id={`search-option-${result.id}`}
                data-index={index}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm md:py-2 ${
                  index === activeIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onMouseDown={() => goToResult(result.path)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <result.icon
                  className="h-4 w-4 shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                <span className="truncate">{result.label}</span>
              </button>
            ))}

          {!isFetching && !isError && totalResults > 0 && (
            <button
              type="button"
              className="w-full border-t px-4 py-3 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 md:py-2.5"
              onMouseDown={goToResults}
            >
              See all {totalResults} results for "{trimmedQuery}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
