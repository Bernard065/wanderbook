import { Link } from 'react-router';
import { Star, Heart } from 'lucide-react';

export interface Memory {
  id: string;
  title: string;
  location?: string;
  date?: string;
  coverUrl?: string;
  favorite?: boolean;
}

interface MemoryCardProps {
  memory?: Memory;
  isLoading?: boolean;
  to?: string;
}

export function MemoryCard({ memory, isLoading, to }: MemoryCardProps) {
  if (isLoading) {
    return (
      <div className="group block overflow-hidden rounded-lg border border bg-card p-0 shadow-sm">
        <div className="h-40 bg-muted animate-pulse" />
        <div className="p-3">
          <div className="h-4 w-3/4 rounded bg-muted animate-pulse mb-2" />
          <div className="h-3 w-1/2 rounded bg-muted animate-pulse mb-2" />
          <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (!memory) return null;

  const content = (
    <article
      className="group block overflow-hidden rounded-lg border border bg-card hover:shadow-md transition-shadow"
      aria-labelledby={`memory-${memory.id}-title`}
    >
      <div className="relative h-40 bg-muted">
        {memory.coverUrl ? (
          <img
            src={memory.coverUrl}
            alt={memory.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            No cover
          </div>
        )}
        <div className="absolute top-2 right-2 rounded-full bg-card/80 p-1">
          {memory.favorite ? (
            <Heart className="h-4 w-4 text-rose-500" />
          ) : (
            <Star className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="p-3">
        <h3 id={`memory-${memory.id}-title`} className="font-medium truncate">
          {memory.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {memory.location ?? 'Unknown location'}
        </p>
        {memory.date && (
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(memory.date).toLocaleDateString()}
          </p>
        )}
      </div>
    </article>
  );

  if (to) {
    return (
      <Link to={to} aria-label={memory.title} className="no-underline">
        {content}
      </Link>
    );
  }

  return content;
}

export default MemoryCard;
