import { useEffect, useMemo, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreglWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { Place } from '@org/types';

interface MapLibreMapProps {
  places: Place[];
  className?: string;
  initialZoom?: number;
}

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 2;

const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
    },
  ],
};

const createMarkerElement = () => {
  const marker = document.createElement('div');
  marker.style.position = 'relative';
  marker.style.display = 'inline-flex';
  marker.style.alignItems = 'center';
  marker.style.justifyContent = 'center';
  marker.style.height = '38px';
  marker.style.width = '38px';
  marker.style.borderRadius = '9999px';
  marker.style.background =
    'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(125,211,252,0.9) 18%, rgba(59,130,246,0.98) 58%, rgba(37,99,235,1) 100%)';
  marker.style.boxShadow =
    '0 14px 28px rgba(37, 99, 235, 0.35), 0 0 0 6px rgba(191,219,254,0.35)';
  marker.style.border = '3px solid rgba(255, 255, 255, 0.95)';
  marker.style.cursor = 'pointer';

  const innerDot = document.createElement('div');
  innerDot.style.height = '12px';
  innerDot.style.width = '12px';
  innerDot.style.borderRadius = '9999px';
  innerDot.style.background = 'rgba(255, 255, 255, 0.96)';
  innerDot.style.boxShadow = '0 0 0 4px rgba(255,255,255,0.25)';
  marker.appendChild(innerDot);

  const tail = document.createElement('div');
  tail.style.position = 'absolute';
  tail.style.bottom = '-11px';
  tail.style.left = '50%';
  tail.style.transform = 'translateX(-50%)';
  tail.style.width = '0';
  tail.style.height = '0';
  tail.style.borderLeft = '7px solid transparent';
  tail.style.borderRight = '7px solid transparent';
  tail.style.borderTop = '12px solid #2563eb';
  tail.style.filter = 'drop-shadow(0 2px 4px rgba(15, 23, 42, 0.25))';
  marker.appendChild(tail);

  return marker;
};

export default function MapLibreMap({
  places,
  className,
  initialZoom,
}: MapLibreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const placesWithCoords = useMemo(
    () => places.filter((p) => p.gpsLat != null && p.gpsLng != null),
    [places],
  );

  const mapStyle = useMemo(() => {
    const token = (
      import.meta as unknown as { env: Record<string, string | undefined> }
    ).env?.VITE_MAPBOX_TOKEN;

    if (token) {
      return `https://api.mapbox.com/styles/v1/mapbox/light-v11?access_token=${token}`;
    }

    return FALLBACK_STYLE;
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    maplibregl.setWorkerUrl(maplibreglWorkerUrl);

    let fallbackApplied = false;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: DEFAULT_CENTER as [number, number],
      zoom: initialZoom ?? DEFAULT_ZOOM,
    });

    mapRef.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right',
    );

    const handleMapError = () => {
      if (fallbackApplied || !mapRef.current) {
        return;
      }

      fallbackApplied = true;
      mapRef.current.setStyle(FALLBACK_STYLE);
    };

    mapRef.current.on('error', handleMapError);
    mapRef.current.on('load', () => {
      mapRef.current?.resize();
    });

    return () => {
      mapRef.current?.off('error', handleMapError);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapStyle, initialZoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const mapContainer = mapContainerRef.current;

    const syncMap = () => {
      if (!map.isStyleLoaded()) return;

      const existingMarkers =
        mapContainer?.querySelectorAll('.maplibregl-marker');
      existingMarkers?.forEach((marker) => marker.remove());

      if (map.getLayer('route-line')) {
        map.removeLayer('route-line');
      }
      if (map.getSource('route-line')) {
        map.removeSource('route-line');
      }

      if (placesWithCoords.length === 0) return;

      const bounds = new maplibregl.LngLatBounds();
      placesWithCoords.forEach((place) => {
        const marker = new maplibregl.Marker(createMarkerElement())
          .setLngLat([place.gpsLng as number, place.gpsLat as number])
          .setPopup(
            new maplibregl.Popup({ offset: 24, closeButton: false }).setHTML(
              `<div style="font-family: Inter, ui-sans-serif, system-ui, sans-serif; font-size: 14px; line-height: 1.3; color:#0f172a;"><strong>${place.name}</strong>${
                place.city
                  ? `<div style="color:#64748b; font-size: 12px; margin-top: 2px;">${place.city}</div>`
                  : ''
              }</div>`,
            ),
          )
          .addTo(map);

        marker
          .getElement()
          .addEventListener('mouseenter', () => marker.togglePopup());
        marker
          .getElement()
          .addEventListener('mouseleave', () => marker.togglePopup());
        bounds.extend([place.gpsLng as number, place.gpsLat as number]);
      });

      if (placesWithCoords.length === 1) {
        map.easeTo({
          center: [
            placesWithCoords[0].gpsLng as number,
            placesWithCoords[0].gpsLat as number,
          ],
          zoom: initialZoom ?? 8,
        });
      } else {
        map.fitBounds(bounds, { padding: 48, maxZoom: 8 });
      }

      const routeCoordinates = placesWithCoords
        .slice(0, 12)
        .map((place) => [place.gpsLng as number, place.gpsLat as number]);

      if (routeCoordinates.length > 1) {
        map.addSource('route-line', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates,
            },
          },
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route-line',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#38bdf8',
            'line-width': 3,
            'line-opacity': 0.7,
            'line-dasharray': [2, 2],
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      syncMap();
    } else {
      map.once('load', syncMap);
    }

    return () => {
      map.off('load', syncMap);
      mapContainer
        ?.querySelectorAll('.maplibregl-marker')
        .forEach((marker) => marker.remove());
      if (map.isStyleLoaded() && map.getLayer('route-line')) {
        map.removeLayer('route-line');
      }
      if (map.isStyleLoaded() && map.getSource('route-line')) {
        map.removeSource('route-line');
      }
    };
  }, [placesWithCoords, initialZoom]);

  return (
    <div
      ref={mapContainerRef}
      className={className ?? 'h-full w-full rounded-lg bg-muted'}
      style={{ minHeight: '100%', overflow: 'hidden' }}
    />
  );
}
