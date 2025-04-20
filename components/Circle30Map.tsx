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

  const addFeaturesToMap = (map: maplibregl.Map, geojsonData: any) => {
    console.log('Map instance:', map);
    console.log('Attempting to add features:', geojsonData);

    // Remove existing layers if any
    if (map.getSource('zip-data')) {
      console.log('Removing existing layers');
      if (map.getLayer('zip-polygons-hover')) map.removeLayer('zip-polygons-hover');
      if (map.getLayer('zip-polygons')) map.removeLayer('zip-polygons');
      map.removeSource('zip-data');
    }

    try {
      // Add new source
      map.addSource('zip-data', {
        type: 'geojson',
        data: geojsonData
      });
      console.log('Added source successfully');

      // Add ZIP code polygons layer
      map.addLayer({
        id: 'zip-polygons',
        type: 'fill',
        source: 'zip-data',
        paint: {
          'fill-color': '#ff0000',  // Simplified color for testing
          'fill-opacity': 0.5,
          'fill-outline-color': '#000000'
        }
      });
      console.log('Added layer successfully');
    } catch (error) {
      console.error('Error adding features to map:', error);
    }
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
      console.log('Map style loaded:', map.isStyleLoaded());
      if (map.isStyleLoaded()) {
        addFeaturesToMap(map, geojsonData);
      } else {
        map.once('style.load', () => {
          console.log('Style now loaded, adding features');
          addFeaturesToMap(map, geojsonData);
        });
      }
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
