'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapVisualization, Feature } from '@/types/responses';

interface Circle30MapProps {
  visualization?: MapVisualization;
}

export default function Circle30Map({ visualization }: Circle30MapProps) {
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

  // Add new function to handle features
  const addFeaturesToMap = (map: maplibregl.Map, features: Feature[]) => {
    // Remove existing layers if any
    if (map.getSource('ev-data')) {
      map.removeLayer('ev-points');
      map.removeLayer('zip-polygons');
      map.removeSource('ev-data');
    }

    // Add new source with all features
    map.addSource('ev-data', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features
      }
    });

    // Add ZIP code polygons layer
    map.addLayer({
      id: 'zip-polygons',
      type: 'fill',
      source: 'ev-data',
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'fill-color': ['get', ['get', 'fillColor', ['get', 'style']]],
        'fill-opacity': ['get', ['get', 'fillOpacity', ['get', 'style']]],
        'fill-outline-color': ['get', ['get', 'strokeColor', ['get', 'style']]],
      }
    });

    // Add EV station points layer
    map.addLayer({
      id: 'ev-points',
      type: 'circle',
      source: 'ev-data',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-radius': ['get', ['get', 'radius', ['get', 'style']]],
        'circle-color': ['get', ['get', 'color', ['get', 'style']]],
        'circle-opacity': 0.8
      }
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
          if (visualization?.features) {
            addFeaturesToMap(map, visualization.features);
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
    if (map && visualization?.features) {
      addFeaturesToMap(map, visualization.features);
    }
  }, [visualization]); // Update when visualization changes

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
