export interface Position {
  x: number;
  y: number;
}

export interface Prey {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  visible: boolean;
  visibilityTimer: number;
  type: 'small' | 'medium' | 'large';
  fishSvg: 'fish-1' | 'fish-2';
}

export interface Mine {
  id: number;
  x: number;
  y: number;
  exploded: boolean;
  pulsePhase: number;
  velocityX: number;
  velocityY: number;
  targetX: number;
  targetY: number;
  changeDirectionTimer: number;
}

export interface NetTrap {
  id: number;
  x: number;
  y: number;
  triggered: boolean;
  pulsePhase: number;
}

export interface SonarWave {
  id: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
}

export interface LightBonus {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  pulsePhase: number;
}

export interface JoystickState {
  active: boolean;
  centerX: number;
  centerY: number;
  knobX: number;
  knobY: number;
  deltaX: number;
  deltaY: number;
}

export type GameMode = 'speedrun';

export interface GameModeConfig {
  mode: GameMode;
  autoScroll: boolean;
  allowVerticalMovement: boolean;
  scrollSpeed: number;
}

export interface DepthMilestone {
  id: number;
  depth: number;
  zoneName: string;
  opacity: number;
  scale: number;
  duration: number;
}