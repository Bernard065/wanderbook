import { useNavigate } from 'react-router';
import React, { Suspense } from 'react';
import { Maximize2 } from 'lucide-react';
import type { Place } from '@org/types';

const MapLibreMap = React.lazy(() => import('./maplibre-map'));

interface DashboardMapWidgetProps {
  places: Place[];
}

export function DashboardMapWidget({ places }: DashboardMapWidgetProps) {
  const navigate = useNavigate();

  return (
    <div className="relative h-96 overflow-hidden rounded-[1.75rem] bg-[#0b1325] shadow-[0_32px_85px_-32px_rgba(15,23,42,0.9)] ring-1 ring-white/10">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-[#0b1325] text-sm text-sky-100/80">
            Loading map...
          </div>
        }
      >
        <MapLibreMap places={places} className="h-full w-full" />
      </Suspense>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.28),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.12)_0%,rgba(15,23,42,0.42)_100%)]" />

      <button
        onClick={() => navigate('/map')}
        className="absolute bottom-4 left-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 py-2 text-sm font-medium text-white shadow-[0_18px_40px_-22px_rgba(15,23,42,0.9)] backdrop-blur-sm transition hover:bg-white/18"
      >
        <Maximize2 className="h-4 w-4" />
        View Full Map
      </button>
    </div>
  );
}
