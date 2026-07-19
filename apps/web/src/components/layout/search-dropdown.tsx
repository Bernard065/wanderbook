import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, MapPin, Luggage, BookOpen } from 'lucide-react';
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
  icon: typeof MapPin;
}

export function SearchDropdown({
  className,
  autoFocus,
  onNavigate,
}: SearchDropdownProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebouncedValue(query, 300);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching } = useSearch(debouncedQuery);

  const showDropdown = focused && query.trim().length > 0;
  const totalResults =
    (data?.places.length ?? 0) +
    (data?.trips.length ?? 0) +
    (data?.journalEntries.length ?? 0);

  const flatResults: FlatResult[] = [
    ...(data?.places.slice(0, 4).map((p) => ({
      path: `/places/${p.id}`,
      label: p.name,
      icon: MapPin,
    })) ?? []),
    ...(data?.trips.slice(0, 4).map((t) => ({
      path: `/trips/${t.id}`,
      label: t.name,
      icon: Luggage,
    })) ?? []),
    ...(data?.journalEntries.slice(0, 4).map((e) => ({
      path: `/places/${e.placeId}`,
      label: e.title,
      icon: BookOpen,
    })) ?? []),
  ];

  function goToResults() {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      closeDropdown();
    }
  }

  function goToResult(path: string) {
    navigate(path);
    setQuery('');
    closeDropdown();
  }

  function closeDropdown() {
    setFocused(false);
    setActiveIndex(-1);
    onNavigate?.();
  }

  function clearQuery() {
    setQuery('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && flatResults[activeIndex]) {
      goToResult(flatResults[activeIndex].path);
    } else {
      goToResults();
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      if (query) {
        clearQuery();
      } else {
        inputRef.current?.blur();
        closeDropdown();
      }
      return;
    }

    if (!showDropdown || flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? flatResults.length - 1 : i - 1));
    }
  }

  return (
    <div className={`relative w-full ${className ?? ''}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search places, countries, journal..."
          className="w-full pl-9 pr-9 py-2.5 md:py-2 text-base md:text-sm rounded-md border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearQuery}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200"
          >
            <X className="h-4 w-4 md:h-3.5 md:w-3.5 text-gray-400" />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-[60vh] sm:max-h-80 overflow-y-auto z-60">
          {isFetching && (
            <p className="px-4 py-3 text-sm text-gray-400">Searching...</p>
          )}

          {!isFetching && debouncedQuery === query && totalResults === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">
              No results found.
            </p>
          )}

          {!isFetching &&
            flatResults.map((result, index) => (
              <button
                key={result.path + result.label}
                onMouseDown={() => goToResult(result.path)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full flex items-center gap-2 px-4 py-3 md:py-2 text-sm text-left ${
                  index === activeIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <result.icon className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="truncate">{result.label}</span>
              </button>
            ))}

          {!isFetching && totalResults > 0 && (
            <button
              onMouseDown={goToResults}
              className="w-full px-4 py-3 md:py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 border-t text-left"
            >
              See all {totalResults} results for "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
