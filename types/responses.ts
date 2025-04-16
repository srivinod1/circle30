import type { Feature, Geometry } from 'geojson';

// Style options for visualization features
export interface FeatureStyle {
  color?: string;
  fillColor?: string;
  opacity?: number;
  weight?: number;
}

// Properties for features, extending GeoJsonProperties to ensure compatibility
export interface FeatureProperties extends GeoJsonProperties {
  title?: string;
  data?: Record<string, string | number>;
  style?: FeatureStyle;
}

// Our map feature type that's used in Circle30Map.tsx
export type MapFeature = Feature<Geometry, FeatureProperties>;

// Main visualization type used in both Circle30Map.tsx and Chat.tsx
export interface MapVisualization {
  features: MapFeature[];
  config?: {
    fitBounds?: boolean;
  };
}

// Response type used in Chat.tsx
export interface ChatResponse {
  message: string;
  visualization?: MapVisualization;
}

// Message type used in Chat.tsx
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Response type used in AskAI.tsx
export interface AIResponse {
  text: string;
  visualization?: MapVisualization;
}

// Geometry types
export interface Point {
  type: "Point";
  coordinates: [number, number];
}

export interface LineString {
  type: "LineString";
  coordinates: [number, number][];
}

export interface Polygon {
  type: "Polygon";
  coordinates: [number, number][][];
}

// Feature types with specific geometries
export interface PointFeature extends Feature<Point, FeatureProperties> {
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface LineStringFeature extends Feature<LineString, FeatureProperties> {
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}

export interface PolygonFeature extends Feature<Polygon, FeatureProperties> {
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
} 