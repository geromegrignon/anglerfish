import { useEffect, useRef, useCallback } from 'react';
import { Position, JoystickState, SonarWave, GameModeConfig } from '../types/game';

interface UseGameLoopProps {
  gameStarted: boolean;
  gameOver: boolean;
  keys: Set<string>;
  anglerfishPos: Position;
  cameraY: number;
  lightRadius: number;
  sonarWaves: SonarWave[];
  joystick: JoystickState;
  depth: number;
  lightBonusActive: boolean;
  slowedDown: boolean;
  triggerEcholocation: boolean;
  hitPoints: number;
  gameModeConfig: GameModeConfig;
  setTriggerEcholocation: React.Dispatch<React.SetStateAction<boolean>>;
  setSurvivalTime: React.Dispatch<React.SetStateAction<number>>;
  setLightBonusTimer: React.Dispatch<React.SetStateAction<number>>;
  setLightBonusActive: React.Dispatch<React.SetStateAction<boolean>>;
  setLightRadius: React.Dispatch<React.SetStateAction<number>>;
  setSlowdownTimer: React.Dispatch<React.SetStateAction<number>>;
  setSlowedDown: React.Dispatch<React.SetStateAction<boolean>>;
  setHunger: React.Dispatch<React.SetStateAction<number>>;
  setHitPoints: React.Dispatch<React.SetStateAction<number>>;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setAnglerfishPos: React.Dispatch<React.SetStateAction<Position>>;
  setCameraY: React.Dispatch<React.SetStateAction<number>>;
  setDepth: React.Dispatch<React.SetStateAction<number>>;
  setMaxDepthReached: React.Dispatch<React.SetStateAction<number>>;
  setParticles: React.Dispatch<React.SetStateAction<any[]>>;
  setSonarWaves: React.Dispatch<React.SetStateAction<SonarWave[]>>;
  setPrey: React.Dispatch<React.SetStateAction<any[]>>;
  setLightBonuses: React.Dispatch<React.SetStateAction<any[]>>;
  setMines: React.Dispatch<React.SetStateAction<any[]>>;
  setNetTraps: React.Dispatch<React.SetStateAction<any[]>>;
}

