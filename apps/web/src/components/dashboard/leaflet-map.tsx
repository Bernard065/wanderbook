import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import '@/lib/leaflet-icon-fix';
import type { Place } from '@org/types';

interface LeafletMapProps {
  places: Place[];
  className?: string;
  initialZoom?: number;
}

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 2;

export default function LeafletMap({
  places,
  className,
  initialZoom,
}: LeafletMapProps) {
  const placesWithCoords = places.filter(
    (p) => p.gpsLat != null && p.gpsLng != null,
  );

  const center: [number, number] =
    placesWithCoords.length > 0
      ? [
          placesWithCoords[0].gpsLat as number,
          placesWithCoords[0].gpsLng as number,
        ]
      : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={initialZoom ?? DEFAULT_ZOOM}
      scrollWheelZoom={false}
      className={className ?? 'h-full w-full'}
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
  );
}
