import { useState } from 'react';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type BucketListPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'must_have';

export type BucketListStatus =
  | 'dreaming'
  | 'planning'
  | 'booked'
  | 'visited';

export type BucketListSort =
  | 'name_asc'
  | 'name_desc'
  | 'priority'
  | 'targetYear'
  | 'budget';

type StatusFilter = BucketListStatus | 'all';
type PriorityFilter = BucketListPriority | 'all';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'dreaming', label: 'Dreaming' },
  { value: 'planning', label: 'Planning' },
  { value: 'booked', label: 'Booked' },
  { value: 'visited', label: 'Completed' },
] as const satisfies ReadonlyArray<{
  value: StatusFilter;
  label: string;
}>;

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'Any priority' },
  { value: 'must_have', label: 'Must Have' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const satisfies ReadonlyArray<{
  value: PriorityFilter;
  label: string;
}>;

const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A → Z)' },
  { value: 'name_desc', label: 'Name (Z → A)' },
  { value: 'priority', label: 'Priority' },
  { value: 'targetYear', label: 'Target Year' },
  { value: 'budget', label: 'Estimated Budget' },
] as const satisfies ReadonlyArray<{
  value: BucketListSort;
  label: string;
}>;

interface BucketListControlsProps {
  onSearch: (query: string) => void;
  onStatusFilter: (status: BucketListStatus | null) => void;
  onPriorityFilter: (priority: BucketListPriority | null) => void;
  onSort: (sort: BucketListSort) => void;
  resultsCount?: number;
}

export function BucketListControls({
  onSearch,
  onStatusFilter,
  onPriorityFilter,
  onSort,
  resultsCount,
}: BucketListControlsProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [priority, setPriority] = useState<PriorityFilter>('all');
  const [sort, setSort] = useState<BucketListSort>('name_asc');

  const handleSearch = () => {
    onSearch(query.trim());
  };

  const handleStatusChange = (value: StatusFilter) => {
    setStatus(value);
    onStatusFilter(value === 'all' ? null : value);
  };

  const handlePriorityChange = (value: PriorityFilter) => {
    setPriority(value);
    onPriorityFilter(value === 'all' ? null : value);
  };

  const handleSortChange = (value: BucketListSort) => {
    setSort(value);
    onSort(value);
  };

  const formattedResultsCount =
    typeof resultsCount === 'number'
      ? resultsCount.toLocaleString()
      : '-';

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
          className="relative w-full sm:w-72"
          role="search"
        >
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your bucket list..."
            aria-label="Search bucket list"
            className="pr-11"
          />

          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
            aria-label="Search"
          >
            <Search className="size-4" />
          </Button>
        </form>

        <div className="hidden sm:block">
          <Select
            value={status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden sm:block">
          <Select
            value={priority}
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>

            <SelectContent>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="text-sm text-muted-foreground">
          {formattedResultsCount} result
          {resultsCount === 1 ? '' : 's'}
        </div>

        <Select
          value={sort}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="h-9 w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>

          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default BucketListControls;