export const useGameLoop = (props: UseGameLoopProps) => {
  const {
    gameStarted,
    gameOver,
    keys,
    anglerfishPos,
    cameraY,
    lightRadius,
    sonarWaves,
    joystick,
    depth,
    lightBonusActive,
    slowedDown,
    triggerEcholocation,
    hitPoints,
    gameModeConfig,
    setTriggerEcholocation,
    setSurvivalTime,
    setLightBonusTimer,
    setLightBonusActive,
    setLightRadius,
    setSlowdownTimer,
    setSlowedDown,
    setHunger,
    setHitPoints,
    setGameOver,
    setAnglerfishPos,
    setCameraY,
    setDepth,
    setMaxDepthReached,
    setParticles,
    setSonarWaves,
    setPrey,
    setLightBonuses,
    setMines,
    setNetTraps
  } = props;

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Optimized game loop with frame skipping for mobile
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStarted || gameOver) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Skip frames if running too slow (mobile optimization)
    if (deltaTime > 32) { // If frame took longer than 32ms, skip some updates
      frameCountRef.current = 0;
    }

    frameCountRef.current++;
    const shouldUpdateExpensive = frameCountRef.current % 2 === 0; // Update expensive operations every other frame

    // Decrease hunger over time - ALWAYS happens regardless of movement
    const hungerDecayRate = 0.05 + (depth - 2000) * 0.000016;
    setHunger(prev => {
      const newHunger = Math.max(0, prev - hungerDecayRate);
      if (newHunger <= 0) {
        setGameOver(true);
      }
      return newHunger;
    });
    
    // Update survival time
    setSurvivalTime(prev => prev + 16);
    
    // Update light bonus timer
    if (lightBonusActive) {
      setLightBonusTimer(prev => {
        const newTimer = prev - 16;
        if (newTimer <= 0) {
          setLightBonusActive(false);
          setLightRadius(40);
          return 0;
        }
        return newTimer;
      });
    }
    
    // Update slowdown timer
    if (slowedDown) {
      setSlowdownTimer(prev => {
        const newTimer = prev - 16;
        if (newTimer <= 0) {
          setSlowedDown(false);
          return 0;
        }
        return newTimer;
      });
    }
    
    // Move anglerfish based on keys
    setAnglerfishPos(prev => {
      let newX = prev.x;
      let newY = prev.y;

      const speedMultiplier = slowedDown ? 0.3 : 1;
      
      // Horizontal movement (always allowed)
      if (keys.has('arrowleft') || keys.has('a')) newX -= 4 * speedMultiplier;
      if (keys.has('arrowright') || keys.has('d')) newX += 4 * speedMultiplier;
      
      // Vertical movement (only in explore mode)
      if (gameModeConfig.allowVerticalMovement) {
        if (keys.has('arrowup') || keys.has('w')) newY -= 3 * speedMultiplier;
        if (keys.has('arrowdown') || keys.has('s')) newY += 3 * speedMultiplier;
      }
      
      // Auto-scroll in speed run mode
      if (gameModeConfig.autoScroll) {
        newY += gameModeConfig.scrollSpeed;
      }

      // Virtual joystick controls
      if (joystick.active && gameModeConfig.allowVerticalMovement) {
        newX += joystick.deltaX * 5 * speedMultiplier;
        newY += joystick.deltaY * 4 * speedMultiplier;
      }

      // Boundaries
      newX = Math.max(0, Math.min(window.innerWidth - 80, newX));

      return { x: newX, y: newY };
    });

    // Update camera to follow anglerfish vertically
    setCameraY(anglerfishPos.y - window.innerHeight / 2);

    // Update depth based on anglerfish position
    const currentDepth = 2000 + Math.max(0, anglerfishPos.y - 300);
    setDepth(currentDepth);
    setMaxDepthReached(prev => Math.max(prev, currentDepth));

    // Update particles (marine snow) - less frequently on mobile
    if (shouldUpdateExpensive) {
      setParticles(prev => {
        const viewportTop = cameraY - 200;
        const viewportBottom = cameraY + window.innerHeight + 200;
        
        return prev.map(particle => ({
          ...particle,
          y: particle.y + particle.speed,
          x: particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.3
        })).filter(particle => 
          particle.y >= viewportTop && particle.y <= viewportBottom
        );
      });

      // Add new particles (reduced for mobile)
      setParticles(prev => {
        if (Math.random() < 0.1 && prev.length < 40) {
          return [...prev, {
            id: Date.now(),
            x: Math.random() * window.innerWidth,
            y: cameraY - 100,
            speed: Math.random() * 1 + 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.6 + 0.2
          }];
        }
        return prev;
      });
    }

    // Update bioluminescent waves
    setSonarWaves(prev => prev.map(wave => ({
      ...wave,
      radius: wave.radius + 6,
      opacity: Math.max(0, wave.opacity - 0.025)
    })).filter(wave => wave.opacity > 0));

    // Update prey visibility based on bioluminescent waves
    setPrey(prev => prev.map(preyItem => {
      if (preyItem.collected) return preyItem;
      
      let newVisible = preyItem.visible;
      let newTimer = Math.max(0, preyItem.visibilityTimer - 16);
      
      const lureX = anglerfishPos.x + 40;
      const lureY = anglerfishPos.y + 10;
      const glowDistance = Math.sqrt(
        Math.pow(lureX - preyItem.x, 2) +
        Math.pow(lureY - preyItem.y, 2)
      );
      
      if (glowDistance <= lightRadius) {
        newVisible = true;
        newTimer = Math.max(newTimer, 2000);
      }
      
      // Check if any bioluminescent wave reveals this prey
      sonarWaves.forEach(wave => {
        const distance = Math.sqrt(
          Math.pow(wave.x - preyItem.x, 2) +
          Math.pow(wave.y - preyItem.y, 2)
        );
        if (distance <= wave.radius && distance >= wave.radius - 15) {
          newVisible = true;
          newTimer = 4000;
        }
      });
      
      if (newTimer <= 0) {
        newVisible = false;
      }
      
      return {
        ...preyItem,
        visible: newVisible,
        visibilityTimer: newTimer
      };
    }));

    // Spawn new entities less frequently
    if (shouldUpdateExpensive) {
      // Spawn new prey as we go deeper
      setPrey(prev => {
        const deepestPrey = Math.max(...prev.map(p => p.y));
        const screenWidth = window.innerWidth;
        const spawnWidth = screenWidth - 120; // 60px margin on each side
        if (anglerfishPos.y > deepestPrey - 500 && prev.length < 300) { // Reduced max count
          const types = ['small', 'small', 'small', 'medium', 'medium', 'large'];
          const fishSvgs = ['fish-1', 'fish-2'];
          const newPreyItems = [];
          for (let i = 0; i < 15; i++) { // Reduced spawn count
            newPreyItems.push({
              id: Date.now() + i,
              x: Math.random() * spawnWidth + 60,
              y: deepestPrey + Math.random() * 500 + 200,
              collected: false,
              visible: false,
              visibilityTimer: 0,
              type: types[Math.floor(Math.random() * types.length)],
              fishSvg: fishSvgs[Math.floor(Math.random() * fishSvgs.length)]
            });
          }
          return [...prev, ...newPreyItems];
        }
        return prev;
      });

      // Spawn new light bonuses as we go deeper
      setLightBonuses(prev => {
        const deepestBonus = Math.max(...prev.map(b => b.y));
        const screenWidth = window.innerWidth;
        const spawnWidth = screenWidth - 120; // 60px margin on each side
        if (anglerfishPos.y > deepestBonus - 200 && prev.length < 15) {
          const newBonuses = [];
          if (Math.random() < 0.3) {
            newBonuses.push({
              id: Date.now() + 2000,
              x: Math.random() * spawnWidth + 60,
              y: deepestBonus + 800 + Math.random() * 400,
              collected: false,
              pulsePhase: Math.random() * Math.PI * 2
            });
          }
          return [...prev, ...newBonuses];
        }
        return prev;
      });

      // Spawn new mines as we go deeper
      setMines(prev => {
        const deepestMine = Math.max(...prev.map(m => m.y));
        const screenWidth = window.innerWidth;
        const spawnWidth = screenWidth - 120; // 60px margin on each side
        const isMobile = window.innerWidth < 768;
        const maxMines = isMobile ? 8 : 80; // Divide by 10 on mobile
        const spawnCount = isMobile ? 1 : 6; // Reduce spawn count on mobile
        if (anglerfishPos.y > deepestMine - 800 && prev.length < maxMines) {
          const newMines = [];
          for (let i = 0; i < spawnCount; i++) {
            newMines.push({
              id: Date.now() + i + 1000,
              x: Math.random() * spawnWidth + 60,
              y: deepestMine + Math.random() * 600 + 300,
              exploded: false,
              pulsePhase: Math.random() * Math.PI * 2,
              velocityX: 0,
              velocityY: 0,
              targetX: 0,
              targetY: 0,
              changeDirectionTimer: Math.random() * 300 + 100
            });
          }
          return [...prev, ...newMines];
        }
        return prev;
      });

      // Spawn new net traps as we go deeper
      setNetTraps(prev => {
        const deepestTrap = Math.max(...prev.map(t => t.y));
        const screenWidth = window.innerWidth;
        const spawnWidth = screenWidth - 120; // 60px margin on each side
        if (anglerfishPos.y > deepestTrap - 600 && prev.length < 50) { // Reduced max count
          const newTraps = [];
          for (let i = 0; i < 4; i++) { // Reduced spawn count
            newTraps.push({
              id: Date.now() + i + 3000,
              x: Math.random() * spawnWidth + 60,
              y: deepestTrap + Math.random() * 800 + 400,
              triggered: false,
              pulsePhase: Math.random() * Math.PI * 2
            });
          }
          return [...prev, ...newTraps];
        }
        return prev;
      });
    }

    // Update pulse phases (every frame for smooth animation)
    setLightBonuses(prev => prev.map(bonus => ({
      ...bonus,
      pulsePhase: bonus.pulsePhase + 0.08
    })));

    setNetTraps(prev => prev.map(trap => ({
      ...trap,
      pulsePhase: trap.pulsePhase + 0.03
    })));

    // Update mine pulse phases and movement
    setMines(prev => prev.map(mine => {
      let newMine = { ...mine };
      
      newMine.pulsePhase = mine.pulsePhase + 0.05;
      
      if (depth > 3000 && !mine.exploded) {
        newMine.changeDirectionTimer = mine.changeDirectionTimer - 16;
        
        if (newMine.changeDirectionTimer <= 0) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.3 + 0.1;
          newMine.velocityX = Math.cos(angle) * speed;
          newMine.velocityY = Math.sin(angle) * speed;
          newMine.changeDirectionTimer = Math.random() * 400 + 200;
        }
        
        newMine.x += newMine.velocityX;
        newMine.y += newMine.velocityY;
        
        if (newMine.x < 100 || newMine.x > window.innerWidth - 100) {
          newMine.velocityX *= -1;
        }
        if (newMine.y < anglerfishPos.y - 500 || newMine.y > anglerfishPos.y + 1000) {
          newMine.velocityY *= -1;
        }
        
        newMine.x = Math.max(60, Math.min(window.innerWidth - 60, newMine.x));
        newMine.y = Math.max(500, newMine.y);
      }
      
      return newMine;
    }));

    // Check collisions with prey
    setPrey(prev => prev.map(preyItem => {
      if (!preyItem.collected && preyItem.visible) {
        const distance = Math.sqrt(
          Math.pow(anglerfishPos.x + 40 - preyItem.x, 2) +
          Math.pow(anglerfishPos.y + 25 - preyItem.y, 2)
        );
        if (distance < 35) {
          const hungerRestore = preyItem.type === 'large' ? 25 : preyItem.type === 'medium' ? 15 : 8;
          setHunger(h => Math.min(100, h + hungerRestore));
          return { ...preyItem, collected: true };
        }
      }
      return preyItem;
    }));

    // Check collisions with light bonuses
    setLightBonuses(prev => prev.map(bonus => {
      if (!bonus.collected) {
        const distance = Math.sqrt(
          Math.pow(anglerfishPos.x + 40 - bonus.x, 2) +
          Math.pow(anglerfishPos.y + 25 - bonus.y, 2)
        );
        if (distance < 30) {
          setLightBonusActive(true);
          setLightBonusTimer(8000);
          setLightRadius(120);
          return { ...bonus, collected: true };
        }
      }
      return bonus;
    }));

    // Check collisions with net traps
    setNetTraps(prev => prev.map(trap => {
      if (!trap.triggered) {
        const distance = Math.sqrt(
          Math.pow(anglerfishPos.x + 40 - trap.x, 2) +
          Math.pow(anglerfishPos.y + 25 - trap.y, 2)
        );
        if (distance < 40) {
          setSlowedDown(true);
          setSlowdownTimer(4000);
          return { ...trap, triggered: true };
        }
      }
      return trap;
    }));

    // Check collisions with mines
    setMines(prev => prev.map(mine => {
      if (!mine.exploded) {
        const distance = Math.sqrt(
          Math.pow(anglerfishPos.x + 40 - mine.x, 2) +
          Math.pow(anglerfishPos.y + 25 - mine.y, 2)
        );
        if (distance < 45) {
          setHitPoints(hp => {
            const newHp = Math.max(0, hp - 1);
            if (newHp <= 0) {
              setGameOver(true);
            }
            return newHp;
          });
          return { ...mine, exploded: true };
        }
      }
      return mine;
    }));

    // Trigger bioluminescence (keyboard spacebar or mobile button)
    if (keys.has(' ') || triggerEcholocation) {
      const lureX = anglerfishPos.x + 40;
      const lureY = anglerfishPos.y + 10;
      const newWave: SonarWave = {
        id: Date.now(),
        x: lureX,
        y: lureY,
        radius: 0,
        opacity: 1
      };
      setSonarWaves(prev => [...prev, newWave]);
      
      // Reset trigger for mobile button
      if (triggerEcholocation) {
        setTriggerEcholocation(false);
      }
    }
  }, [
    keys, anglerfishPos, gameStarted, gameOver, cameraY, lightRadius, hitPoints,
    sonarWaves, joystick, depth, lightBonusActive, slowedDown, triggerEcholocation, gameModeConfig,
    setTriggerEcholocation,
    setSurvivalTime, setLightBonusTimer, setLightBonusActive, setLightRadius, 
    setSlowdownTimer, setSlowedDown, setHunger, setHitPoints, setGameOver, setAnglerfishPos,
    setCameraY, setDepth, setMaxDepthReached, setParticles, setSonarWaves,
    setPrey, setLightBonuses, setMines, setNetTraps
  ]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    let animationId: number;
    
    const animate = (currentTime: number) => {
      gameLoop(currentTime);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameLoop, gameStarted, gameOver]);
};