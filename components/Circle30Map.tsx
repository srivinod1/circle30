'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapVisualization } from '../types/responses';

// Helper function to validate coordinates
function validateCoordinates(coords: any, type: string): any {
  if (!coords) return null;

  switch (type) {
    case 'Point':
      return coords.map((c: any) => typeof c === 'number' ? c : 0);
    case 'Polygon':
      return coords.map((ring: any) => 
        ring.map((coord: any) => 
          coord.map((c: any) => typeof c === 'number' ? c : 0)
        )
      );
    default:
      return coords;
  }
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
      const styleUrl = `https://api.tomtom.com/maps/orbis/assets/styles/0.*/style.json?key=${apiKey}&apiVersion=1&map=basic_street-light&hillshade=hillshade_light&trafficFlow=flow_relative-light&trafficIncidents=incidents_light`;
      
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: [-99.3832, 31.2504], // Texas
        zoom: 6
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
      visualization.features.forEach((feature, index) => {
        if (!feature.geometry || !feature.geometry.coordinates) {
          console.warn('Invalid feature:', feature);
          return;
        }

        const sourceId = `custom-source-${index}`;
        const layerId = `custom-layer-${index}`;

        // Validate coordinates before adding to map
        const validFeature = {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: validateCoordinates(feature.geometry.coordinates, feature.geometry.type)
          }
        };

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [validFeature]
          }
        });

        switch (feature.geometry.type) {
          case 'Point':
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
            break;

          case 'Polygon':
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
            break;
        }

        // Add popups
        const popupLayerId = feature.geometry.type === 'Polygon' ? `${layerId}-fill` : layerId;
        if (feature.properties?.data || feature.properties?.title) {
          map.on('click', popupLayerId, (e) => {
            if (!e.features?.[0]) return;
            
            const coordinates = feature.geometry.type === 'Point'
              ? (feature.geometry.coordinates as [number, number])
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
              .setLngLat(coordinates)
              .setHTML(content)
              .addTo(map);
          });

          // Add hover effect
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
          if (!feature.geometry || !feature.geometry.coordinates) return;
          
          if (feature.geometry.type === 'Point') {
            bounds.extend(feature.geometry.coordinates as [number, number]);
          } else if (feature.geometry.type === 'Polygon') {
            (feature.geometry.coordinates as [number, number][][])[0].forEach(coord => bounds.extend(coord));
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
