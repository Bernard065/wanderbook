import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import type { Trip } from '@org/types';

interface TripCardProps {
  trip: Trip;
}

const statusStyles: Record<Trip['status'], string> = {
  planning: 'bg-blue-50 text-blue-600',
  ongoing: 'bg-green-50 text-green-600',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-600',
};

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link to={`/trips/${trip.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <CardTitle>{trip.name}</CardTitle>
          <Badge className={statusStyles[trip.status]} variant="secondary">
            {trip.status}
          </Badge>
        </CardHeader>
        <CardContent>
          {(trip.startDate || trip.endDate) && (
            <p className="text-sm text-muted-foreground">
              {trip.startDate ?? '?'} – {trip.endDate ?? '?'}
            </p>
          )}
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {trip.places.length} {trip.places.length === 1 ? 'place' : 'places'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
