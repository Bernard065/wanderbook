import { Trash2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BUCKET_LIST_STATUSES } from '@/constants/bucket-list-statuses';
import {
  useDeleteBucketListItem,
  useUpdateBucketListItem,
  type BucketListItem,
} from '@/hooks/use-bucket-list';

interface BucketListItemCardProps {
  item: BucketListItem;
}

const statusStyles: Record<BucketListItem['status'], string> = {
  dreaming: 'bg-purple-50 text-purple-600',
  planning: 'bg-blue-50 text-blue-600',
  booked: 'bg-yellow-50 text-yellow-700',
  visited: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
};

export function BucketListItemCard({ item }: BucketListItemCardProps) {
  const { mutate: deleteItem, isPending: isDeleting } =
    useDeleteBucketListItem();
  const { mutate: updateItem } = useUpdateBucketListItem();

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium truncate">{item.name}</p>
          <p className="text-xs text-gray-400 capitalize mt-0.5">
            {item.category.replace(/_/g, ' ')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={isDeleting}
          onClick={() => deleteItem(item.id)}
        >
          <Trash2 className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {item.notes && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
          {item.notes}
        </p>
      )}

      {item.placeId && (
        <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
          <MapPin className="h-3 w-3 shrink-0" />
          Linked to a place
        </p>
      )}

      <div className="mt-3">
        <Select
          value={item.status}
          onValueChange={(value) =>
            updateItem({
              id: item.id,
              status: value as BucketListItem['status'],
            })
          }
        >
          <SelectTrigger className="w-full h-9">
            <SelectValue>
              <Badge
                className={statusStyles[item.status]}
                variant="secondary"
              >
                {item.status}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {BUCKET_LIST_STATUSES.map((status) => (
              <SelectItem
                key={status}
                value={status}
                className="capitalize py-2.5 md:py-1.5"
              >
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
