import { Compass, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { BucketListItemCard } from '@/components/bucket-list-item-card';
import { AddBucketListItemDialog } from '@/components/add-bucket-list-item-dialog';
import { ErrorMessage } from '@/components/ui/error-message';
import { useBucketList } from '@/hooks/use-bucket-list';

export function BucketListPage() {
  const { data: items, isLoading, error } = useBucketList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bucket List</h1>
          <p className="text-sm text-slate-600 mt-1">
            Keep your dream destinations close at hand and track progress as you
            journey.
          </p>
        </div>
        <AddBucketListItemDialog>
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </AddBucketListItemDialog>
      </div>

      {isLoading && (
        <p className="text-sm text-slate-500">Loading bucket list...</p>
      )}
      {error && <ErrorMessage error={error} />}

      {!isLoading && !error && items?.length === 0 && (
        <EmptyState
          icon={Compass}
          title="Your next adventure is waiting"
          description="Add a dream destination, a hike, or a place you want to return to."
          action={
            <AddBucketListItemDialog>
              <Button>Add your first destination</Button>
            </AddBucketListItemDialog>
          }
        />
      )}

      {items && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <BucketListItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
