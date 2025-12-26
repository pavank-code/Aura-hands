
export type VisualShape = 'sphere' | 'cube' | 'torus' | 'heart' | 'dna';

export interface ParticleConfig {
  count: number;
  hue: number;
  saturation: number;
  lightness: number;
  size: number;
  speed: number;
  shape: VisualShape;
}

export interface HandData {
  landmarks: { x: number; y: number; z: number }[];
  isOpen: boolean;
  score: number;
  label: 'Left' | 'Right';
}

export interface GestureState {
  hands: HandData[];
  distance: number;
  center: { x: number; y: number; z: number };
  expansion: number;
  rotation: { x: number; y: number };
}
