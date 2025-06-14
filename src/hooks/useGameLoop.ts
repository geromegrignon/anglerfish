import { useEffect, useRef, useCallback } from "react";
import {
  Position,
  JoystickState,
  SonarWave,
  GameModeConfig,
  DeathCause,
} from "../types/game";

// Mobile detection
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;

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
  electricFieldActive: boolean;
  slowedDown: boolean;
  triggerEcholocation: boolean;
  hitPoints: number;
  gameModeConfig: GameModeConfig;
  fishEaten: number;
  setDeathCause: React.Dispatch<React.SetStateAction<DeathCause>>;
  setTriggerEcholocation: React.Dispatch<React.SetStateAction<boolean>>;
  setSurvivalTime: React.Dispatch<React.SetStateAction<number>>;
  setLightBonusTimer: React.Dispatch<React.SetStateAction<number>>;
  setLightBonusActive: React.Dispatch<React.SetStateAction<boolean>>;
  setLightRadius: React.Dispatch<React.SetStateAction<number>>;
  setElectricFieldTimer: React.Dispatch<React.SetStateAction<number>>;
  setElectricFieldActive: React.Dispatch<React.SetStateAction<boolean>>;
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
  setElectricBonuses: React.Dispatch<React.SetStateAction<any[]>>;
  setMines: React.Dispatch<React.SetStateAction<any[]>>;
  setNetTraps: React.Dispatch<React.SetStateAction<any[]>>;
  setFishEaten: React.Dispatch<React.SetStateAction<number>>;
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
    electricFieldActive,
    slowedDown,
    triggerEcholocation,
    hitPoints,
    gameModeConfig,
    fishEaten,
    setDeathCause,
    setTriggerEcholocation,
    setSurvivalTime,
    setLightBonusTimer,
    setLightBonusActive,
    setLightRadius,
    setElectricFieldTimer,
    setElectricFieldActive,
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
    setElectricBonuses,
    setMines,
    setNetTraps,
    setFishEaten,
  } = props;

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const performanceRef = useRef({ frameTime: 16, skipFrames: false });

  // Optimized game loop with frame skipping for mobile
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!gameStarted || gameOver) return;

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Performance monitoring and adaptive frame skipping
      performanceRef.current.frameTime = deltaTime;
      performanceRef.current.skipFrames = deltaTime > (isMobile ? 25 : 20); // More aggressive on mobile

      // Skip frames if running too slow
      if (performanceRef.current.skipFrames) {
        frameCountRef.current = 0;
      }

      frameCountRef.current++;

      // Adaptive update frequency based on device capability
      const updateFrequency = isMobile ? 3 : 2; // Update expensive operations less frequently on mobile
      const shouldUpdateExpensive =
        frameCountRef.current % updateFrequency === 0;
      const shouldUpdateParticles =
        frameCountRef.current % (isMobile ? 4 : 2) === 0; // Even less frequent particle updates on mobile

      // Update survival time
      setSurvivalTime((prev) => prev + 16);

      // Decrease hunger over time - ALWAYS happens regardless of movement or input
      const hungerDecayRate = 0.025; // Consistent 0.025% per frame (roughly 1.5% per second at 60fps)
      setHunger((prev) => {
        const newHunger = Math.max(0, prev - hungerDecayRate);
        if (newHunger <= 0) {
          setDeathCause("starvation");
          setGameOver(true);
        }
        return newHunger;
      });

      // Update light bonus timer
      if (lightBonusActive) {
        setLightBonusTimer((prev) => {
          const newTimer = prev - 16;
          if (newTimer <= 0) {
            setLightBonusActive(false);
            setLightRadius(20); // Reset to smaller default radius
            return 0;
          }
          return newTimer;
        });
      }

      // Update electric field timer
      if (electricFieldActive) {
        setElectricFieldTimer((prev) => {
          const newTimer = prev - 16;
          if (newTimer <= 0) {
            setElectricFieldActive(false);
            return 0;
          }
          return newTimer;
        });
      }

      // Update slowdown timer
      if (slowedDown) {
        setSlowdownTimer((prev) => {
          const newTimer = prev - 16;
          if (newTimer <= 0) {
            setSlowedDown(false);
            return 0;
          }
          return newTimer;
        });
      }

      // Move anglerfish based on keys
      setAnglerfishPos((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        const speedMultiplier = slowedDown ? 0.3 : 1;

        // Horizontal movement (always allowed)
        if (keys.has("arrowleft")) newX -= 2 * speedMultiplier;
        if (keys.has("arrowright")) newX += 2 * speedMultiplier;

        // Auto-scroll (always active in speed run mode)
        newY += gameModeConfig.scrollSpeed / 2;

        // Boundaries
        newX = Math.max(0, Math.min(window.innerWidth - 80, newX));

        return { x: newX, y: newY };
      });

      // Update camera to follow anglerfish vertically
      setCameraY(anglerfishPos.y - window.innerHeight / 2);

      // Update depth based on anglerfish position
      const currentDepth = 2000 + Math.max(0, anglerfishPos.y - 300);
      setDepth(currentDepth);
      setMaxDepthReached((prev) => Math.max(prev, currentDepth));

      // Update particles - much less frequently on mobile
      if (shouldUpdateParticles) {
        setParticles((prev) => {
          const viewportTop = cameraY - 200;
          const viewportBottom = cameraY + window.innerHeight + 200;

          return prev
            .map((particle) => {
              const newParticle = { ...particle };

              if (particle.type === "snow") {
                // Marine snow movement
                newParticle.y = particle.y + particle.speed / 2;
                newParticle.x =
                  particle.x +
                  Math.sin(Date.now() * 0.0005 + particle.id) * 0.15;
              } else if (particle.type === "plankton") {
                // Plankton movement - more organic, slower
                newParticle.y = particle.y + particle.speed * 0.35;
                newParticle.x =
                  particle.x +
                  Math.sin(Date.now() * 0.0004 + particle.id) * 0.4;
                // Update pulse phase for bioluminescence
                newParticle.pulsePhase = (particle.pulsePhase || 0) + 0.025;
              }

              return newParticle;
            })
            .filter(
              (particle) =>
                particle.y >= viewportTop && particle.y <= viewportBottom
            );
        });

        // Add new particles
        setParticles((prev) => {
          const newParticles = [];
          const maxSnowParticles = isMobile ? 15 : 25;
          const maxPlanktonParticles = isMobile ? 30 : 50;

          // Add marine snow
          const snowSpawnRate = isMobile ? 0.04 : 0.08;
          if (
            Math.random() < snowSpawnRate &&
            prev.filter((p) => p.type === "snow").length < maxSnowParticles
          ) {
            newParticles.push({
              id: Date.now() + Math.random(),
              x: Math.random() * window.innerWidth,
              y: cameraY - 100,
              speed: Math.random() * 1 + 0.5,
              size: Math.random() * 3 + 1,
              opacity: Math.random() * 0.6 + 0.2,
              type: "snow" as const,
            });
          }

          // Add bioluminescent plankton
          const planktonSpawnRate = isMobile ? 0.06 : 0.12;
          if (
            Math.random() < planktonSpawnRate &&
            prev.filter((p) => p.type === "plankton").length <
              maxPlanktonParticles
          ) {
            const colors = [
              "#00FFFF",
              "#00CED1",
              "#40E0D0",
              "#48D1CC",
              "#20B2AA",
              "#87CEEB",
              "#7FFFD4",
            ];
            newParticles.push({
              id: Date.now() + Math.random() + 1000,
              x: Math.random() * window.innerWidth,
              y: cameraY - 200 + Math.random() * 300, // Spawn in a larger area around camera
              speed: Math.random() * 0.8 + 0.3,
              size: Math.random() * 2 + 1,
              opacity: Math.random() * 0.4 + 0.3,
              type: "plankton" as const,
              pulsePhase: Math.random() * Math.PI * 2,
              color: colors[Math.floor(Math.random() * colors.length)],
            });
          }

          // Also spawn plankton below the camera view
          if (
            Math.random() < planktonSpawnRate * 0.7 &&
            prev.filter((p) => p.type === "plankton").length <
              maxPlanktonParticles
          ) {
            const colors = [
              "#00FFFF",
              "#00CED1",
              "#40E0D0",
              "#48D1CC",
              "#20B2AA",
              "#87CEEB",
              "#7FFFD4",
            ];
            newParticles.push({
              id: Date.now() + Math.random() + 2000,
              x: Math.random() * window.innerWidth,
              y: cameraY + window.innerHeight + Math.random() * 100, // Spawn below viewport
              speed: Math.random() * 0.8 + 0.3,
              size: Math.random() * 2 + 1,
              opacity: Math.random() * 0.4 + 0.3,
              type: "plankton" as const,
              pulsePhase: Math.random() * Math.PI * 2,
              color: colors[Math.floor(Math.random() * colors.length)],
            });
          }

          return newParticles.length > 0 ? [...prev, ...newParticles] : prev;
        });
      }

      // Update bioluminescent waves - simplified calculation
      setSonarWaves((prev) =>
        prev
          .map((wave) => ({
            ...wave,
            radius: wave.radius + 3,
            opacity: Math.max(0, wave.opacity - (isMobile ? 0.015 : 0.0125)), // Fade faster on mobile
          }))
          .filter((wave) => wave.opacity > 0)
      );

      // Update prey visibility - optimized for mobile
      setPrey((prev) =>
        prev.map((preyItem) => {
          if (preyItem.collected) return preyItem;

          let newVisible = preyItem.visible;
          let newTimer = Math.max(0, preyItem.visibilityTimer - 16);

          // Only check visibility for prey near the viewport (performance optimization)
          if (Math.abs(preyItem.y - anglerfishPos.y) < 400) {
            const lureX = anglerfishPos.x + 40;
            const lureY = anglerfishPos.y + 10;
            const glowDistance = Math.sqrt(
              Math.pow(lureX - preyItem.x, 2) + Math.pow(lureY - preyItem.y, 2)
            );

            if (glowDistance <= lightRadius) {
              newVisible = true;
              newTimer = Math.max(newTimer, 2000);
            }

            // Check if any bioluminescent wave reveals this prey (limit to nearby waves)
            sonarWaves.slice(0, isMobile ? 3 : 5).forEach((wave) => {
              const distance = Math.sqrt(
                Math.pow(wave.x - preyItem.x, 2) +
                  Math.pow(wave.y - preyItem.y, 2)
              );
              if (distance <= wave.radius && distance >= wave.radius - 15) {
                newVisible = true;
                newTimer = 4000;
              }
            });
          }

          if (newTimer <= 0) {
            newVisible = false;
          }

          return {
            ...preyItem,
            visible: newVisible,
            visibilityTimer: newTimer,
          };
        })
      );

      // Spawn new entities less frequently
      if (shouldUpdateExpensive) {
        // Mobile detection and margin calculation
        const isMobileDevice = window.innerWidth < 768;
        const horizontalMargin = isMobileDevice ? 100 : 60; // Larger margin on mobile

        // Spawn new prey as we go deeper
        setPrey((prev) => {
          const deepestPrey = Math.max(...prev.map((p) => p.y));
          const screenWidth = window.innerWidth;
          const spawnWidth = screenWidth - horizontalMargin * 2; // Dynamic margin
          const maxPrey = isMobile ? 150 : 300;
          const spawnCount = isMobile ? 8 : 15;
          if (anglerfishPos.y > deepestPrey - 500 && prev.length < maxPrey) {
            const types = [
              "small",
              "small",
              "small",
              "medium",
              "medium",
              "large",
            ];
            const fishSvgs = ["fish-1", "fish-2"];
            const newPreyItems = [];
            for (let i = 0; i < spawnCount; i++) {
              newPreyItems.push({
                id: Date.now() + i,
                x: Math.random() * spawnWidth + horizontalMargin,
                y: deepestPrey + Math.random() * 500 + 200,
                collected: false,
                visible: false,
                visibilityTimer: 0,
                type: types[Math.floor(Math.random() * types.length)],
                fishSvg: fishSvgs[Math.floor(Math.random() * fishSvgs.length)],
              });
            }
            return [...prev, ...newPreyItems];
          }
          return prev;
        });

        // Spawn new light bonuses as we go deeper
        setLightBonuses((prev) => {
          const deepestBonus = Math.max(...prev.map((b) => b.y));
          const screenWidth = window.innerWidth;
          const spawnWidth = screenWidth - horizontalMargin * 2; // Dynamic margin
          const maxBonuses = isMobile ? 8 : 15;
          if (
            anglerfishPos.y > deepestBonus - 200 &&
            prev.length < maxBonuses
          ) {
            const newBonuses = [];
            if (Math.random() < (isMobile ? 0.2 : 0.3)) {
              newBonuses.push({
                id: Date.now() + 2000,
                x: Math.random() * spawnWidth + horizontalMargin,
                y: deepestBonus + 800 + Math.random() * 400,
                collected: false,
                pulsePhase: Math.random() * Math.PI * 2,
              });
            }
            return [...prev, ...newBonuses];
          }
          return prev;
        });

        // Spawn new electric bonuses as we go deeper
        setElectricBonuses((prev) => {
          const deepestBonus = Math.max(...prev.map((b) => b.y));
          const screenWidth = window.innerWidth;
          const spawnWidth = screenWidth - horizontalMargin * 2; // Dynamic margin
          const maxElectricBonuses = isMobile ? 4 : 8;
          if (
            anglerfishPos.y > deepestBonus - 400 &&
            prev.length < maxElectricBonuses
          ) {
            const newBonuses = [];
            if (Math.random() < (isMobile ? 0.1 : 0.15)) {
              newBonuses.push({
                id: Date.now() + 4000,
                x: Math.random() * spawnWidth + horizontalMargin,
                y: deepestBonus + 1200 + Math.random() * 600,
                collected: false,
                pulsePhase: Math.random() * Math.PI * 2,
              });
            }
            return [...prev, ...newBonuses];
          }
          return prev;
        });

        // Spawn new mines as we go deeper
        setMines((prev) => {
          const deepestMine = Math.max(...prev.map((m) => m.y));
          const screenWidth = window.innerWidth;
          const spawnWidth = screenWidth - horizontalMargin * 2; // Dynamic margin
          const maxMines = isMobile ? 12 : 80;
          const spawnCount = isMobile ? 2 : 6;
          if (anglerfishPos.y > deepestMine - 800 && prev.length < maxMines) {
            const newMines = [];
            for (let i = 0; i < spawnCount; i++) {
              newMines.push({
                id: Date.now() + i + 1000,
                x: Math.random() * spawnWidth + horizontalMargin,
                y: deepestMine + Math.random() * 600 + 300,
                exploded: false,
                pulsePhase: Math.random() * Math.PI * 2,
                velocityX: 0,
                velocityY: 0,
                targetX: 0,
                targetY: 0,
                changeDirectionTimer: Math.random() * 300 + 100,
              });
            }
            return [...prev, ...newMines];
          }
          return prev;
        });

        // Spawn new net traps as we go deeper
        setNetTraps((prev) => {
          const deepestTrap = Math.max(...prev.map((t) => t.y));
          const screenWidth = window.innerWidth;
          const spawnWidth = screenWidth - horizontalMargin * 2; // Dynamic margin
          const maxTraps = isMobile ? 25 : 50;
          const spawnCount = isMobile ? 2 : 4;
          if (anglerfishPos.y > deepestTrap - 600 && prev.length < maxTraps) {
            const newTraps = [];
            for (let i = 0; i < spawnCount; i++) {
              newTraps.push({
                id: Date.now() + i + 3000,
                x: Math.random() * spawnWidth + horizontalMargin,
                y: deepestTrap + Math.random() * 800 + 400,
                triggered: false,
                pulsePhase: Math.random() * Math.PI * 2,
              });
            }
            return [...prev, ...newTraps];
          }
          return prev;
        });
      }

      // Update pulse phases (every frame for smooth animation)
      // Update pulse phases less frequently on mobile
      if (!isMobile || frameCountRef.current % 2 === 0) {
        setLightBonuses((prev) =>
          prev.map((bonus) => ({
            ...bonus,
            pulsePhase: bonus.pulsePhase + (isMobile ? 0.03 : 0.04),
          }))
        );

        setElectricBonuses((prev) =>
          prev.map((bonus) => ({
            ...bonus,
            pulsePhase: bonus.pulsePhase + (isMobile ? 0.04 : 0.06),
          }))
        );

        setNetTraps((prev) =>
          prev.map((trap) => ({
            ...trap,
            pulsePhase: trap.pulsePhase + (isMobile ? 0.01 : 0.015),
          }))
        );
      }

      // Update mine pulse phases and movement
      setMines((prev) =>
        prev.map((mine) => {
          const newMine = { ...mine };

          newMine.pulsePhase = mine.pulsePhase + (isMobile ? 0.02 : 0.025);

          if (depth > 3000 && !mine.exploded) {
            newMine.changeDirectionTimer = mine.changeDirectionTimer - 16;

            if (newMine.changeDirectionTimer <= 0) {
              const angle = Math.random() * Math.PI * 2;
              const speed = (Math.random() * 0.3 + 0.1) / 2;
              newMine.velocityX = Math.cos(angle) * speed;
              newMine.velocityY = Math.sin(angle) * speed;
              newMine.changeDirectionTimer = Math.random() * 400 + 200;
            }

            newMine.x += newMine.velocityX / 2;
            newMine.y += newMine.velocityY / 2;

            if (newMine.x < 100 || newMine.x > window.innerWidth - 100) {
              newMine.velocityX *= -1;
            }
            if (
              newMine.y < anglerfishPos.y - 500 ||
              newMine.y > anglerfishPos.y + 1000
            ) {
              newMine.velocityY *= -1;
            }

            newMine.x = Math.max(
              60,
              Math.min(window.innerWidth - 60, newMine.x)
            );
            newMine.y = Math.max(500, newMine.y);
          }

          return newMine;
        })
      );

      // Also update mine boundaries to respect mobile margins
      setMines((prev) =>
        prev.map((mine) => {
          const isMobileDevice = window.innerWidth < 768;
          const horizontalMargin = isMobileDevice ? 100 : 60;

          // Clamp mine positions to respect margins
          const clampedX = Math.max(
            horizontalMargin,
            Math.min(window.innerWidth - horizontalMargin, mine.x)
          );

          return mine.x !== clampedX ? { ...mine, x: clampedX } : mine;
        })
      );
      // Check collisions with prey
      // Optimize collision detection - only check nearby prey
      setPrey((prev) =>
        prev.map((preyItem) => {
          if (
            !preyItem.collected &&
            preyItem.visible && // Only check collision if prey is visible
            Math.abs(preyItem.y - anglerfishPos.y) < 100
          ) {
            // Use squared distance to avoid expensive sqrt calculation
            const distanceSquared =
              Math.pow(anglerfishPos.x + 40 - preyItem.x, 2) +
              Math.pow(anglerfishPos.y + 25 - preyItem.y, 2);
            if (distanceSquared < 1225) {
              // 35^2 = 1225
              setHunger((h) => Math.min(100, h + 5));
              setFishEaten((count) => count + 1);
              return { ...preyItem, collected: true };
            }
          }
          return preyItem;
        })
      );

      // Check collisions with light bonuses
      setLightBonuses((prev) =>
        prev.map((bonus) => {
          if (!bonus.collected) {
            const distanceSquared =
              Math.pow(anglerfishPos.x + 40 - bonus.x, 2) +
              Math.pow(anglerfishPos.y + 25 - bonus.y, 2);
            if (distanceSquared < 900) {
              // 30^2 = 900
              setLightBonusActive(true);
              setLightBonusTimer(8000);
              setLightRadius(300); // Increased from 200 to 300
              return { ...bonus, collected: true };
            }
          }
          return bonus;
        })
      );

      // Check collisions with electric bonuses
      setElectricBonuses((prev) =>
        prev.map((bonus) => {
          if (!bonus.collected) {
            const distanceSquared =
              Math.pow(anglerfishPos.x + 40 - bonus.x, 2) +
              Math.pow(anglerfishPos.y + 25 - bonus.y, 2);
            if (distanceSquared < 900) {
              // 30^2 = 900
              setElectricFieldActive(true);
              setElectricFieldTimer(6000);
              return { ...bonus, collected: true };
            }
          }
          return bonus;
        })
      );

      // Check collisions with net traps
      setNetTraps((prev) =>
        prev.map((trap) => {
          if (!trap.triggered) {
            const distanceSquared =
              Math.pow(anglerfishPos.x + 40 - trap.x, 2) +
              Math.pow(anglerfishPos.y + 25 - trap.y, 2);
            if (distanceSquared < 1600) {
              // 40^2 = 1600
              setSlowedDown(true);
              setSlowdownTimer(4000);
              return { ...trap, triggered: true };
            }
          }
          return trap;
        })
      );

      // Check collisions with mines
      setMines((prev) =>
        prev.map((mine) => {
          if (!mine.exploded) {
            const distanceSquared =
              Math.pow(anglerfishPos.x + 40 - mine.x, 2) +
              Math.pow(anglerfishPos.y + 25 - mine.y, 2);
            if (distanceSquared < 2025) {
              // 45^2 = 2025
              setHitPoints((hp) => {
                const newHp = Math.max(0, hp - 1);
                if (newHp <= 0) {
                  setDeathCause("mines");
                  setGameOver(true);
                }
                return newHp;
              });
              return { ...mine, exploded: true };
            }
          }
          return mine;
        })
      );

      // Electric field destroys mines within range
      if (electricFieldActive) {
        setMines((prev) =>
          prev.map((mine) => {
            if (!mine.exploded) {
              const distanceSquared =
                Math.pow(anglerfishPos.x + 40 - mine.x, 2) +
                Math.pow(anglerfishPos.y + 30 - mine.y, 2);
              if (distanceSquared < 14400) {
                // 120^2 = 14400
                return { ...mine, exploded: true };
              }
            }
            return mine;
          })
        );
      }

      // Trigger bioluminescence (keyboard spacebar or mobile button)
      // Only allow echolocation if no sonar waves are currently active
      if ((keys.has(" ") || triggerEcholocation) && sonarWaves.length === 0) {
        const lureX = anglerfishPos.x + 40;
        const lureY = anglerfishPos.y + 10;
        const newWave: SonarWave = {
          id: Date.now(),
          x: lureX,
          y: lureY,
          radius: 0,
          opacity: 1,
        };
        setSonarWaves((prev) => [...prev, newWave]);

        // Reset trigger for mobile button
        if (triggerEcholocation) {
          setTriggerEcholocation(false);
        }
      }
    },
    [
      keys,
      anglerfishPos,
      gameStarted,
      gameOver,
      cameraY,
      lightRadius,
      hitPoints,
      sonarWaves,
      joystick,
      depth,
      lightBonusActive,
      electricFieldActive,
      slowedDown,
      triggerEcholocation,
      gameModeConfig,
      fishEaten,
      setDeathCause,
      setTriggerEcholocation,
      setSurvivalTime,
      setLightBonusTimer,
      setLightBonusActive,
      setLightRadius,
      setElectricFieldTimer,
      setElectricFieldActive,
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
      setElectricBonuses,
      setMines,
      setNetTraps,
      setFishEaten,
    ]
  );

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
