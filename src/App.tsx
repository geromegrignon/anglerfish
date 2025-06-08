import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Fish, Zap, Circle, Bomb } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Prey {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  visible: boolean;
  visibilityTimer: number;
  type: 'small' | 'medium' | 'large';
  fishSvg: 'fish-1' | 'fish-2';
}

interface Mine {
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

interface NetTrap {
  id: number;
  x: number;
  y: number;
  triggered: boolean;
  pulsePhase: number;
}

interface SonarWave {
  id: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
}

interface LightBonus {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  pulsePhase: number;
}

interface JoystickState {
  active: boolean;
  centerX: number;
  centerY: number;
  knobX: number;
  knobY: number;
  deltaX: number;
  deltaY: number;
}

function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [anglerfishPos, setAnglerfishPos] = useState<Position>({ x: 100, y: 300 });
  const [hunger, setHunger] = useState(100); // Hunger level (0-100)
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
  const [lightRadius, setLightRadius] = useState(40); // Base light radius
  const [lightBonusActive, setLightBonusActive] = useState(false);
  const [lightBonusTimer, setLightBonusTimer] = useState(0);
  const [lightBonuses, setLightBonuses] = useState<LightBonus[]>([]);
  const [slowedDown, setSlowedDown] = useState(false);
  const [slowdownTimer, setSlowdownTimer] = useState(0);
  const [joystick, setJoystick] = useState<JoystickState>({
    active: false,
    centerX: 80,
    centerY: window.innerHeight - 120,
    knobX: 80,
    knobY: window.innerHeight - 120,
    deltaX: 0,
    deltaY: 0
  });

  // Initialize prey
  useEffect(() => {
    const newPrey: Prey[] = [];
    for (let i = 0; i < 200; i++) {
      const types: ('small' | 'medium' | 'large')[] = ['small', 'small', 'small', 'medium', 'medium', 'large'];
      const fishSvgs: ('fish-1' | 'fish-2')[] = ['fish-1', 'fish-2'];
      newPrey.push({
        id: i,
        x: Math.random() * 1400 + 200,
        y: Math.random() * 4000 + 100, // Spread prey across even larger vertical area
        collected: false,
        visible: false,
        visibilityTimer: 0,
        type: types[Math.floor(Math.random() * types.length)],
        fishSvg: fishSvgs[Math.floor(Math.random() * fishSvgs.length)]
      });
    }
    setPrey(newPrey);
  }, []);

  // Initialize mines
  useEffect(() => {
    const newMines: Mine[] = [];
    for (let i = 0; i < 50; i++) {
      newMines.push({
        id: i,
        x: Math.random() * 1400 + 200,
        y: Math.random() * 4000 + 500, // Start mines a bit deeper
        exploded: false,
        pulsePhase: Math.random() * Math.PI * 2,
        velocityX: 0,
        velocityY: 0,
        targetX: 0,
        targetY: 0,
        changeDirectionTimer: Math.random() * 300 + 100
      });
    }
    setMines(newMines);
  }, []);

