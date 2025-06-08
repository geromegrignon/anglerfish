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

  // Bioluminescent pulse
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
          
          <div className="mb-8 text-gray