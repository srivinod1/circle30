import type { Feature, Geometry } from 'geojson';

// Response types for the AI chat
export interface AIResponse {
  message: string;
  visualization?: MapVisualization;
}

export interface Visualization {
  type: string;
  data: MapVisualization;
}

export interface MapVisualization {
  features: Array<Feature<Geometry, FeatureProperties>>;
  config?: {
    fitBounds?: boolean;
  };
}

// Define our own properties interface
export interface FeatureProperties {
  title?: string;
  data?: Record<string, string | number>;
  style?: FeatureStyle;
}

export interface FeatureStyle {
  color?: string;
  fillColor?: string;
  opacity?: number;
  weight?: number;
}

export interface Feature {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: FeatureProperties;
}

export interface GeoJSONGeometry {
  type: 'Point' | 'Polygon';
  coordinates: number[] | number[][] | number[][][];
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