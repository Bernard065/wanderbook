import { useNavigate } from 'react-router';
import React, { Suspense } from 'react';
import { Maximize2 } from 'lucide-react';
import type { Place } from '@org/types';

const LeafletMap = React.lazy(() => import('./leaflet-map'));

interface DashboardMapWidgetProps {
  places: Place[];
}

export function DashboardMapWidget({ places }: DashboardMapWidgetProps) {
  const navigate = useNavigate();

  return (
    <div className="relative h-80 rounded-lg overflow-hidden border">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Loading map...
          </div>
        }
      >
        <LeafletMap places={places} />
      </Suspense>
      <button
        onClick={() => navigate('/map')}
        className="absolute bottom-3 left-3 z-400 flex items-center gap-1.5 bg-white border rounded-md px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-gray-50"
      >
        <Maximize2 className="h-3.5 w-3.5" />
        View Full Map
      </button>
    </div>
  );
}
