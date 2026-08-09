import { EmptyState } from '@/components/ui/empty-state';
import { Compass } from 'lucide-react';
import { MemoryCard, Memory } from './memory-card';

interface MemoriesGridProps {
  memories?: Memory[];
  isLoading?: boolean;
  onCardClick?: (id: string) => void;
}

export function MemoriesGrid({
  memories = [],
  isLoading,
  onCardClick,
}: MemoriesGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <MemoryCard key={`skeleton-${i}`} isLoading />
        ))}
      </div>
    );
  }

  if (!memories || memories.length === 0) {
    return (
      <EmptyState
        icon={Compass}
        title="No memories yet"
        description="Add photos or journal entries to see your recent memories here."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {memories.map((m) => (
        <div key={m.id} onClick={() => onCardClick?.(m.id)}>
          <MemoryCard memory={m} to={`/memories/${m.id}`} />
        </div>
      ))}
    </div>
  );
}

export default MemoriesGrid;
