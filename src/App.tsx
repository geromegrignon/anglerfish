import React, { useRef } from 'react';
import { LandingScreen } from './components/LandingScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { GameUI } from './components/GameUI';
import { VirtualJoystick } from './components/VirtualJoystick';
import { GameEntities } from './components/GameEntities';
import { useGameLogic } from './hooks/useGameLogic';
import { useJoystick } from './hooks/useJoystick';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameInitialization } from './hooks/useGameInitialization';
import { useGameLoop } from './hooks/useGameLoop';

function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const {
    // State
    anglerfishPos,
    hunger,
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
    
    // Setters
    setAnglerfishPos,
    setHunger,
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
    
    // Actions
    startGame
  } = useGameLogic();

  // Initialize game entities
  useGameInitialization({
    setPrey,
    setMines,
    setNetTraps,
    setLightBonuses,
    setParticles
  });

  // Setup keyboard controls
  useKeyboard({ setKeys });

  // Setup joystick controls
  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleEcholocationPress
  } = useJoystick({ 
    joystick, 
    setJoystick, 
    onEcholocation: () => setTriggerEcholocation(true) 
  });

  // Main game loop
  useGameLoop({
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
    setTriggerEcholocation,
    setSurvivalTime,
    setLightBonusTimer,
    setLightBonusActive,
    setLightRadius,
    setSlowdownTimer,
    setSlowedDown,
    setHunger,
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
  });

  // Game Over Screen
  if (gameOver) {
    return (
      <GameOverScreen
        maxDepthReached={maxDepthReached}
        survivalTime={survivalTime}
        onRestart={startGame}
      />
    );
  }

  // Landing Screen
  if (!gameStarted) {
    return <LandingScreen onStartGame={startGame} />;
  }

  // Game Screen
  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-screen bg-black overflow-hidden"
      style={{
        touchAction: 'none',
        // Force hardware acceleration
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform'
      }}
    >
      <GameEntities
        particles={particles}
        sonarWaves={sonarWaves}
        anglerfishPos={anglerfishPos}
        lightRadius={lightRadius}
        lightBonusActive={lightBonusActive}
        prey={prey}
        lightBonuses={lightBonuses}
        netTraps={netTraps}
        mines={mines}
        cameraY={cameraY}
      />

      {/* Anglerfish */}
      <img
        src="/anglerfish.svg"
        alt="anglerfish"
        className="absolute z-10 pointer-events-none will-change-transform"
        style={{
          left: `${anglerfishPos.x}px`,
          top: `${anglerfishPos.y - cameraY}px`,
          width: '80px',
          height: '60px',
          filter: slowedDown 
            ? 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8)) brightness(0.7)' 
            : 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.6))',
          transform: 'translate3d(0, 0, 0)'
        }}
      />

      <GameUI
        hunger={hunger}
        depth={depth}
        lightBonusActive={lightBonusActive}
        lightBonusTimer={lightBonusTimer}
        slowedDown={slowedDown}
        slowdownTimer={slowdownTimer}
      />

      <VirtualJoystick
        joystick={joystick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onEcholocationPress={handleEcholocationPress}
      />
    </div>
  );
}

export default App;