  // Initialize net traps
  useEffect(() => {
    const newNetTraps: NetTrap[] = [];
    for (let i = 0; i < 30; i++) {
      newNetTraps.push({
        id: i,
        x: Math.random() * 1400 + 200,
        y: Math.random() * 4000 + 1000, // Start net traps deeper
        triggered: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    setNetTraps(newNetTraps);
  }, []);

  // Initialize light bonuses
  useEffect(() => {
    const newLightBonuses: LightBonus[] = [];
    for (let i = 0; i < 5; i++) { // Much fewer initial bonuses
      newLightBonuses.push({
        id: i,
        x: Math.random() * 1400 + 200,
        y: 2000 + i * 1000 + Math.random() * 500, // Spread them every ~1000m
        collected: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    setLightBonuses(newLightBonuses);
  }, []);

  // Initialize floating particles (marine snow)
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * 2000 - 1000, // Start particles above and below
        speed: Math.random() * 1 + 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2
      });
    }
    setParticles(newParticles);
  }, []);

  // Update joystick center position on window resize
  useEffect(() => {
    const handleResize = () => {
      setJoystick(prev => ({
        ...prev,
        centerY: window.innerHeight - 120,
        knobY: prev.active ? prev.knobY : window.innerHeight - 120
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Virtual joystick handlers
  const handleJoystickStart = useCallback((clientX: number, clientY: number) => {
    setJoystick(prev => ({
      ...prev,
      active: true,
      knobX: clientX,
      knobY: clientY
    }));
  }, []);

  const handleJoystickMove = useCallback((clientX: number, clientY: number) => {
    setJoystick(prev => {
      if (!prev.active) return prev;

      const deltaX = clientX - prev.centerX;
      const deltaY = clientY - prev.centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 40; // Joystick radius

      let newKnobX = clientX;
      let newKnobY = clientY;
      let normalizedDeltaX = deltaX;
      let normalizedDeltaY = deltaY;

      if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX);
        newKnobX = prev.centerX + Math.cos(angle) * maxDistance;
        newKnobY = prev.centerY + Math.sin(angle) * maxDistance;
        normalizedDeltaX = Math.cos(angle) * maxDistance;
        normalizedDeltaY = Math.sin(angle) * maxDistance;
      }

      return {
        ...prev,
        knobX: newKnobX,
        knobY: newKnobY,
        deltaX: normalizedDeltaX / maxDistance, // Normalize to -1 to 1
        deltaY: normalizedDeltaY / maxDistance
      };
    });
  }, []);

  const handleJoystickEnd = useCallback(() => {
    setJoystick(prev => ({
      ...prev,
      active: false,
      knobX: prev.centerX,
      knobY: prev.centerY,
      deltaX: 0,
      deltaY: 0
    }));
  }, []);

  // Touch event handlers for joystick
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleJoystickStart(touch.clientX, touch.clientY);
  }, [handleJoystickStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleJoystickMove(touch.clientX, touch.clientY);
    }
  }, [handleJoystickMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleJoystickEnd();
  }, [handleJoystickEnd]);

  // Mouse event handlers for joystick (for desktop testing)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleJoystickStart(e.clientX, e.clientY);
  }, [handleJoystickStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleJoystickMove(e.clientX, e.clientY);
  }, [handleJoystickMove]);

  const handleMouseUp = useCallback(() => {
    handleJoystickEnd();
  }, [handleJoystickEnd]);

