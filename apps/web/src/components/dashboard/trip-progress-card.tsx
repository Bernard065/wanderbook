import { Link } from 'react-router';
import type { Trip } from '@org/types';

interface TripProgressCardProps {
  trip: Trip;
  memoriesCount: number;
}

export function TripProgressCard({
  trip,
  memoriesCount,
}: TripProgressCardProps) {
  const barWidth = Math.min(memoriesCount * 10, 100);

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="block rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
    >
      <div className="h-32 bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-sm">No cover photo</span>
      </div>
      <div className="p-3">
        <p className="font-medium truncate">{trip.name}</p>
        {(trip.startDate || trip.endDate) && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {trip.startDate ?? '?'} – {trip.endDate ?? '?'}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {memoriesCount} {memoriesCount === 1 ? 'memory' : 'memories'}
        </p>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-green-500"
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
