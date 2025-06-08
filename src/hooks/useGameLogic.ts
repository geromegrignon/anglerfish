import { useState, useEffect, useCallback } from 'react';
import { 
  Position, 
  Prey, 
  Mine, 
  NetTrap, 
  SonarWave, 
  Particle, 
  LightBonus, 
  JoystickState,
  GameMode,
  GameModeConfig
} from '../types/game';

export const useGameLogic = () => {
  const [anglerfishPos, setAnglerfishPos] = useState<Position>({ x: 100, y: 300 });
  const [hunger, setHunger] = useState(100);
  const [hitPoints, setHitPoints] = useState(3);
  const [maxDepthReached, setMaxDepthReached] = useState(2000);
  const [gameOver, setGameOver] = useState(false);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [prey, setPrey] = useState<Prey[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [netTraps, setNetTraps] = useState<NetTrap[]>([]);
  const [sonarWaves, setSonarWaves] = useState<SonarWave[]>([]);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [gameStarted, setGameStarted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [depth, setDepth] = useState(2000);
  const [cameraY, setCameraY] = useState(0);
  const [lightRadius, setLightRadius] = useState(40);
  const [lightBonusActive, setLightBonusActive] = useState(false);
  const [lightBonusTimer, setLightBonusTimer] = useState(0);
  const [lightBonuses, setLightBonuses] = useState<LightBonus[]>([]);
  const [slowedDown, setSlowedDown] = useState(false);
  const [slowdownTimer, setSlowdownTimer] = useState(0);
  const [triggerEcholocation, setTriggerEcholocation] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('explore');
  const [gameModeConfig, setGameModeConfig] = useState<GameModeConfig>({
    mode: 'explore',
    autoScroll: false,
    allowVerticalMovement: true,
    scrollSpeed: 0
  });
  const [joystick, setJoystick] = useState<JoystickState>({
    active: false,
    centerX: 80,
    centerY: window.innerHeight - 120,
    knobX: 80,
    knobY: window.innerHeight - 120,
    deltaX: 0,
    deltaY: 0
  });

  const startGame = useCallback((mode: GameMode = 'explore') => {
    const config: GameModeConfig = {
      mode,
      autoScroll: mode === 'speedrun',
      allowVerticalMovement: mode === 'explore',
      scrollSpeed: mode === 'speedrun' ? 2 : 0
    };
    
    setGameMode(mode);
    setGameModeConfig(config);
    setGameStarted(true);
    setHunger(100);
    setHitPoints(3);
    setMaxDepthReached(2000);
    setGameOver(false);
    setSurvivalTime(0);
    setAnglerfishPos({ x: 100, y: 300 });
    setCameraY(0);
    setDepth(2000);
    setLightRadius(40);
    setLightBonusActive(false);
    setLightBonusTimer(0);
    setSlowedDown(false);
    setSlowdownTimer(0);
    setTriggerEcholocation(false);
    setMines(prev => prev.map(mine => ({ ...mine, exploded: false })));
    setPrey(prev => prev.map(preyItem => ({ ...preyItem, collected: false })));
    setLightBonuses(prev => prev.map(bonus => ({ ...bonus, collected: false })));
    setNetTraps(prev => prev.map(trap => ({ ...trap, triggered: false })));
  }, []);

  return {
    // State
    anglerfishPos,
    hunger,
    hitPoints,
    maxDepthReached,
    gameOver,
    survivalTime,
    prey,
    mines,
    netTraps,
    sonarWaves,
    keys,
    gameStarted,
    particles,
    depth,
    cameraY,
    lightRadius,
    lightBonusActive,
    lightBonusTimer,
    lightBonuses,
    slowedDown,
    slowdownTimer,
    triggerEcholocation,
    joystick,
    gameMode,
    gameModeConfig,
    
    // Setters
    setAnglerfishPos,
    setHunger,
    setHitPoints,
    setMaxDepthReached,
    setGameOver,
    setSurvivalTime,
    setPrey,
    setMines,
    setNetTraps,
    setSonarWaves,
    setKeys,
    setGameStarted,
    setParticles,
    setDepth,
    setCameraY,
    setLightRadius,
    setLightBonusActive,
    setLightBonusTimer,
    setLightBonuses,
    setSlowedDown,
    setSlowdownTimer,
    setTriggerEcholocation,
    setJoystick,
    setGameMode,
    setGameModeConfig,
    
    // Actions
    startGame
  };
};