  // Add mouse event listeners when joystick is active
  useEffect(() => {
    if (joystick.active) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [joystick.active, handleMouseMove, handleMouseUp]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = () => {
      // Update survival time
      setSurvivalTime(prev => prev + 16);
      
      // Update light bonus timer
      if (lightBonusActive) {
        setLightBonusTimer(prev => {
          const newTimer = prev - 16;
          if (newTimer <= 0) {
            setLightBonusActive(false);
            setLightRadius(40); // Reset to base radius
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
      
      // Decrease hunger over time (faster at deeper levels)
      const hungerDecayRate = 0.025 + (depth - 2000) * 0.000008; // Much faster hunger depletion
      setHunger(prev => {
        const newHunger = Math.max(0, prev - hungerDecayRate);
        if (newHunger <= 0) {
          setGameOver(true);
        }
        return newHunger;
      });
      
      // Move anglerfish based on keys
      setAnglerfishPos(prev => {
        let newX = prev.x;
        let newY = prev.y;

        // Apply slowdown effect when caught in net
        const speedMultiplier = slowedDown ? 0.3 : 1; // 70% speed reduction
        
        if (keys.has('arrowleft') || keys.has('a')) newX -= 4 * speedMultiplier;
        if (keys.has('arrowright') || keys.has('d')) newX += 4 * speedMultiplier;
        if (keys.has('arrowup') || keys.has('w')) newY -= 3 * speedMultiplier;
        if (keys.has('arrowdown') || keys.has('s')) newY += 3 * speedMultiplier;

        // Virtual joystick controls
        if (joystick.active) {
          newX += joystick.deltaX * 5 * speedMultiplier;
          newY += joystick.deltaY * 4 * speedMultiplier;
        }

        // Boundaries
        newX = Math.max(0, Math.min(window.innerWidth - 80, newX));
        // No vertical boundaries - infinite depth!

        return { x: newX, y: newY };
      });

      // Update camera to follow anglerfish vertically
      setCameraY(anglerfishPos.y - window.innerHeight / 2);

      // Update depth based on anglerfish position
      const currentDepth = 2000 + Math.max(0, anglerfishPos.y - 300);
      setDepth(currentDepth);
      setMaxDepthReached(prev => Math.max(prev, currentDepth));

      // Update particles (marine snow)
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y + particle.speed,
        x: particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.3
      })).filter(particle => particle.y < cameraY + window.innerHeight + 200));

      // Add new particles
      setParticles(prev => {
        if (Math.random() < 0.2 && prev.length < 60) {
          return [...prev, {
            id: Date.now(),
            x: Math.random() * window.innerWidth,
            y: cameraY - 100, // Spawn particles above camera view
            speed: Math.random() * 1 + 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.6 + 0.2
          }];
        }
        return prev;
      });

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
        
       // Check if prey is within the anglerfish's glow radius (adjusted for SVG)
       const lureX = anglerfishPos.x + 40; // lure position
       const lureY = anglerfishPos.y + 10; // lure position
        const glowDistance = Math.sqrt(
          Math.pow(lureX - preyItem.x, 2) +
          Math.pow(lureY - preyItem.y, 2)
        );
        
        if (glowDistance <= lightRadius) {
          newVisible = true;
          newTimer = Math.max(newTimer, 2000); // Keep visible while in glow
        }
        
        // Check if any bioluminescent wave reveals this prey
        sonarWaves.forEach(wave => {
          const distance = Math.sqrt(
            Math.pow(wave.x - preyItem.x, 2) +
            Math.pow(wave.y - preyItem.y, 2)
          );
          if (distance <= wave.radius && distance >= wave.radius - 15) {
            newVisible = true;
            newTimer = 4000; // Visible for 4 seconds
          }
        });
        
        // Hide prey when timer expires
        if (newTimer <= 0) {
          newVisible = false;
        }
        
        return {
          ...preyItem,
          visible: newVisible,
          visibilityTimer: newTimer
        };
      }));

