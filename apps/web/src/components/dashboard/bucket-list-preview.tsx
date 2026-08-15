import { Link } from 'react-router';
import type { Place } from '@org/types';

interface BucketListPreviewProps {
  places: Place[];
}

export function BucketListPreview({ places }: BucketListPreviewProps) {
  const items = places?.slice(0, 4) ?? [];

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Bucket List Preview</h3>
        <Link to="/bucket-list" className="text-xs text-primary font-medium">
          View All
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items in bucket list yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="h-12 w-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                Img
              </div>
              <div className="min-w-0">
                <p className="text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.country}</p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">0/1</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BucketListPreview;
