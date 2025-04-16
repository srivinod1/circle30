import type { Feature, Geometry, GeoJsonProperties } from 'geojson';

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
  features: MapFeature[];
  config?: {
    fitBounds?: boolean;
    center?: [number, number];
    zoom?: number;
  };
}

export interface FeatureProperties extends GeoJsonProperties {
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
}

export type MapFeature = Feature<Geometry, FeatureProperties>;

// Helper types for specific geometries
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