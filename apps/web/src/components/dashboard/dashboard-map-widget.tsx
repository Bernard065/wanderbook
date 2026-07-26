import { useNavigate } from 'react-router';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Maximize2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import '@/lib/leaflet-icon-fix';
import type { Place } from '@org/types';

interface DashboardMapWidgetProps {
  places: Place[];
}

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 2;

export function DashboardMapWidget({ places }: DashboardMapWidgetProps) {
  const navigate = useNavigate();

  const placesWithCoords = places.filter(
    (p) => p.gpsLat != null && p.gpsLng != null,
  );

  const center: [number, number] =
    placesWithCoords.length > 0
      ? [placesWithCoords[0].gpsLat as number, placesWithCoords[0].gpsLng as number]
      : DEFAULT_CENTER;

  return (
    <div className="relative h-80 rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {placesWithCoords.length > 0 && (
          <MarkerClusterGroup>
            {placesWithCoords.map((place) => (
              <Marker
                key={place.id}
                position={[place.gpsLat as number, place.gpsLng as number]}
              >
                <Popup>{place.name}</Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>
      <button
        onClick={() => navigate('/map')}
        className="absolute bottom-3 left-3 z-[400] flex items-center gap-1.5 bg-white border rounded-md px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-gray-50"
      >
        <Maximize2 className="h-3.5 w-3.5" />
        View Full Map
      </button>
    </div>
  );
}