      // Spawn new prey as we go deeper
      setPrey(prev => {
        const deepestPrey = Math.max(...prev.map(p => p.y));
        if (anglerfishPos.y > deepestPrey - 500 && prev.length < 400) {
          const types: ('small' | 'medium' | 'large')[] = ['small', 'small', 'small', 'medium', 'medium', 'large'];
          const fishSvgs: ('fish-1' | 'fish-2')[] = ['fish-1', 'fish-2'];
          const newPreyItems = [];
          for (let i = 0; i < 20; i++) {
            newPreyItems.push({
              id: Date.now() + i,
              x: Math.random() * 1400 + 200,
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

      // Update light bonus pulse phases
      setLightBonuses(prev => prev.map(bonus => ({
        ...bonus,
        pulsePhase: bonus.pulsePhase + 0.08
      })));

      // Spawn new light bonuses as we go deeper
      setLightBonuses(prev => {
        const deepestBonus = Math.max(...prev.map(b => b.y));
        if (anglerfishPos.y > deepestBonus - 200 && prev.length < 20) { // Much more restrictive spawning
          const newBonuses = [];
          // Only spawn 1 bonus every ~1000m
          if (Math.random() < 0.3) { // 30% chance to spawn when conditions are met
            newBonuses.push({
              id: Date.now() + 2000,
              x: Math.random() * 1400 + 200,
              y: deepestBonus + 800 + Math.random() * 400, // Spawn much further apart
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
        if (anglerfishPos.y > deepestMine - 800 && prev.length < 100) {
          const newMines = [];
          for (let i = 0; i < 8; i++) {
            newMines.push({
              id: Date.now() + i + 1000,
              x: Math.random() * 1400 + 200,
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
        if (anglerfishPos.y > deepestTrap - 600 && prev.length < 60) {
          const newTraps = [];
          for (let i = 0; i < 5; i++) {
            newTraps.push({
              id: Date.now() + i + 3000,
              x: Math.random() * 1400 + 200,
              y: deepestTrap + Math.random() * 800 + 400,
              triggered: false,
              pulsePhase: Math.random() * Math.PI * 2
            });
          }
          return [...prev, ...newTraps];
        }
        return prev;
      });

      // Update net trap pulse phases
      setNetTraps(prev => prev.map(trap => ({
        ...trap,
        pulsePhase: trap.pulsePhase + 0.03
      })));

      // Update mine pulse phases and movement
      setMines(prev => prev.map(mine => {
        let newMine = { ...mine };
        
        // Update pulse phase
        newMine.pulsePhase = mine.pulsePhase + 0.05;
        
        // Only move mines if we're deep enough (below 3000m depth)
        if (currentDepth > 3000 && !mine.exploded) {
          // Decrease direction change timer
          newMine.changeDirectionTimer = mine.changeDirectionTimer - 16;
          
          // Change direction when timer expires
          if (newMine.changeDirectionTimer <= 0) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.3 + 0.1; // Very slow movement
            newMine.velocityX = Math.cos(angle) * speed;
            newMine.velocityY = Math.sin(angle) * speed;
            newMine.changeDirectionTimer = Math.random() * 400 + 200; // 3-10 seconds at 60fps
          }
          
          // Apply movement
          newMine.x += newMine.velocityX;
          newMine.y += newMine.velocityY;
          
          // Keep mines within reasonable bounds
          if (newMine.x < 100 || newMine.x > window.innerWidth - 100) {
            newMine.velocityX *= -1;
          }
          if (newMine.y < anglerfishPos.y - 500 || newMine.y > anglerfishPos.y + 1000) {
            newMine.velocityY *= -1;
          }
          
          // Clamp position
          newMine.x = Math.max(100, Math.min(window.innerWidth - 100, newMine.x));
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
            // Restore hunger based on prey size
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
            // Activate light bonus
            setLightBonusActive(true);
            setLightBonusTimer(8000); // 8 seconds of enhanced light
            setLightRadius(120); // Triple the light radius
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
            // Trigger slowdown effect
            setSlowedDown(true);
            setSlowdownTimer(4000); // 4 seconds of slowdown
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
            setHunger(h => Math.max(0, h - 30)); // Lose hunger when hitting mines
            return { ...mine, exploded: true };
          }
        }
        return mine;
      }));

      // Trigger bioluminescence
      if (keys.has(' ') || joystick.active) { // Trigger bioluminescence when joystick is active
       // Center bioluminescent pulse on the lure (adjusted for SVG)
       const lureX = anglerfishPos.x + 40; // Adjusted for SVG lure position
       const lureY = anglerfishPos.y + 10; // Adjusted for SVG lure position
        const newWave: SonarWave = {
          id: Date.now(),
          x: lureX,
          y: lureY,
          radius: 0,
          opacity: 1
        };
        setSonarWaves(prev => [...prev, newWave]);
      }
    };

    const interval = setInterval(gameLoop, 16);
    return () => clearInterval(interval);
  }, [keys, anglerfishPos, gameStarted, gameOver, cameraY, lightRadius, sonarWaves, joystick, depth, lightBonusActive, slowedDown]);

  const startGame = () => {
    setGameStarted(true);
    setHunger(100);
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
    // Reset mines
    setMines(prev => prev.map(mine => ({ ...mine, exploded: false })));
    // Reset prey
    setPrey(prev => prev.map(preyItem => ({ ...preyItem, collected: false })));
    // Reset light bonuses
    setLightBonuses(prev => prev.map(bonus => ({ ...bonus, collected: false })));
    // Reset net traps
    setNetTraps(prev => prev.map(trap => ({ ...trap, triggered: false })));
  };

  // Game Over Screen
  if (gameOver) {
    const finalScore = Math.floor(maxDepthReached);
    const timeMinutes = Math.floor(survivalTime / 60000);
    const timeSeconds = Math.floor((survivalTime % 60000) / 1000);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-red-900 flex items-center justify-center relative overflow-hidden">
        {/* Death ambiance effects */}
        <div className="absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-red-900 opacity-20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 300 + 150}px`,
                height: `${Math.random() * 300 + 150}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 2 + 2}s`
              }}
            />
          ))}
        </div>

        <div className="text-center z-10">
          <h1 className="text-6xl font-bold text-red-400 mb-4 drop-shadow-lg animate-pulse">
            STARVED
          </h1>
          <h2 className="text-3xl text-red-300 mb-6 drop-shadow-md">
            The Abyss Claims Another
          </h2>
          
          <div className="mb-8 text-gray-300 space-y-2">
            <p className="text-xl">
              <span className="text-blue-400 font-semibold">Maximum Depth:</span> {finalScore.toLocaleString()}m
            </p>
            <p className="text-xl">
              <span className="text-green-400 font-semibold">Survival Time:</span> {timeMinutes}m {timeSeconds}s
            </p>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Hunt Again
          </button>
        </div>
      </div>
    );
  }

  // Landing Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Swimming fish silhouettes */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`fish-${i}`}
              className="absolute opacity-20"
              style={{
                top: `${Math.random() * 80 + 10}%`,
                animationName: 'swimAcross',
                animationDuration: `${Math.random() * 15 + 10}s`,
                animationDelay: `${Math.random() * 10}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'linear'
              }}
            >
              <Fish className="w-8 h-8 text-blue-300" />
            </div>
          ))}

          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-blue-200 rounded-full opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                animationName: 'floatDown',
                animationDuration: `${Math.random() * 8 + 5}s`,
                animationDelay: `${Math.random() * 5}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'linear'
              }}
            />
          ))}

