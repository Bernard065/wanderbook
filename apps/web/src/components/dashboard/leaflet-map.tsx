import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  Polyline,
  ZoomControl,
} from 'react-leaflet';
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
      zoomControl={false}
      attributionControl={false}
      className={className ?? 'h-full w-full filter grayscale contrast-90'}
    >
      {/* Use Mapbox Dark when VITE_MAPBOX_TOKEN is provided, otherwise fallback to Carto dark tiles */}
      {(() => {
        const token = (import.meta as any).env?.VITE_MAPBOX_TOKEN as
          string | undefined;
        if (token) {
          return (
            <TileLayer
              attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
              url={`https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`}
              tileSize={512}
              zoomOffset={-1}
            />
          );
        }

        return (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          />
        );
      })()}

      <ZoomControl position="topright" />

      {placesWithCoords.length > 0 && (
        <MarkerClusterGroup>
          {/* Decorative dashed routes between consecutive places to mimic screenshot */}
          {placesWithCoords.slice(0, 12).map((place, idx, arr) => {
            if (idx === 0 || idx >= arr.length) return null;
            const prev = arr[idx - 1];
            return (
              <Polyline
                key={`route-${prev.id}-${place.id}`}
                positions={[
                  [prev.gpsLat as number, prev.gpsLng as number],
                  [place.gpsLat as number, place.gpsLng as number],
                ]}
                pathOptions={{
                  color: 'rgba(255,255,255,0.85)',
                  dashArray: '6,8',
                  weight: 1.2,
                  opacity: 0.9,
                }}
              />
            );
          })}

          {placesWithCoords.map((place) => (
            <CircleMarker
              key={place.id}
              center={[place.gpsLat as number, place.gpsLng as number]}
              radius={6}
              pathOptions={{
                color: '#ffffff',
                weight: 1.5,
                fillColor: '#3b82f6',
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                {place.name}
              </Tooltip>
            </CircleMarker>
          ))}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  );
}
