import { useNavigate } from 'react-router';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Maximize2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import '@/lib/leaflet-icon-fix';
import type { Place } from '@org/types';

interface DashboardMapWidgetProps {
  places: Place[];
}

export function DashboardMapWidget({ places }: DashboardMapWidgetProps) {
  const navigate = useNavigate();

  const placesWithCoords = places.filter(
    (p) => p.gpsLat != null && p.gpsLng != null,
  );

  if (placesWithCoords.length === 0) {
    return (
      <div className="h-80 rounded-lg border bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">
          Add GPS coordinates to your places to see them here.
        </p>
      </div>
    );
  }

  const center: [number, number] = [
    placesWithCoords[0].gpsLat as number,
    placesWithCoords[0].gpsLng as number,
  ];

  return (
    <div className="relative h-80 rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={2}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {placesWithCoords.map((place) => (
          <Marker
            key={place.id}
            position={[place.gpsLat as number, place.gpsLng as number]}
          >
            <Popup>{place.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
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
