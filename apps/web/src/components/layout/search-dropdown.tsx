import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
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
import { useSearch } from '@/hooks/use-search';

interface SearchDropdownProps {
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
}

interface FlatResult {
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
  const navigate = useNavigate();

  const debouncedQuery = useDebouncedValue(query, 300);
  const trimmedQuery = query.trim();

  const { data, isFetching } = useSearch(debouncedQuery);

  const places = data?.places ?? [];
  const trips = data?.trips ?? [];
  const journalEntries = data?.journalEntries ?? [];
  const photos = data?.photos ?? [];

  const totalResults =
    places.length +
    trips.length +
    journalEntries.length +
    photos.length;

  const flatResults: FlatResult[] = [
    ...places.slice(0, 4).map((place) => ({
      path: `/places/${place.id}`,
      label: place.name,
      icon: MapPin,
    })),
    ...trips.slice(0, 4).map((trip) => ({
      path: `/trips/${trip.id}`,
      label: trip.name,
      icon: Luggage,
    })),
    ...journalEntries.slice(0, 4).map((entry) => ({
      path: `/places/${entry.placeId}`,
      label: entry.title,
      icon: BookOpen,
    })),
    ...photos.slice(0, 4).map((photo) => ({
      path: photo.placeId ? `/places/${photo.placeId}` : '/gallery',
      label: photo.caption ?? 'Photo',
      icon: Camera,
    })),
  ];

  const showDropdown = focused && trimmedQuery.length > 0;

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
        if (!showDropdown || flatResults.length === 0) {
          return;
        }

        event.preventDefault();
        setActiveIndex((index) => (index + 1) % flatResults.length);
        return;

      case 'ArrowUp':
        if (!showDropdown || flatResults.length === 0) {
          return;
        }

        event.preventDefault();
        setActiveIndex((index) =>
          index <= 0 ? flatResults.length - 1 : index - 1
        );
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

  return (
    <div className={`relative w-full ${className ?? ''}`}>
      <form className="relative" onSubmit={handleSubmit}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 text-gray-400" />

        <input
          ref={inputRef}
          autoFocus={autoFocus}
          type="text"
          value={query}
          placeholder="Search places, countries, journal..."
          className="w-full rounded-md border bg-gray-50 py-2.5 pl-9 pr-9 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 md:py-2 md:text-sm"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setFocused(false), 150);
          }}
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
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[60vh] overflow-y-auto rounded-md border bg-white shadow-lg sm:max-h-80">
          {isFetching && (
            <p className="px-4 py-3 text-sm text-gray-400">Searching...</p>
          )}

          {!isFetching &&
            debouncedQuery === query &&
            totalResults === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">
                No results found.
              </p>
            )}

          {!isFetching &&
            flatResults.map((result, index) => (
              <button
                key={`${result.path}-${result.label}`}
                type="button"
                className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm md:py-2 ${
                  index === activeIndex
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onMouseDown={() => goToResult(result.path)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <result.icon className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">{result.label}</span>
              </button>
            ))}

          {!isFetching && totalResults > 0 && (
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
