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

  const addFeaturesToMap = async (geojsonData: any) => {
    try {
      if (!mapRef.current) {
        console.error('Map instance not initialized');
        return;
      }

      console.log('Adding features to map:', {
        mapLoaded: mapRef.current.loaded(),
        geojsonDataType: typeof geojsonData,
        geojsonFeatures: geojsonData?.features?.length,
        geojsonData: JSON.stringify(geojsonData, null, 2)
      });

      // Check if source already exists
      const existingSource = mapRef.current.getSource('zip-codes');
      if (existingSource) {
        console.log('Removing existing source');
        // Remove layers first
        if (mapRef.current.getLayer('zip-codes-fill')) {
          mapRef.current.removeLayer('zip-codes-fill');
        }
        if (mapRef.current.getLayer('zip-codes-outline')) {
          mapRef.current.removeLayer('zip-codes-outline');
        }
        mapRef.current.removeSource('zip-codes');
      }

      // Validate GeoJSON structure
      if (!geojsonData || !geojsonData.features || !Array.isArray(geojsonData.features)) {
        console.error('Invalid GeoJSON structure:', geojsonData);
        return;
      }

      // Add new source
      console.log('Adding new source with data:', geojsonData);
      mapRef.current.addSource('zip-codes', {
        type: 'geojson',
        data: geojsonData
      });

      // Add layers
      console.log('Adding fill layer');
      mapRef.current.addLayer({
        id: 'zip-codes-fill',
        type: 'fill',
        source: 'zip-codes',
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.5
        }
      });

      console.log('Adding outline layer');
      mapRef.current.addLayer({
        id: 'zip-codes-outline',
        type: 'line',
        source: 'zip-codes',
        paint: {
          'line-color': '#000',
          'line-width': 1
        }
      });

      // Fit bounds to show all features
      if (geojsonData?.features?.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        geojsonData.features.forEach((feature: any) => {
          if (feature.geometry?.coordinates) {
            const coords = feature.geometry.coordinates[0];
            coords.forEach((coord: [number, number]) => {
              bounds.extend(coord);
            });
          }
        });
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }

    } catch (error) {
      console.error('Error adding features to map:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
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
            addFeaturesToMap(geojsonData);
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
        addFeaturesToMap(geojsonData);
      } else {
        map.once('style.load', () => {
          console.log('Style now loaded, adding features');
          addFeaturesToMap(geojsonData);
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
