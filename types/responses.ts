// Response types for the AI chat
export interface AIResponse {
  text: string;
  visualizations: Visualization[];
}

export interface Visualization {
  type: string;
  data: MapVisualization;
}

export interface MapVisualization {
  features: Feature[];
  config?: {
    fitBounds?: boolean;
    center?: [number, number];
    zoom?: number;
  };
}

export interface Feature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates: number[] | number[][] | number[][][];
  };
  properties: {
    id: string;
    title?: string;
    data?: Record<string, string | number>;
    style?: {
      color?: string;
      radius?: number;
      fillColor?: string;
      fillOpacity?: number;
      weight?: number;
      opacity?: number;
    };
  };
} 