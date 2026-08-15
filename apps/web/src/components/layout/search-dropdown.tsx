import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  BookOpen,
  Bookmark,
  Camera,
  Luggage,
  MapPin,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react';

import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useSearch, type SearchResults } from '@/hooks/use-search';
import { SearchResultRow } from '@/components/search/search-result-row';

interface SearchDropdownProps {
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}

interface FlatResult {
  id: string;
  path: string;
  label: string;
  subtitle?: string;
  icon: LucideIcon;
}

const EMPTY_SEARCH_RESULTS: SearchResults = {
  places: [],
  trips: [],
  journalEntries: [],
  memories: [],
  bucketListItems: [],
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
});

export function SearchDropdown({
  className,
  autoFocus = false,
  onNavigate,
  onClose,
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
    memories = [],
    bucketListItems = [],
  } = data ?? EMPTY_SEARCH_RESULTS;

  const totalResults =
    places.length +
    trips.length +
    journalEntries.length +
    memories.length +
    bucketListItems.length;

  const resultsSummary = [
    {
      label: 'Places',
      count: places.length,
    },
    {
      label: 'Trips',
      count: trips.length,
    },
    {
      label: 'Journal entries',
      count: journalEntries.length,
    },
    {
      label: 'Memories',
      count: memories.length,
    },
    {
      label: 'Bucket list',
      count: bucketListItems.length,
    },
  ].filter((item) => item.count > 0);

  const flatResults: FlatResult[] = [
    ...places.slice(0, 4).map((place) => ({
      id: `place-${place.id}`,
      path: `/places/${place.id}`,
      label: place.name,
      subtitle: [place.city, place.country].filter(Boolean).join(', '),
      icon: MapPin,
    })),

    ...trips.slice(0, 4).map((trip) => ({
      id: `trip-${trip.id}`,
      path: `/trips/${trip.id}`,
      label: trip.name,
      subtitle: trip.status ? `Status: ${trip.status}` : undefined,
      icon: Luggage,
    })),

    ...journalEntries.slice(0, 4).map((entry) => ({
      id: `entry-${entry.id}`,
      path: `/places/${entry.placeId}`,
      label: entry.title,
      subtitle: entry.content,
      icon: BookOpen,
    })),

    ...memories.slice(0, 4).map((photo) => ({
      id: `memory-${photo.id}`,
      path: photo.placeId ? `/places/${photo.placeId}` : '/gallery',
      label: photo.caption ?? 'Memory',
      subtitle: photo.createdAt
        ? dateFormatter.format(new Date(photo.createdAt))
        : 'Memory',
      icon: Camera,
    })),

    ...bucketListItems.slice(0, 4).map((item) => ({
      id: `bucket-list-${item.id}`,
      path: '/bucket-list',
      label: item.name,
      subtitle: item.category.replace(/_/g, ' '),
      icon: Bookmark,
    })),
  ];

  const showDropdown = focused && trimmedQuery.length > 0;
  const isStaleQuery = debouncedQuery !== query;
  const showLoadingSkeletons = isFetching && trimmedQuery.length > 0;

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    setActiveIndex((current) => {
      if (current < 0) {
        return current;
      }

      return current >= flatResults.length ? -1 : current;
    });
  }, [flatResults.length]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) {
      return;
    }

    const activeElement = listRef.current.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );

    if (typeof activeElement?.scrollIntoView === 'function') {
      activeElement.scrollIntoView({
        block: 'nearest',
      });
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
    if (!trimmedQuery) {
      return;
    }

    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    closeDropdown();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Escape': {
        if (query) {
          clearQuery();
        } else {
          inputRef.current?.blur();
          setFocused(false);
          setActiveIndex(-1);
          onClose?.();
        }

        return;
      }

      case 'ArrowDown': {
        if (!showDropdown || flatResults.length === 0) {
          return;
        }

        event.preventDefault();

        setActiveIndex(
          (current) => (current + 1) % flatResults.length,
        );

        return;
      }

      case 'ArrowUp': {
        if (!showDropdown || flatResults.length === 0) {
          return;
        }

        event.preventDefault();

        setActiveIndex((current) =>
          current <= 0 ? flatResults.length - 1 : current - 1,
        );

        return;
      }

      case 'Home': {
        if (!showDropdown || flatResults.length === 0) {
          return;
        }

        event.preventDefault();
        setActiveIndex(0);

        return;
      }

      case 'End': {
        if (!showDropdown || flatResults.length === 0) {
          return;
        }

        event.preventDefault();
        setActiveIndex(flatResults.length - 1);

        return;
      }

      case 'Enter': {
        if (activeIndex >= 0 && flatResults[activeIndex]) {
          event.preventDefault();
          goToResult(flatResults[activeIndex].path);
        }

        return;
      }

      default:
        return;
    }
  };

  const activeDescendantId =
    activeIndex >= 0 && flatResults[activeIndex]
      ? `search-option-${flatResults[activeIndex].id}`
      : undefined;

  const handleInputBlur = (
    event: React.FocusEvent<HTMLInputElement>,
  ) => {
    const nextFocusTarget =
      event.relatedTarget instanceof HTMLElement
        ? event.relatedTarget
        : null;

    const isMovingWithinDropdown = nextFocusTarget?.closest(
      '[data-search-dropdown-root]',
    );

    if (isMovingWithinDropdown) {
      return;
    }

    window.setTimeout(() => {
      setFocused(false);
    }, 150);
  };

  return (
    <div
      className={`relative w-full ${className ?? ''}`}
      data-search-dropdown-root
    >
      <form
        className="relative"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();

          if (activeIndex >= 0 && flatResults[activeIndex]) {
            goToResult(flatResults[activeIndex].path);
            return;
          }

          goToResults();
        }}
      >
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 text-muted-foreground"
        />

        <input
          ref={inputRef}
          autoFocus={autoFocus}
          data-global-search-input
          type="search"
          role="combobox"
          aria-label="Search places, trips, journal entries, memories, and bucket list items"
          aria-expanded={showDropdown}
          aria-controls="search-dropdown-listbox"
          aria-activedescendant={activeDescendantId}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          placeholder="Search places, trips, memories, journal..."
          className="w-full rounded-md border bg-muted py-2.5 pl-9 pr-9 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 md:py-2 md:text-sm"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
        />

        {query && (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-muted"
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={clearQuery}
          >
            <X
              aria-hidden="true"
              className="h-4 w-4 text-muted-foreground md:h-3.5 md:w-3.5"
            />
          </button>
        )}
      </form>

      {showDropdown && (
        <div
          id="search-dropdown-listbox"
          ref={listRef}
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[60vh] overflow-y-auto rounded-md border bg-card shadow-lg sm:max-h-80"
        >
          {showLoadingSkeletons && (
            <div
              className="px-4 py-3"
              role="status"
              aria-live="polite"
            >
              <div className="mb-3 text-sm text-muted-foreground">
                Searching for "{trimmedQuery}"...
              </div>

              <div className="mb-3 h-2.5 w-32 animate-pulse rounded bg-muted" />

              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    data-testid="search-skeleton"
                    className="flex items-center gap-2 rounded-md bg-muted px-3 py-2"
                  >
                    <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />

                    <div className="h-3 flex-1 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isError && !isFetching && (
            <div
              className="px-4 py-3 text-sm text-red-600"
              role="alert"
            >
              Something went wrong while searching. Please try again.
            </div>
          )}

          {!isFetching && !isError && totalResults > 0 && (
            <div className="grid gap-2 border-b px-4 py-3 text-xs text-muted-foreground sm:grid-cols-2">
              {resultsSummary.map((item) => (
                <span key={item.label} className="truncate">
                  {item.label}: {item.count}
                </span>
              ))}
            </div>
          )}

          {!isFetching &&
            !isError &&
            !isStaleQuery &&
            totalResults === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                <p className="font-medium text-slate-700">
                  No results found
                </p>

                <p className="mt-1 text-muted-foreground">
                  Try a broader term or search for places, trips,
                  journal entries, or photos.
                </p>
              </div>
            )}

          {!isFetching &&
            !isError &&
            flatResults.map((result, index) => (
              <SearchResultRow
                key={result.id}
                id={`search-option-${result.id}`}
                role="option"
                ariaSelected={index === activeIndex}
                dataIndex={index}
                icon={result.icon}
                label={result.label}
                subtitle={result.subtitle}
                active={index === activeIndex}
                onMouseDown={() => {
                  goToResult(result.path);
                }}
                onMouseEnter={() => {
                  setActiveIndex(index);
                }}
              />
            ))}

          {!isFetching && !isError && totalResults > 0 && (
            <button
              type="button"
              className="w-full border-t px-4 py-3 text-left text-sm font-medium text-primary hover:bg-blue-50 md:py-2.5"
              onMouseDown={(event) => {
                event.preventDefault();
                goToResults();
              }}
            >
              See all {totalResults} results for "{trimmedQuery}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchDropdown;
