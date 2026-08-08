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
    <div className="relative h-96 rounded-[1.75rem] overflow-hidden bg-slate-950 shadow-2xl shadow-slate-900/40 ring-1 ring-white/10">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-slate-950 text-sm text-slate-300">
            Loading map...
          </div>
        }
      >
        <MapLibreMap places={places} className="h-full w-full" />
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/70 pointer-events-none" />

      <button
        onClick={() => navigate('/map')}
        className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-slate-900 shadow-lg shadow-slate-900/20 transition hover:bg-white"
      >
        <Maximize2 className="h-4 w-4" />
        View Full Map
      </button>
    </div>
  );
}
