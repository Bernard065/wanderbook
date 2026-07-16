import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Place } from '@org/types';

interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{place.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {place.city ? `${place.city}, ` : ''}
          {place.country}
        </p>
        <p className="text-sm capitalize mt-1">{place.category}</p>
      </CardContent>
    </Card>
  );
}