          {/* Twinkling lights */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`light-${i}`}
              className="absolute w-2 h-2 bg-cyan-300 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationName: 'twinkle',
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 2}s`,
                animationIterationCount: 'infinite'
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 mb-4 drop-shadow-2xl">
              ABYSS HUNTER
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-2 drop-shadow-lg">
              Survive the Endless Deep
            </p>
            <p className="text-lg text-gray-300 drop-shadow-md">
              An Anglerfish's Journey into Darkness
            </p>
          </div>

          {/* Controls & Objectives Card */}
          <div className="bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 mb-8 max-w-2xl w-full">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Controls */}
              <div>
                <h3 className="text-xl font-bold text-cyan-300 mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Controls
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><span className="text-blue-400 font-mono">WASD / Arrow Keys</span> - Move</p>
                  <p><span className="text-blue-400 font-mono">Spacebar</span> - Bioluminescent pulse</p>
                  <p><span className="text-blue-400 font-mono">Touch/Drag</span> - Virtual joystick (mobile)</p>
                </div>
              </div>

              {/* Objectives */}
              <div>
                <h3 className="text-xl font-bold text-cyan-300 mb-3 flex items-center">
                  <Circle className="w-5 h-5 mr-2" />
                  Objectives
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Hunt prey to maintain hunger</p>
                  <p>• Avoid explosive mines</p>
                  <p>• Escape net traps quickly</p>
                  <p>• Descend as deep as possible</p>
                  <p>• Collect light bonuses for better vision</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-12 rounded-lg text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl border border-blue-400/50"
          >
            Begin the Hunt
          </button>

          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>Use your bioluminescent lure to reveal hidden prey in the darkness</p>
            <p>The deeper you go, the more dangerous it becomes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, 
          rgb(17, 24, 39) 0%, 
          rgb(0, 0, 0) 30%, 
          rgb(0, 0, 0) 70%, 
          rgb(17, 24, 39) 100%)`
      }}
    >
      {/* Marine snow particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute bg-white rounded-full pointer-events-none"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y - cameraY}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            transform: `translateZ(0)` // Force GPU acceleration
          }}
        />
      ))}

      {/* Bioluminescent waves */}
      {sonarWaves.map(wave => (
        <div
          key={wave.id}
          className="absolute border-2 border-cyan-400 rounded-full pointer-events-none"
          style={{
            left: `${wave.x - wave.radius}px`,
            top: `${wave.y - wave.radius - cameraY}px`,
            width: `${wave.radius * 2}px`,
            height: `${wave.radius * 2}px`,
            opacity: wave.opacity,
            boxShadow: `0 0 ${wave.radius / 2}px rgba(34, 211, 238, ${wave.opacity * 0.5})`
          }}
        />
      ))}

      {/* Anglerfish light glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: `${anglerfishPos.x + 40 - lightRadius}px`,
          top: `${anglerfishPos.y + 10 - lightRadius - cameraY}px`,
          width: `${lightRadius * 2}px`,
          height: `${lightRadius * 2}px`,
          background: `radial-gradient(circle, 
            rgba(34, 211, 238, ${lightBonusActive ? 0.4 : 0.2}) 0%, 
            rgba(34, 211, 238, ${lightBonusActive ? 0.2 : 0.1}) 30%, 
            transparent 70%)`,
          filter: 'blur(8px)'
        }}
      />

      {/* Prey */}
      {prey.map(preyItem => {
        if (preyItem.collected || !preyItem.visible) return null;
        
        const size = preyItem.type === 'large' ? 24 : preyItem.type === 'medium' ? 18 : 12;
        const opacity = Math.min(1, preyItem.visibilityTimer / 1000);
        
        return (
          <img
            key={preyItem.id}
            src={`/${preyItem.fishSvg}.svg`}
            alt="prey"
            className="absolute pointer-events-none"
            style={{
              left: `${preyItem.x - size/2}px`,
              top: `${preyItem.y - size/2 - cameraY}px`,
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              filter: `drop-shadow(0 0 ${size/3}px rgba(34, 211, 238, ${opacity * 0.8}))`,
              transform: 'scaleX(-1)' // Face left
            }}
          />
        );
      })}

      {/* Light bonuses */}
      {lightBonuses.map(bonus => {
        if (bonus.collected) return null;
        
        const pulseScale = 1 + Math.sin(bonus.pulsePhase) * 0.3;
        const glowIntensity = 0.5 + Math.sin(bonus.pulsePhase) * 0.3;
        
        return (
          <div
            key={bonus.id}
            className="absolute pointer-events-none"
            style={{
              left: `${bonus.x - 15}px`,
              top: `${bonus.y - 15 - cameraY}px`,
              transform: `scale(${pulseScale})`,
            }}
          >
            <Zap 
              className="w-8 h-8 text-yellow-300"
              style={{
                filter: `drop-shadow(0 0 ${10 * glowIntensity}px rgba(253, 224, 71, ${glowIntensity}))`
              }}
            />
          </div>
        );
      })}

      {/* Net traps */}
      {netTraps.map(trap => {
        const pulseOpacity = 0.3 + Math.sin(trap.pulsePhase) * 0.2;
        const isVisible = trap.triggered || Math.sin(trap.pulsePhase) > 0;
        
        if (!isVisible) return null;
        
        return (
          <div
            key={trap.id}
            className="absolute pointer-events-none"
            style={{
              left: `${trap.x - 20}px`,
              top: `${trap.y - 20 - cameraY}px`,
            }}
          >
            <div 
              className={`w-10 h-10 border-2 ${trap.triggered ? 'border-red-500' : 'border-orange-400'} rounded-lg`}
              style={{
                opacity: trap.triggered ? 0.8 : pulseOpacity,
                background: trap.triggered 
                  ? 'rgba(239, 68, 68, 0.2)' 
                  : `rgba(251, 146, 60, ${pulseOpacity * 0.3})`,
                filter: trap.triggered 
                  ? 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.8))'
                  : `drop-shadow(0 0 10px rgba(251, 146, 60, ${pulseOpacity}))`
              }}
            >
              {/* Net pattern */}
              <div className="absolute inset-1 border border-current opacity-50" />
              <div className="absolute inset-2 border border-current opacity-30" />
            </div>
          </div>
        );
      })}

      {/* Mines */}
      {mines.map(mine => {
        if (mine.exploded) return null;
        
        const pulseScale = 1 + Math.sin(mine.pulsePhase) * 0.2;
        const glowIntensity = 0.4 + Math.sin(mine.pulsePhase) * 0.3;
        
        return (
          <div
            key={mine.id}
            className="absolute pointer-events-none"
            style={{
              left: `${mine.x - 20}px`,
              top: `${mine.y - 20 - cameraY}px`,
              transform: `scale(${pulseScale})`,
            }}
          >
            <Bomb 
              className="w-10 h-10 text-red-500"
              style={{
                filter: `drop-shadow(0 0 ${15 * glowIntensity}px rgba(239, 68, 68, ${glowIntensity}))`
              }}
            />
          </div>
        );
      })}

      {/* Anglerfish */}
      <img
        src="/anglerfish.svg"
        alt="anglerfish"
        className="absolute z-10 pointer-events-none"
        style={{
          left: `${anglerfishPos.x}px`,
          top: `${anglerfishPos.y - cameraY}px`,
          width: '80px',
          height: '60px',
          filter: slowedDown 
            ? 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8)) brightness(0.7)' 
            : 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.6))'
        }}
      />

      {/* UI Elements */}
      <div className="absolute top-4 left-4 z-20">
        {/* Hunger bar */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 mb-2 border border-red-500/30">
          <div className="flex items-center mb-1">
            <Fish className="w-4 h-4 text-red-400 mr-2" />
            <span className="text-red-300 text-sm font-semibold">Hunger</span>
          </div>
          <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-300 transition-all duration-300"
              style={{ width: `${hunger}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">{Math.round(hunger)}%</div>
        </div>

        {/* Depth indicator */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30">
          <div className="flex items-center mb-1">
            <Circle className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-blue-300 text-sm font-semibold">Depth</span>
          </div>
          <div className="text-lg font-bold text-cyan-300">
            {Math.floor(depth).toLocaleString()}m
          </div>
        </div>
      </div>

      {/* Light bonus timer */}
      {lightBonusActive && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/30">
            <div className="flex items-center mb-1">
              <Zap className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-yellow-300 text-sm font-semibold">Enhanced Vision</span>
            </div>
            <div className="text-lg font-bold text-yellow-300">
              {Math.ceil(lightBonusTimer / 1000)}s
            </div>
          </div>
        </div>
      )}

      {/* Slowdown effect indicator */}
      {slowedDown && (
        <div className="absolute top-20 right-4 z-20">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-red-500/30">
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 border-2 border-red-400 rounded mr-2" />
              <span className="text-red-300 text-sm font-semibold">Trapped!</span>
            </div>
            <div className="text-lg font-bold text-red-300">
              {Math.ceil(slowdownTimer / 1000)}s
            </div>
          </div>
        </div>
      )}

      {/* Virtual joystick for mobile */}
      <div className="md:hidden">
        <div
          className="absolute w-20 h-20 border-2 border-white/30 rounded-full bg-black/20 backdrop-blur-sm"
          style={{
            left: `${joystick.centerX - 40}px`,
            top: `${joystick.centerY - 40}px`,
          }}
        >
          <div
            className="absolute w-8 h-8 bg-white/60 rounded-full transition-all duration-75"
            style={{
              left: `${joystick.knobX - joystick.centerX + 40 - 16}px`,
              top: `${joystick.knobY - joystick.centerY + 40 - 16}px`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          />
        </div>
      </div>
    </div>
  );
}

export default App;