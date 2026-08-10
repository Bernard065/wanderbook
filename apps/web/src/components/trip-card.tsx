import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Layers, MapPin, Sparkles, DollarSign } from 'lucide-react';
import type { Trip } from '@org/types';

interface TripCardProps {
  trip: Trip;
  coverUrl?: string | null;
  destination?: string;
  memoriesCount?: number;
}

const statusStyles: Record<Trip['status'], string> = {
  planning: 'bg-blue-50 text-blue-600',
  ongoing: 'bg-green-50 text-green-600',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-600',
};

const formatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatDate(dateString?: string | null): string | null {
  if (!dateString) return null;

  const date = new Date(dateString);

  return Number.isNaN(date.getTime()) ? null : formatter.format(date);
}

function getDuration(start?: string | null, end?: string | null): string {
  if (!start || !end) return 'TBD';

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'TBD';
  }

  const difference = endDate.getTime() - startDate.getTime();
  const days = Math.max(1, Math.round(difference / 86_400_000) + 1);

  return `${days} day${days === 1 ? '' : 's'}`;
}

export function TripCard({
  trip,
  coverUrl,
  destination,
  memoriesCount = 0,
}: TripCardProps) {
  const place = trip.places[0];

  const locationLabel =
    destination ??
    (place
      ? [place.city, place.country].filter(Boolean).join(', ')
      : 'Unknown destination');

  const startLabel = formatDate(trip.startDate);
  const endLabel = formatDate(trip.endDate);

  const dateLabel =
    startLabel || endLabel
      ? `${startLabel ?? '?'} – ${endLabel ?? '?'}`
      : 'Dates TBD';

  const durationLabel = getDuration(trip.startDate, trip.endDate);

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group block h-full"
      aria-label={`View trip ${trip.name}`}
    >
      <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-video overflow-hidden bg-slate-100">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`${trip.name} cover`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200"
              aria-hidden="true"
            >
              <MapPin className="h-10 w-10 text-slate-400" />
            </div>
          )}

          <div className="absolute right-3 top-3">
            <Badge className={statusStyles[trip.status]} variant="secondary">
              {trip.status}
            </Badge>
          </div>
        </div>

        <CardHeader className="px-4 pb-2 pt-4">
          <CardTitle className="line-clamp-1 text-lg">{trip.name}</CardTitle>
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-0">
          <div className="space-y-2 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{locationLabel}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{dateLabel}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-500 sm:grid-cols-4">
            <div className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{durationLabel}</span>
            </div>

            <div className="inline-flex items-center gap-2">
              <Layers className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {trip.places.length}{' '}
                {trip.places.length === 1 ? 'place' : 'places'}
              </span>
            </div>

            <div className="inline-flex items-center gap-2">
              <DollarSign className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {trip.budget != null
                  ? new Intl.NumberFormat(undefined, {
                      style: 'currency',
                      currency: 'USD',
                    }).format(trip.budget)
                  : 'No budget'}
              </span>
            </div>

            <div className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {memoriesCount} {memoriesCount === 1 ? 'memory' : 'memories'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
