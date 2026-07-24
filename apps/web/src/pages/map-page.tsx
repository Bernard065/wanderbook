import { useNavigate } from 'react-router';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@/lib/leaflet-icon-fix';
import { usePlaces } from '@/hooks/use-places';

export function MapPage() {
  const { data: places, isLoading, error } = usePlaces();
  const navigate = useNavigate();

  const placesWithCoords = (places ?? []).filter(
    (p) => p.gpsLat != null && p.gpsLng != null,
  );

  const center: [number, number] =
    placesWithCoords.length > 0
      ? [placesWithCoords[0].gpsLat as number, placesWithCoords[0].gpsLng as number]
      : [0, 20];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Map</h1>
      <p className="text-gray-500 mb-6">
        Every place you've visited, plotted on the globe.
      </p>

      {isLoading && <p>Loading map...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {!isLoading && placesWithCoords.length === 0 && (
        <p className="text-gray-500">
          No places with GPS coordinates yet. Add latitude/longitude when
          creating a place to see it here.
        </p>
      )}

      {placesWithCoords.length > 0 && (
        <div className="h-[70vh] rounded-lg overflow-hidden border">
          <MapContainer
            center={center}
            zoom={placesWithCoords.length === 1 ? 8 : 2}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {placesWithCoords.map((place) => (
              <Marker
                key={place.id}
                position={[place.gpsLat as number, place.gpsLng as number]}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium">{place.name}</p>
                    <p className="text-gray-500">
                      {place.city ? `${place.city}, ` : ''}
                      {place.country}
                    </p>
                    <button
                      onClick={() => navigate(`/places/${place.id}`)}
                      className="text-blue-600 text-xs mt-1"
                    >
                      View place →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
