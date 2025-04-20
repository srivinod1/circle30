// Response types for the AI chat
export interface AIResponse {
  text: {
    analysis: string;
    zipCodes: Array<{
      zip: string;
      population: number;
      evStations: number;
      evPerCapita: number;
    }>;
  };
  geojson: string;  // GeoJSON string that will be parsed into FeatureCollection
}

export interface ParsedAIResponse {
  text: {
    analysis: string;
    zipCodes: Array<{
      zip: string;
      population: number;
      evStations: number;
      evPerCapita: number;
    }>;
  };
  geojson: {
    type: "FeatureCollection";
    features: Array<{
      type: "Feature";
      geometry: {
        type: "Polygon";
        coordinates: number[][][];  // Array of coordinate rings
      };
      properties: {
        ZIP: string;
        population: number;
        ev_poi_count: number;
        evs_per_capita: number;
      };
    }>;
  };
}

export interface ZipCodeFeature {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: number[][][];  // Array of coordinate pairs
  };
  properties: {
    ZIP: string;
    population: number;
    ev_poi_count: number;
    evs_per_capita: number;
  };
}

export interface Visualization {
  type: string;
  data: MapVisualization;
}

export interface MapVisualization {
  features: Feature[];
  config: MapConfig;
}

export interface MapConfig {
  fitBounds: boolean;
  bounds?: {
    southWest: [number, number];  // [lon, lat]
    northEast: [number, number];  // [lon, lat]
  };
  center: [number, number];  // [lon, lat]
  zoom: number;
}

export interface Feature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'Point';
    coordinates: number[][][] | number[];  // For Polygon: array of coordinate rings, for Point: [lon, lat]
  };
  properties: {
    id: string;
    title: string;
    data: FeatureData;
    style: FeatureStyle;
  };
}

export interface FeatureData {
  zipCode?: string;
  evStationCount?: number;
  population?: number;
  evStationsPerCapita?: number;
  type?: 'EV Station';
}

export interface FeatureStyle {
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  color?: string;
  radius?: number;
} 