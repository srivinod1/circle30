import type { Feature, Point, Polygon, GeoJsonProperties } from 'geojson';

// Style options for features
export interface FeatureStyle {
  color?: string;
  fillColor?: string;
  opacity?: number;
  fillOpacity?: number;
  weight?: number;
  radius?: number;
}

// Properties that can be attached to a feature
export interface FeatureProperties extends GeoJsonProperties {
  title?: string;
  data?: Record<string, string | number>;
  style?: FeatureStyle;
}

// Valid geometry types for our features
export type ValidGeometry = Point | Polygon;

// Our custom feature type
export type MapFeature = Feature<ValidGeometry, FeatureProperties>;

// Configuration for map visualization
export interface MapVisualizationConfig {
  fitBounds?: boolean;
  center?: [number, number];
  zoom?: number;
}

// Main visualization type
export interface MapVisualization {
  features: MapFeature[];
  config?: MapVisualizationConfig;
}

// Response from the AI endpoint
export interface AIResponse {
  message: string;
  visualization?: MapVisualization;
}

// Chat message type
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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