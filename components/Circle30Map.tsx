'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapVisualization, MapFeature } from '../types/responses';
import type { Geometry, Point, Polygon, GeometryCollection } from 'geojson';

function isPoint(geometry: Geometry): geometry is Point {
  return geometry.type === 'Point';
}

function isPolygon(geometry: Geometry): geometry is Polygon {
  return geometry.type === 'Polygon';
}

function isGeometryCollection(geometry: Geometry): geometry is GeometryCollection {
  return geometry.type === 'GeometryCollection';
}

function hasCoordinates(geometry: Geometry): geometry is Point | Polygon {
  return 'coordinates' in geometry;
}

export default function Circle30Map({ visualization }: { visualization?: MapVisualization }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      console.log('Initializing map...');
      const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
      
      // Correct TomTom Orbis style URL format
      const styleUrl = `https://api.tomtom.com/maps/orbis/assets/styles/0.0.0-0?key=${apiKey}&apiVersion=1&assetCategories[]=basic`;
      
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: [-99.3832, 31.2504], // Texas
        zoom: 6,
        maxZoom: 17
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.on('style.load', () => {
        console.log('Map style loaded successfully');
        mapRef.current = map;
        setMapLoaded(true);
      });

      map.on('error', (e) => {
        console.error('Map error:', e);
        setError(e.error?.message || 'Map error occurred');
      });

      return () => {
        map.remove();
        mapRef.current = null;
        setMapLoaded(false);
      };
    } catch (err) {
      console.error('Map initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
    }
  }, []);

  // Handle visualization updates
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !visualization) return;
    
    const map = mapRef.current;
    console.log('Updating visualization...', visualization);

    try {
      // Remove existing layers and sources
      const style = map.getStyle();
      if (style && style.layers) {
        [...style.layers].reverse().forEach(layer => {
          if (layer.id.startsWith('custom-')) {
            map.removeLayer(layer.id);
          }
        });
      }

      if (style && style.sources) {
        Object.keys(style.sources).forEach(sourceId => {
          if (sourceId.startsWith('custom-')) {
            map.removeSource(sourceId);
          }
        });
      }

      // Add new features
      visualization.features.forEach((feature: MapFeature, index) => {
        const sourceId = `custom-source-${index}`;
        const layerId = `custom-layer-${index}`;

        // Check if geometry exists and has valid coordinates
        if (!feature.geometry || !hasCoordinates(feature.geometry)) {
          console.warn('Invalid feature geometry:', feature);
          return;
        }

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [feature]
          }
        });

        if (isPoint(feature.geometry)) {
          map.addLayer({
            id: layerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': 8,
              'circle-color': feature.properties?.style?.color || '#4F46E5',
              'circle-opacity': 0.8
            }
          });
        } else if (isPolygon(feature.geometry)) {
          map.addLayer({
            id: `${layerId}-fill`,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': feature.properties?.style?.fillColor || '#4F46E5',
              'fill-opacity': 0.3
            }
          });

          map.addLayer({
            id: `${layerId}-outline`,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': feature.properties?.style?.color || '#4F46E5',
              'line-width': 2
            }
          });
        }

        // Add popups
        if (feature.properties?.data || feature.properties?.title) {
          const popupLayerId = isPolygon(feature.geometry) ? `${layerId}-fill` : layerId;
          
          map.on('click', popupLayerId, (e) => {
            if (!e.features?.[0]) return;
            
            const coordinates = isPoint(feature.geometry)
              ? feature.geometry.coordinates
              : [e.lngLat.lng, e.lngLat.lat];

            const content = `
              <div style="color: black; padding: 8px;">
                ${feature.properties.title ? `<h3 style="font-weight: bold; margin-bottom: 8px;">${feature.properties.title}</h3>` : ''}
                ${Object.entries(feature.properties.data || {})
                  .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                  .join('<br/>')}
              </div>
            `;

            new maplibregl.Popup()
              .setLngLat(coordinates as [number, number])
              .setHTML(content)
              .addTo(map);
          });

          map.on('mouseenter', popupLayerId, () => {
            map.getCanvas().style.cursor = 'pointer';
          });

          map.on('mouseleave', popupLayerId, () => {
            map.getCanvas().style.cursor = '';
          });
        }
      });

      // Fit bounds if needed
      if (visualization.config?.fitBounds !== false && visualization.features.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        visualization.features.forEach(feature => {
          if (!feature.geometry || !hasCoordinates(feature.geometry)) return;
          
          if (isPoint(feature.geometry)) {
            bounds.extend(feature.geometry.coordinates as [number, number]);
          } else if (isPolygon(feature.geometry)) {
            feature.geometry.coordinates[0].forEach(coord => bounds.extend(coord as [number, number]));
          }
        });

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, {
            padding: 50,
            duration: 1000
          });
        }
      }

    } catch (err) {
      console.error('Error updating visualization:', err);
      setError(err instanceof Error ? err.message : 'Failed to update visualization');
    }
  }, [visualization, mapLoaded]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {error && (
        <div className="text-red-400 bg-gray-900/80 p-4 absolute top-4 left-4 right-4 z-50 rounded-lg text-center">
          {error}
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
