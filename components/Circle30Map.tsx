'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapVisualization, MapFeature, PointFeature, LineStringFeature, PolygonFeature } from '../types/responses';

export default function Circle30Map({ visualization }: { visualization?: MapVisualization }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      try {
        const map = new maplibregl.Map({
          container: mapContainer.current!,
          style: `https://api.tomtom.com/maps/basic/style/1/style.json?key=${process.env.NEXT_PUBLIC_TOMTOM_API_KEY}`,
          center: [-99.3832, 31.2504], // Default to Texas center
          zoom: 6
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-right');
        mapRef.current = map;

        // Wait for map to load before adding sources and layers
        await new Promise(resolve => map.on('load', resolve));
      } catch (err: any) {
        console.error('Map initialization error:', err);
        setError(err.message);
      }
    };

    initializeMap();
    return () => mapRef.current?.remove();
  }, []);

  // Update visualizations when data changes
  useEffect(() => {
    if (!mapRef.current || !visualization) return;
    const map = mapRef.current;

    // Clear existing layers and sources
    map.getStyle().layers.forEach(layer => {
      if (layer.id.startsWith('custom-')) {
        map.removeLayer(layer.id);
      }
    });
    Object.keys(map.getStyle().sources).forEach(source => {
      if (source.startsWith('custom-')) {
        map.removeSource(source);
      }
    });

    // Add new features
    visualization.features.forEach((feature, index) => {
      const sourceId = `custom-source-${index}`;
      const layerId = `custom-layer-${index}`;

      // Add source
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [feature]
        }
      });

      // Add appropriate layer based on geometry type
      switch (feature.geometry.type) {
        case 'Point':
          map.addLayer({
            id: layerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': feature.properties.style?.radius || 6,
              'circle-color': feature.properties.style?.color || '#4F46E5',
              'circle-opacity': feature.properties.style?.opacity || 1
            }
          });
          break;

        case 'LineString':
          map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': feature.properties.style?.color || '#4F46E5',
              'line-width': feature.properties.style?.weight || 2,
              'line-opacity': feature.properties.style?.opacity || 1
            }
          });
          break;

        case 'Polygon':
          map.addLayer({
            id: `${layerId}-fill`,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': feature.properties.style?.fillColor || '#4F46E5',
              'fill-opacity': feature.properties.style?.fillOpacity || 0.3
            }
          });

          map.addLayer({
            id: `${layerId}-outline`,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': feature.properties.style?.color || '#4F46E5',
              'line-width': feature.properties.style?.weight || 2,
              'line-opacity': feature.properties.style?.opacity || 1
            }
          });
          break;
      }

      // Add popup if there's data
      if (feature.properties.data || feature.properties.title) {
        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false
        });

        map.on('mouseenter', layerId, (e) => {
          map.getCanvas().style.cursor = 'pointer';
          
          const coordinates = feature.geometry.type === 'Point' 
            ? feature.geometry.coordinates as [number, number]
            : e.lngLat;

          const content = `
            <div style="color: black; padding: 8px;">
              ${feature.properties.title ? `<h3 style="font-weight: bold; margin-bottom: 8px;">${feature.properties.title}</h3>` : ''}
              ${Object.entries(feature.properties.data || {})
                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                .join('<br/>')}
            </div>
          `;

          popup
            .setLngLat(coordinates)
            .setHTML(content)
            .addTo(map);
        });

        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
          popup.remove();
        });
      }
    });

    // Fit bounds if specified
    if (visualization.config?.fitBounds !== false) {
      const bounds = new maplibregl.LngLatBounds();
      visualization.features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
          bounds.extend(feature.geometry.coordinates as [number, number]);
        } else if (feature.geometry.type === 'LineString') {
          (feature.geometry.coordinates as [number, number][]).forEach(coord => bounds.extend(coord));
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
  }, [visualization]);

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#0F172A' }}>
      {error && (
        <div className="text-red-400 bg-gray-900 p-4 absolute top-0 left-0 z-50">
          Map error: {error}
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
