'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AIResponse } from '@/types/responses';

interface Circle30MapProps {
  geojsonData?: AIResponse['geojson'];
}

export default function Circle30Map({ geojsonData }: Circle30MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
  const apiVersion = 1;

  const getLatestStyleVersion = async (): Promise<string> => {
    const versionsUrl = `https://api.tomtom.com/maps/orbis/assets/styles?key=${apiKey}&apiVersion=${apiVersion}`;
    const res = await fetch(versionsUrl);
    const data = await res.json();

    if (!res.ok || !data.versions?.length) {
      throw new Error('No available style versions');
    }

    // Return latest version (usually last in list)
    return data.versions[data.versions.length - 1].version;
  };

  const fetchStyle = async (version: string) => {
    const styleUrl = `https://api.tomtom.com/maps/orbis/assets/styles/${version}/style.json?key=${apiKey}&apiVersion=${apiVersion}&map=basic_street-light`;
    const res = await fetch(styleUrl);
    if (!res.ok) throw new Error('Failed to fetch style JSON');
    return await res.json();
  };

  const addFeaturesToMap = (map: maplibregl.Map, geojsonData: AIResponse['geojson']) => {
    // Remove layers first, then source
    if (map.getSource('zip-data')) {
      // Remove layers in correct order
      if (map.getLayer('zip-polygons-hover')) {
        map.removeLayer('zip-polygons-hover');
      }
      if (map.getLayer('zip-polygons')) {
        map.removeLayer('zip-polygons');
      }
      // Remove source after all layers are removed
      map.removeSource('zip-data');
    }

    // Add new source with all features
    map.addSource('zip-data', {
      type: 'geojson',
      data: geojsonData
    });

    // Add ZIP code polygons layer
    map.addLayer({
      id: 'zip-polygons',
      type: 'fill',
      source: 'zip-data',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'evs_per_capita'],
          0, '#ff0000',    // Red for no EV stations
          0.0001, '#ffff00', // Yellow for some stations
          0.001, '#00ff00'   // Green for many stations
        ],
        'fill-opacity': 0.5,
        'fill-outline-color': '#000000'
      }
    });

    // Add hover effect layer
    map.addLayer({
      id: 'zip-polygons-hover',
      type: 'line',
      source: 'zip-data',
      paint: {
        'line-color': '#000000',
        'line-width': 2
      },
      filter: ['==', ['get', 'ZIP'], '']
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const loadMap = async () => {
      try {
        const version = await getLatestStyleVersion();
        const style = await fetchStyle(version);

        const map = new maplibregl.Map({
          container: mapContainer.current!,
          style,
          center: [-74.0060, 40.7128], // Default to NYC
          zoom: 12
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-right');
        mapRef.current = map;

        // Wait for map to load before adding features
        map.on('load', () => {
          if (geojsonData) {
            addFeaturesToMap(map, geojsonData);
          }
        });
      } catch (err: any) {
        console.error('Map load error:', err);
        setError(err.message || 'Unknown error loading map.');
      }
    };

    loadMap();

    return () => {
      mapRef.current?.remove();
    };
  }, []); // Initial map load

  // Handle visualization updates
  useEffect(() => {
    const map = mapRef.current;
    if (map && geojsonData) {
      console.log('Adding features to map:', geojsonData);
      addFeaturesToMap(map, geojsonData);
    }
  }, [geojsonData]); // Update when visualization changes

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#0F172A', position: 'absolute', inset: 0 }}>
      {error && (
        <div className="text-red-400 bg-gray-900 p-4 absolute top-0 left-0 z-50">
          Map error: {error}
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
