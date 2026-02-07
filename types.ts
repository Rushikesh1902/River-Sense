
export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export interface LabelResult {
  position: Point;
  rotation: number; // In degrees
  isInside: boolean;
  method: 'flow_aligned' | 'centroid' | 'outside';
  textWidth: number;
  textHeight: number;
  actualFontSize: number;
}

export interface RiverData {
  name: string;
  points: Point[];
  bounds: Bounds;
}
