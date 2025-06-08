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

        if (keys.has('arrowleft') || keys.has('a')) newX -= 4;
        if (keys.has('arrowright') || keys.has('d')) newX += 4;
        if (keys.has('arrowup') || keys.has('w')) newY -= 3;
        if (keys.has('arrowdown') || keys.has('s')) newY += 3;

        // Virtual joystick controls
        if (joystick.active) {
          newX += joystick.deltaX * 5; // Adjust speed multiplier as needed
          newY += joystick.deltaY * 4;
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
  }, [keys, anglerfishPos, gameStarted, gameOver, cameraY, lightRadius, sonarWaves, joystick, depth, lightBonusActive]);

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
    // Reset mines
    setMines(prev => prev.map(mine => ({ ...mine, exploded: false })));
    // Reset prey
    setPrey(prev => prev.map(preyItem => ({ ...preyItem, collected: false })));
    // Reset light bonuses
    setLightBonuses(prev => prev.map(bonus => ({ ...bonus, collected: false })));
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
          
          <div className="mb-8 text-gray-300 space-y-3 bg-black bg-opacity-70 p-8 rounded-lg border-2 border-red-500">
            <p className="text-4xl font-bold text-cyan-400">Final Depth: {finalScore}m</p>
            <p className="text-xl text-yellow-400">Survival Time: {timeMinutes}m {timeSeconds}s</p>
            <div className="mt-4 pt-4 border-t border-gray-600">
              <p className="text-red-300">💀 Hunger consumed you in the depths</p>
              <p className="text-gray-400 text-sm mt-2">The eternal darkness has claimed another predator...</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="bg-cyan-600 hover:bg-cyan-500 text-black px-8 py-4 rounded-lg text-xl font-bold transform transition-all duration-200 hover:scale-105 shadow-lg border-2 border-cyan-400 mr-4"
            >
              Hunt Again
            </button>
            <button
              onClick={() => {
                setGameStarted(false);
                setGameOver(false);
              }}
              className="bg-gray-600 hover:bg-gray-500 text-white px-8 py-4 rounded-lg text-xl font-bold transform transition-all duration-200 hover:scale-105 shadow-lg border-2 border-gray-400"
            >
              Return to Surface
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated fish swimming in the background */}
        {Array.from({ length: 12 }).map((_, i) => {
          const animationDelay = Math.random() * 8;
          const animationDuration = 15 + Math.random() * 10;
          const startY = Math.random() * 100;
          const fishType = Math.random() > 0.5 ? 'fish-2' : 'fish-2';
          const size = 20 + Math.random() * 30;
          const opacity = 0.3 + Math.random() * 0.4;
          
          return (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: '-60px',
                top: `${startY}%`,
                animationDelay: `${animationDelay}s`,
                animationDuration: `${animationDuration}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'linear',
                opacity: opacity
              }}
            >
              <div
                className="animate-swim-across"
                style={{
                  animation: `swimAcross ${animationDuration}s linear infinite`,
                  animationDelay: `${animationDelay}s`
                }}
              >
                <img 
                  src={`/${fishType}.svg`} 
                  alt="Swimming Fish" 
                  className="drop-shadow-lg"
                  style={{
                    width: `${size}px`,
                    height: `${size * 0.8}px`,
                    filter: `hue-rotate(${Math.random() * 360}deg) saturate(0.8) brightness(0.9) drop-shadow(0 0 ${size/8}px rgba(34, 211, 238, 0.4))`,
                    transform: `scaleY(${0.8 + Math.sin(i) * 0.2}) ${Math.random() > 0.5 ? 'scaleX(-1)' : ''}`
                  }}
                />
              </div>
            </div>
          );
        })}
        
        {/* Mysterious deep-sea creatures appearing and fading */}
        {Array.from({ length: 6 }).map((_, i) => {
          const animationDelay = Math.random() * 12;
          const animationDuration = 8 + Math.random() * 6;
          const posX = 10 + Math.random() * 80;
          const posY = 20 + Math.random() * 60;
          
          return (
            <div
              key={`creature-${i}`}
              className="absolute pointer-events-none"
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                animationDelay: `${animationDelay}s`,
                animationDuration: `${animationDuration}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out'
              }}
            >
              <div
                className="animate-fade-in-out"
                style={{
                  animation: `fadeInOut ${animationDuration}s ease-in-out infinite`,
                  animationDelay: `${animationDelay}s`
                }}
              >
                <img 
                  src={`/${Math.random() > 0.5 ? 'fish-2' : 'fish-2'}.svg`} 
                  alt="Deep Sea Creature" 
                  className="drop-shadow-lg"
                  style={{
                    width: `${15 + Math.random() * 25}px`,
                    height: `${12 + Math.random() * 20}px`,
                    filter: `hue-rotate(${180}deg) saturate(1.2) brightness(0.7) drop-shadow(0 0 8px rgba(34, 211, 238, 0.3))`,
                    transform: `rotate(${-15 + Math.random() * 30}deg) ${Math.random() > 0.5 ? 'scaleX(-1)' : ''}`
                  }}
                />
              </div>
            </div>
          );
        })}
        
        {/* Abyss background effects */}
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-blue-900 opacity-5 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 200 + 100}px`,
                height: `${Math.random() * 200 + 100}px`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${Math.random() * 4 + 3}s`
              }}
            />
          ))}
        </div>

        {/* Floating particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-gray-400 opacity-20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animation: `floatDown ${8 + Math.random() * 6}s linear infinite`,
              animationDelay: `${Math.random() * 8}s`
            }}
          />
        ))}
        
        {/* Bioluminescent plankton effects */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`plankton-${i}`}
            className="absolute bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              boxShadow: '0 0 4px rgba(34, 211, 238, 0.8)'
            }}
          />
        ))}

        <div className="text-center z-10">
          <h1 className="text-7xl font-bold text-cyan-400 mb-4 drop-shadow-lg animate-pulse">
            ABYSS
          </h1>
          <h2 className="text-4xl text-cyan-300 mb-2 drop-shadow-md">
            HUNTER
          </h2>
          <p className="text-lg text-gray-400 mb-8">Survival in the Depths</p>
          <div className="mb-8 text-gray-300 space-y-2 bg-black bg-opacity-50 p-6 rounded-lg">
            <p className="text-cyan-400 font-semibold">🌊 {depth}m below surface</p>
            <p className="text-red-400 font-semibold">🍽️ SURVIVE BY HUNTING</p>
            <p>WASD/Arrows: Swim • SPACE: Bioluminescent pulse</p>
            <p className="text-yellow-400">🐟 Eat fish to restore hunger</p>
            <p className="text-red-400">💣 Avoid mines (drain hunger)</p>
            <p className="text-orange-400">⚠️ Hunger depletes faster in deep waters</p>
            <p className="text-gray-400 text-sm">Survive as long as possible. Score = Maximum depth reached.</p>
          </div>
          <button
            onClick={startGame}
            className="bg-cyan-600 hover:bg-cyan-500 text-black px-8 py-4 rounded-lg text-xl font-bold transform transition-all duration-200 hover:scale-105 shadow-lg border-2 border-cyan-400"
          >
            Begin the Hunt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={canvasRef}
      className="relative min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-800 overflow-hidden"
      style={{ 
        height: '100vh'
      }}
    >
      {/* Fixed abyss background that doesn't move with camera */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-800 z-0" />
      <div className="fixed inset-0 bg-black opacity-80 z-0" />
      
      {/* Game world container that moves with camera */}
      <div 
        className="absolute inset-0"
        style={{ 
          transform: `translateY(${-cameraY}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
      
        {/* Subtle current effects */}
        <div className="absolute inset-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-gradient-to-r from-transparent via-blue-900 to-transparent opacity-5 animate-pulse"
              style={{
                left: `${10 + i * 30}%`,
                top: `${cameraY - 100}px`,
                width: '200px',
                height: '120%',
                transform: `rotate(${5 + i * 3}deg)`,
                animationDelay: `${i * 1}s`,
                animationDuration: '6s'
              }}
            />
          ))}
        </div>

        {/* Marine snow particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute bg-gray-300 rounded-full"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity
            }}
          />
        ))}

        {/* Anglerfish */}
        <div
          className="absolute z-10 transition-all duration-75 ease-out"
          style={{
            left: `${anglerfishPos.x}px`,
            top: `${anglerfishPos.y}px`,
            transform: `rotate(${keys.has('arrowleft') || keys.has('a') ? '-5deg' : keys.has('arrowright') || keys.has('d') ? '5deg' : '0deg'})`
          }}
        >
          {/* Anglerfish SVG with glow effects */}
          <div className="relative">
            {/* Lure glow effect - positioned around where the lure would be on the SVG */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${40 - lightRadius}px`, // Adjusted for SVG lure position
                top: `${10 - lightRadius}px`, // Adjusted for SVG lure position
                width: `${lightRadius * 2}px`,
                height: `${lightRadius * 2}px`,
                background: lightBonusActive 
                  ? `radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(255, 215, 0, 0.4) 30%, rgba(34, 211, 238, 0.3) 60%, transparent 100%)`
                  : `radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, rgba(34, 211, 238, 0.3) 30%, rgba(34, 211, 238, 0.2) 60%, transparent 100%)`,
                borderRadius: '50%',
                filter: 'blur(2px)',
                animation: lightBonusActive ? 'pulse 1s ease-in-out infinite' : 'pulse 2s ease-in-out infinite'
              }}
            />
            
            {/* Secondary glow layer for more depth */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${40 - lightRadius * 0.6}px`,
                top: `${10 - lightRadius * 0.6}px`,
                width: `${lightRadius * 1.2}px`,
                height: `${lightRadius * 1.2}px`,
                background: lightBonusActive
                  ? `radial-gradient(circle, rgba(255, 255, 0, 0.5) 0%, rgba(255, 215, 0, 0.2) 50%, transparent 70%)`
                  : `radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, rgba(0, 255, 255, 0.1) 50%, transparent 70%)`,
                borderRadius: '50%',
                filter: 'blur(4px)',
                animation: lightBonusActive ? 'pulse 1.5s ease-in-out infinite reverse' : 'pulse 3s ease-in-out infinite reverse'
              }}
            />
            
            {/* Anglerfish SVG */}
            <img 
              src="/anglerfish.svg" 
              alt="Anglerfish" 
              className="w-20 h-16 drop-shadow-lg"
              style={{
                filter: lightBonusActive 
                  ? 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))' 
                  : 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.3))'
              }}
            />
          </div>
        </div>

        {/* Bioluminescent waves */}
        {sonarWaves.map(wave => (
          <div
            key={wave.id}
            className="absolute border-2 rounded-full pointer-events-none"
            style={{
              left: `${wave.x - wave.radius}px`,
              top: `${wave.y - wave.radius}px`,
              width: `${wave.radius * 2}px`,
              height: `${wave.radius * 2}px`,
              opacity: wave.opacity,
              borderColor: `rgba(34, 211, 238, ${wave.opacity})`,
              boxShadow: `0 0 ${wave.radius / 4}px rgba(34, 211, 238, ${wave.opacity * 0.5})`
            }}
          />
        ))}

        {/* Prey creatures */}
        {prey.map(preyItem => (
          !preyItem.collected && preyItem.visible && (
            <div
              key={preyItem.id}
              className="absolute z-5 transition-opacity duration-300"
              style={{
                left: `${preyItem.x}px`,
                top: `${preyItem.y}px`,
                transform: `scale(${0.8 + Math.sin(Date.now() * 0.003 + preyItem.id) * 0.2})`,
                opacity: preyItem.visibilityTimer > 1000 ? 1 : preyItem.visibilityTimer / 1000
              }}
            >
              {preyItem.type === 'large' && (
                <div className="relative">
                  <img 
                    src={`/${preyItem.fishSvg}.svg`} 
                    alt="Large Fish" 
                    className="w-8 h-8 drop-shadow-lg animate-pulse"
                    style={{
                      filter: 'hue-rotate(0deg) saturate(1.5) brightness(1.2) drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))'
                    }}
                  />
                  <div className="absolute top-1 left-1 w-2 h-2 bg-red-300 rounded-full animate-ping" />
                </div>
              )}
              {preyItem.type === 'medium' && (
                <img 
                  src={`/${preyItem.fishSvg}.svg`} 
                  alt="Medium Fish" 
                  className="w-6 h-6 drop-shadow-md animate-bounce"
                  style={{ 
                    animationDuration: '2s',
                    filter: 'hue-rotate(30deg) saturate(1.3) brightness(1.1) drop-shadow(0 0 3px rgba(251, 146, 60, 0.5))'
                  }}
                />
              )}
              {preyItem.type === 'small' && (
                <img 
                  src={`/${preyItem.fishSvg}.svg`} 
                  alt="Small Fish" 
                  className="w-4 h-4 animate-pulse opacity-80"
                  style={{
                    filter: 'hue-rotate(120deg) saturate(1.2) brightness(1.0) drop-shadow(0 0 2px rgba(74, 222, 128, 0.4))'
                  }}
                />
              )}
            </div>
          )
        ))}

        {/* Light Bonus Items */}
        {lightBonuses.map(bonus => (
          !bonus.collected && (
            <div
              key={bonus.id}
              className="absolute z-5"
              style={{
                left: `${bonus.x}px`,
                top: `${bonus.y}px`,
                transform: `scale(${1 + Math.sin(bonus.pulsePhase) * 0.3})`
              }}
            >
              {/* Bonus glow effect */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '-15px',
                  top: '-15px',
                  width: '30px',
                  height: '30px',
                  background: `radial-gradient(circle, rgba(255, 215, 0, ${0.4 + Math.sin(bonus.pulsePhase) * 0.3}) 0%, rgba(255, 215, 0, ${0.2 + Math.sin(bonus.pulsePhase) * 0.2}) 50%, transparent 70%)`,
                  borderRadius: '50%',
                  filter: 'blur(2px)'
                }}
              />
              
              {/* Light bonus icon */}
              <div className="relative">
                <Zap className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
                <div 
                  className="absolute -top-1 -left-1 w-7 h-7 border border-yellow-300 rounded-full opacity-60"
                  style={{
                    opacity: 0.4 + Math.sin(bonus.pulsePhase) * 0.4,
                    boxShadow: `0 0 ${6 + Math.sin(bonus.pulsePhase) * 3}px rgba(255, 215, 0, 0.8)`
                  }}
                />
              </div>
            </div>
          )
        ))}

        {/* Mines */}
        {mines.map(mine => (
          !mine.exploded && (
            <div
              key={mine.id}
              className="absolute z-5"
              style={{
                left: `${mine.x}px`,
                top: `${mine.y}px`,
                transform: `scale(${1 + Math.sin(mine.pulsePhase) * 0.1})`
              }}
            >
              {/* Mine danger glow */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '-20px',
                  top: '-20px',
                  width: '40px',
                  height: '40px',
                  background: `radial-gradient(circle, rgba(239, 68, 68, ${0.3 + Math.sin(mine.pulsePhase) * 0.2}) 0%, rgba(239, 68, 68, ${0.1 + Math.sin(mine.pulsePhase) * 0.1}) 50%, transparent 70%)`,
                  borderRadius: '50%',
                  filter: 'blur(2px)'
                }}
              />
              
              {/* Mine body */}
              <div className="relative">
                <Bomb className="w-6 h-6 text-red-500 drop-shadow-lg" />
                <div 
                  className="absolute -top-1 -left-1 w-8 h-8 border border-red-400 rounded-full opacity-60"
                  style={{
                    opacity: 0.3 + Math.sin(mine.pulsePhase) * 0.3,
                    boxShadow: `0 0 ${8 + Math.sin(mine.pulsePhase) * 4}px rgba(239, 68, 68, 0.6)`
                  }}
                />
              </div>
            </div>
          )
        ))}

        {/* Abyss ambiance */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent opacity-60" />
      </div>

      {/* Fixed UI elements that don't move with camera */}
      <div className="fixed top-4 left-4 z-20 space-y-2">
        {/* Hunger Bar */}
        <div className="bg-black bg-opacity-70 px-4 py-3 rounded-lg border border-red-600">
          <div className="text-sm text-red-300 mb-1">HUNGER</div>
          <div className="w-48 h-4 bg-gray-800 rounded-full border border-red-500">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${hunger}%`,
                background: hunger > 60 
                  ? 'linear-gradient(90deg, #10b981, #34d399)' 
                  : hunger > 30 
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' 
                  : 'linear-gradient(90deg, #ef4444, #f87171)',
                boxShadow: hunger > 60 
                  ? '0 0 8px rgba(16, 185, 129, 0.6)' 
                  : hunger > 30 
                  ? '0 0 8px rgba(245, 158, 11, 0.6)' 
                  : '0 0 8px rgba(239, 68, 68, 0.6)'
              }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">{Math.floor(hunger)}%</div>
        </div>
        
        {/* Depth and Stats */}
        <div className="bg-black bg-opacity-70 text-cyan-400 px-4 py-2 rounded-lg border border-cyan-600">
          <div className="text-sm text-gray-400">Depth: {Math.floor(depth)}m</div>
          <div className="text-sm text-yellow-400">Max: {Math.floor(maxDepthReached)}m</div>
          <div className="text-xs text-cyan-300">Light: {Math.floor(lightRadius)}px</div>
          {lightBonusActive && (
            <div className="text-xs text-yellow-300 animate-pulse">
              ⚡ Boost: {Math.ceil(lightBonusTimer / 1000)}s
            </div>
          )}
          <div className="text-xs text-gray-400">
            Time: {Math.floor(survivalTime / 60000)}:{String(Math.floor((survivalTime % 60000) / 1000)).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed top-4 right-4 z-20">
        <div className="bg-black bg-opacity-70 text-cyan-300 px-4 py-2 rounded-lg text-sm border border-cyan-600">
          <div>WASD/Arrows: Swim</div>
          <div>SPACE: Bioluminescence</div>
          <div className="text-cyan-300">Touch: Use joystick</div>
          <div className="text-green-400">🐟 Eat fish: Restore hunger</div>
          <div className="text-yellow-400">⚡ Light boost: +8s vision</div>
          <div className="text-red-400">💣 Mines: Drain hunger (-30)</div>
          <div className="text-orange-400">⚠️ Deeper = Faster hunger loss</div>
          <div className="text-cyan-400">🎯 Score = Maximum depth</div>
        </div>
      </div>

      {/* Virtual Joystick */}
      <div className="fixed bottom-4 left-4 z-30">
        <div
          className="relative w-20 h-20 bg-gray-800 bg-opacity-60 border-2 border-cyan-400 rounded-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{
            touchAction: 'none',
            userSelect: 'none'
          }}
        >
          {/* Joystick base */}
          <div className="absolute inset-2 bg-gray-700 bg-opacity-40 rounded-full border border-cyan-500" />
          
          {/* Joystick knob */}
          <div
            className="absolute w-6 h-6 bg-cyan-400 rounded-full border-2 border-cyan-300 transition-all duration-75 ease-out"
            style={{
              left: `${joystick.knobX - joystick.centerX + 40 - 12}px`,
              top: `${joystick.knobY - joystick.centerY + 40 - 12}px`,
              boxShadow: joystick.active 
                ? '0 0 12px rgba(34, 211, 238, 0.8)' 
                : '0 0 6px rgba(34, 211, 238, 0.4)',
              transform: joystick.active ? 'scale(1.1)' : 'scale(1)'
            }}
          />
          
          {/* Direction indicators */}
          {joystick.active && (
            <>
              <div className="absolute inset-0 border border-cyan-300 rounded-full animate-ping opacity-30" />
              <div 
                className="absolute w-1 h-8 bg-cyan-400 opacity-60"
                style={{
                  left: '39px',
                  top: '6px',
                  transformOrigin: 'bottom center',
                  transform: `rotate(${Math.atan2(joystick.deltaY, joystick.deltaX) * 180 / Math.PI + 90}deg)`
                }}
              />
            </>
          )}
        </div>
        
        {/* Joystick label */}
        <div className="text-xs text-cyan-300 text-center mt-1 opacity-70">
          Move
        </div>
      </div>
    </div>
  );
}

export default App;