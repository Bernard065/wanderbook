import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import type { MapMarker } from '@/hooks/use-map-data';

interface MapLibreWorldMapProps {
  markers: MapMarker[];
  selectedMarkerId: string | null;
  onSelectMarker: (markerId: string) => void;
  className?: string;
  initialZoom?: number;
}

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 2;

const MARKER_CONFIG = {
  country: {
    size: 30,
    background:
      'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
  },
  city: {
    size: 24,
    background:
      'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
  },
  place: {
    size: 18,
    background:
      'linear-gradient(135deg, #14b8a6 0%, #22c55e 100%)',
  },
} as const;

function getMapStyle(): string | StyleSpecification {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  if (token) {
    return `https://api.mapbox.com/styles/v1/mapbox/light-v11?access_token=${token}`;
  }

  return {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: [
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
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
}

function createMarkerElement(
  marker: MapMarker,
  selected: boolean,
): HTMLButtonElement {
  const element = document.createElement('button');

  const config =
    MARKER_CONFIG[marker.type] ?? MARKER_CONFIG.place;

  element.type = 'button';
  element.className = 'custom-map-marker';
  element.title = marker.label;
  element.setAttribute(
    'aria-label',
    `Select ${marker.label}`,
  );

  Object.assign(element.style, {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${config.size}px`,
    height: `${config.size}px`,
    padding: '0',
    border: selected
      ? '2px solid #3b82f6'
      : '2px solid rgba(255, 255, 255, 0.9)',
    borderRadius: '50%',
    cursor: 'pointer',
    boxSizing: 'border-box',
    background: config.background,
    color: '#ffffff',
    boxShadow: selected
      ? '0 0 0 4px rgba(59, 130, 246, 0.35), 0 16px 40px rgba(15, 23, 42, 0.15)'
      : '0 16px 24px rgba(15, 23, 42, 0.14)',
    transition:
      'transform 150ms ease, box-shadow 150ms ease',
  });

  const inner = document.createElement('span');

  Object.assign(inner.style, {
    width: '50%',
    height: '50%',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.9)',
    boxShadow:
      'inset 0 0 0 1px rgba(15, 23, 42, 0.1)',
    pointerEvents: 'none',
  });

  element.appendChild(inner);

  return element;
}

export function MapLibreWorldMap({
  markers,
  selectedMarkerId,
  onSelectMarker,
  className,
  initialZoom = DEFAULT_ZOOM,
}: MapLibreWorldMapProps) {
  const mapContainerRef =
    useRef<HTMLDivElement | null>(null);

  const mapRef =
    useRef<maplibregl.Map | null>(null);

  const markerInstancesRef = useRef<
    maplibregl.Marker[]
  >([]);

  const onSelectMarkerRef =
    useRef(onSelectMarker);

  const initialZoomRef = useRef(initialZoom);

  useEffect(() => {
    onSelectMarkerRef.current = onSelectMarker;
  }, [onSelectMarker]);

  useEffect(() => {
    initialZoomRef.current = initialZoom;
  }, [initialZoom]);

  /*
   * Initialize MapLibre once.
   */
  useEffect(() => {
    const container = mapContainerRef.current;

    if (!container || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container,
      style: getMapStyle(),
      center: DEFAULT_CENTER,
      zoom: initialZoomRef.current,
    });

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
      }),
      'top-right',
    );

    const handleMapLoad = () => {
      map.resize();
    };

    map.once('load', handleMapLoad);

    mapRef.current = map;

    return () => {
      markerInstancesRef.current.forEach(
        (marker) => marker.remove(),
      );

      markerInstancesRef.current = [];

      map.remove();

      mapRef.current = null;
    };
  }, []);

  /*
   * Synchronize markers with React state.
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const renderMarkers = () => {
      markerInstancesRef.current.forEach(
        (marker) => marker.remove(),
      );

      markerInstancesRef.current = [];

      if (markers.length === 0) {
        return;
      }

      const bounds = new maplibregl.LngLatBounds();

      markers.forEach((marker) => {
        const isSelected =
          marker.id === selectedMarkerId;

        const element = createMarkerElement(
          marker,
          isSelected,
        );

        const popup = new maplibregl.Popup({
          offset: 18,
          closeButton: false,
          closeOnClick: false,
        }).setText(marker.label);

        const markerInstance =
          new maplibregl.Marker({
            element,
            anchor: 'center',
          })
            .setLngLat(marker.coordinates)
            .setPopup(popup)
            .addTo(map);

        const handleClick = (
          event: MouseEvent,
        ) => {
          event.stopPropagation();

          onSelectMarkerRef.current(marker.id);
        };

        const handleKeyDown = (
          event: KeyboardEvent,
        ) => {
          if (
            event.key !== 'Enter' &&
            event.key !== ' '
          ) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          onSelectMarkerRef.current(marker.id);
        };

        const handleMouseEnter = () => {
          popup.addTo(map);
        };

        const handleMouseLeave = () => {
          popup.remove();
        };

        element.addEventListener(
          'click',
          handleClick,
        );

        element.addEventListener(
          'keydown',
          handleKeyDown,
        );

        element.addEventListener(
          'mouseenter',
          handleMouseEnter,
        );

        element.addEventListener(
          'mouseleave',
          handleMouseLeave,
        );

        markerInstancesRef.current.push(
          markerInstance,
        );

        bounds.extend(marker.coordinates);
      });

      const selectedMarker = markers.find(
        (marker) =>
          marker.id === selectedMarkerId,
      );

      if (selectedMarker) {
        map.easeTo({
          center: selectedMarker.coordinates,
          zoom:
            selectedMarker.type === 'place'
              ? 6
              : 3,
          duration: 600,
        });

        return;
      }

      if (markers.length === 1) {
        map.easeTo({
          center: markers[0].coordinates,
          zoom: Math.max(
            initialZoomRef.current,
            4,
          ),
          duration: 600,
        });

        return;
      }

      map.fitBounds(bounds, {
        padding: 64,
        maxZoom: 5,
        duration: 600,
      });
    };

    if (map.isStyleLoaded()) {
      renderMarkers();

      return;
    }

    map.once('load', renderMarkers);

    return () => {
      map.off('load', renderMarkers);
    };
  }, [markers, selectedMarkerId]);

  return (
    <div
      ref={mapContainerRef}
      className={
        className ??
        'h-full w-full overflow-hidden rounded-[1.75rem] bg-muted'
      }
      role="region"
      aria-label="Interactive travel map"
    />
  );
}
