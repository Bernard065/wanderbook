import { useMemo, useState } from 'react';
import { Compass, Plus } from 'lucide-react';

import { AddBucketListItemDialog } from '@/components/add-bucket-list-item-dialog';
import BucketListControls, {
  type BucketListPriority,
  type BucketListSort,
  type BucketListStatus,
} from '@/components/bucket-list-controls';
import { BucketListItemCard } from '@/components/bucket-list-item-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  type BucketListItem,
  useBucketList,
} from '@/hooks/use-bucket-list';

const PRIORITY_WEIGHTS: Record<BucketListPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  must_have: 3,
};

function getPriorityWeight(
  priority: BucketListItem['priority'],
): number {
  return PRIORITY_WEIGHTS[priority ?? 'medium'];
}

function sortBucketListItems(
  items: BucketListItem[],
  sortBy: BucketListSort,
): BucketListItem[] {
  const sortedItems = [...items];

  sortedItems.sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return a.name.localeCompare(b.name);

      case 'name_desc':
        return b.name.localeCompare(a.name);

      case 'priority':
        return (
          getPriorityWeight(b.priority) -
          getPriorityWeight(a.priority)
        );

      case 'targetYear':
        return (
          (a.targetYear ?? Number.MAX_SAFE_INTEGER) -
          (b.targetYear ?? Number.MAX_SAFE_INTEGER)
        );

      case 'budget':
        return (
          (a.estimatedBudget ?? Number.MAX_SAFE_INTEGER) -
          (b.estimatedBudget ?? Number.MAX_SAFE_INTEGER)
        );

      default:
        return 0;
    }
  });

  return sortedItems;
}

export function BucketListPage() {
  const {
    data: items = [],
    isLoading,
    error,
  } = useBucketList();

  const [query, setQuery] = useState('');

  const [statusFilter, setStatusFilter] =
    useState<BucketListStatus | null>(null);

  const [priorityFilter, setPriorityFilter] =
    useState<BucketListPriority | null>(null);

  const [sortBy, setSortBy] =
    useState<BucketListSort>('name_asc');

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    let filtered = items;

    if (normalizedQuery) {
      filtered = filtered.filter((item) =>
        [
          item.name,
          item.notes,
          item.country,
          item.category.replace(/_/g, ' '),
        ].some((value) =>
          value?.toLowerCase().includes(normalizedQuery),
        ),
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (item) => item.status === statusFilter,
      );
    }

    if (priorityFilter) {
      filtered = filtered.filter(
        (item) =>
          (item.priority ?? 'medium') === priorityFilter,
      );
    }

    return sortBucketListItems(filtered, sortBy);
  }, [
    items,
    priorityFilter,
    query,
    sortBy,
    statusFilter,
  ]);

  const hasItems = items.length > 0;
  const hasFilteredItems = filteredItems.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bucket List
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Keep your dream destinations close at hand and track
            progress as you journey.
          </p>
        </div>

        <AddBucketListItemDialog>
          <Button className="w-full sm:w-auto">
            <Plus className="size-4" aria-hidden="true" />
            Add Item
          </Button>
        </AddBucketListItemDialog>
      </div>

      {hasItems && (
        <BucketListControls
          onSearch={setQuery}
          onStatusFilter={setStatusFilter}
          onPriorityFilter={setPriorityFilter}
          onSort={setSortBy}
          resultsCount={filteredItems.length}
        />
      )}

      {isLoading && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Loading your bucket list...
          </p>
        </div>
      )}

      {error && <ErrorMessage error={error} />}

      {!isLoading && !error && !hasItems && (
        <EmptyState
          icon={Compass}
          title="Your next adventure is waiting"
          description="Add a dream destination, a hike, or a place you want to return to."
          action={
            <AddBucketListItemDialog>
              <Button>
                <Plus className="size-4" aria-hidden="true" />
                Add your first destination
              </Button>
            </AddBucketListItemDialog>
          }
        />
      )}

      {!isLoading &&
        !error &&
        hasItems &&
        !hasFilteredItems && (
          <EmptyState
            icon={Compass}
            title="No matching destinations"
            description="Try changing your search or filters to find what you're looking for."
          />
        )}

      {!isLoading &&
        !error &&
        hasFilteredItems && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <BucketListItemCard
                key={item.id}
                item={item}
              />
            ))}
          </div>
        )}
    </div>
  );
}
