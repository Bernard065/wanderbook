import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BucketListItemCard } from '@/components/bucket-list-item-card';
import { AddBucketListItemDialog } from '@/components/add-bucket-list-item-dialog';
import { useBucketList } from '@/hooks/use-bucket-list';

export function BucketListPage() {
  const { data: items, isLoading, error } = useBucketList();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Bucket List</h1>
        <AddBucketListItemDialog>
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </AddBucketListItemDialog>
      </div>

      {isLoading && <p>Loading bucket list...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {items?.length === 0 && (
        <p className="text-gray-500">
          No dreams added yet. Click "Add Item" to start your list.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item) => (
          <BucketListItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
