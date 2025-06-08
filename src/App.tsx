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
    lastMilestoneDepth,
    
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
    setDepthMilestones,
    setLastMilestoneDepth,
    depthMilestones,
    
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
    hitPoints,
    gameModeConfig,
    depthMilestones,
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
    setNetTraps,
    setDepthMilestones,
    setLastMilestoneDepth
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
      className="relative w-full h-screen overflow-hidden"
      style={{
        touchAction: 'none',
        background: 'rgb(3, 7, 18)', // Very dark blue, almost black
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
        hitPoints={hitPoints}
        gameMode={gameMode}
        depth={depth}
        lightBonusActive={lightBonusActive}
        lightBonusTimer={lightBonusTimer}
        slowedDown={slowedDown}
        slowdownTimer={slowdownTimer}
      />

      <VirtualJoystick
        gameMode={gameMode}
        joystick={joystick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onEcholocationPress={handleEcholocationPress}
      />

      {/* Depth Milestone Animations */}
      {depthMilestones.map(milestone => (
        <div
          key={milestone.id}
          className="fixed inset-0 flex items-center justify-center pointer-events-none bg-black/60"
          style={{
            zIndex: 9999,
            opacity: milestone.opacity
          }}
        >
          <div 
            className="text-center bg-black/90 backdrop-blur-sm border-4 border-cyan-400 rounded-2xl p-8 mx-4 max-w-2xl shadow-2xl"
            style={{
              transform: `scale(${milestone.scale})`,
              boxShadow: '0 0 50px rgba(34, 211, 238, 0.5)'
            }}
          >
            <div className="text-4xl md:text-6xl font-bold text-cyan-300 mb-4 drop-shadow-2xl">
              ENTERING THE
            </div>
            <div className="text-3xl md:text-5xl font-bold text-yellow-300 drop-shadow-2xl mb-3">
              {milestone.zoneName.toUpperCase()}
            </div>
            <div className="text-xl md:text-2xl text-white drop-shadow-lg font-bold">
              {milestone.depth.toLocaleString()}m
            </div>
            <div className="mt-6 w-full h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;