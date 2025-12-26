
import { ParticleConfig } from './types';

export const DEFAULT_CONFIG: ParticleConfig = {
  count: 35000,
  hue: 280,
  saturation: 90,
  lightness: 60,
  size: 0.6,
  speed: 1.2,
  shape: 'sphere'
};

export const MAX_PARTICLES = 60000;
export const MIN_PARTICLES = 10000;

export const CAMERA_DISTANCE = 80;
