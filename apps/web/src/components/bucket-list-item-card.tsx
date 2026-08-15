import {
  Calendar,
  DollarSign,
  ImageOff,
  MapPin,
  Trash2,
} from 'lucide-react';

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

const STATUS_STYLES: Record<BucketListItem['status'], string> = {
  dreaming:
    'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300',
  planning:
    'border-blue-200 bg-blue-50 text-primary dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300',
  booked:
    'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  visited:
    'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300',
  cancelled:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
};

const STATUS_LABELS: Record<BucketListItem['status'], string> = {
  dreaming: 'Dreaming',
  planning: 'Planning',
  booked: 'Booked',
  visited: 'Completed',
  cancelled: 'Cancelled',
};

function formatCategory(category: string) {
  return category.replace(/_/g, ' ');
}

function formatBudget(budget: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(budget);
}

export function BucketListItemCard({
  item,
}: BucketListItemCardProps) {
  const { mutate: deleteItem, isPending: isDeleting } =
    useDeleteBucketListItem();

  const { mutate: updateItem, isPending: isUpdating } =
    useUpdateBucketListItem();

  const handleStatusChange = (status: BucketListItem['status']) => {
    if (status === item.status) {
      return;
    }

    updateItem({
      id: item.id,
      status,
    });
  };

  return (
    <article className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {item.coverImageUrl ? (
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={item.coverImageUrl}
            alt={item.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
          <ImageOff className="size-8" aria-hidden="true" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{item.name}</h3>

            <p className="mt-1 truncate text-sm text-muted-foreground capitalize">
              {item.country || formatCategory(item.category)}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
            disabled={isDeleting}
            onClick={() => deleteItem(item.id)}
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {item.notes && (
          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
            {item.notes}
          </p>
        )}

        {(item.targetYear ||
          typeof item.estimatedBudget === 'number' ||
          item.placeId) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
            {item.targetYear && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" aria-hidden="true" />
                <span>{item.targetYear}</span>
              </div>
            )}

            {typeof item.estimatedBudget === 'number' && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="size-3.5" aria-hidden="true" />
                <span>{formatBudget(item.estimatedBudget)}</span>
              </div>
            )}

            {item.placeId && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden="true" />
                <span>Linked place</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <Select
            value={item.status}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger
              className="h-9 w-full"
              aria-label={`Status for ${item.name}`}
            >
              <SelectValue>
                <Badge
                  variant="outline"
                  className={STATUS_STYLES[item.status]}
                >
                  {STATUS_LABELS[item.status]}
                </Badge>
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              {BUCKET_LIST_STATUSES.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="capitalize"
                >
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </article>
  );
}
