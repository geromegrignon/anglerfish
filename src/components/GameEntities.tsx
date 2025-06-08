import React, { useMemo } from 'react';
import { Zap, Bomb } from 'lucide-react';
import { 
  Prey, 
  Mine, 
  NetTrap, 
  LightBonus, 
  SonarWave, 
  Particle, 
  Position 
} from '../types/game';

interface GameEntitiesProps {
  particles: Particle[];
  sonarWaves: SonarWave[];
  anglerfishPos: Position;
  lightRadius: number;
  lightBonusActive: boolean;
  prey: Prey[];
  lightBonuses: LightBonus[];
  netTraps: NetTrap[];
  mines: Mine[];
  cameraY: number;
}

export const GameEntities: React.FC<GameEntitiesProps> = ({
  particles,
  sonarWaves,
  anglerfishPos,
  lightRadius,
  lightBonusActive,
  prey,
  lightBonuses,
  netTraps,
  mines,
  cameraY
}) => {
  // Viewport culling - only render entities visible on screen
  const viewportTop = cameraY - 100;
  const viewportBottom = cameraY + window.innerHeight + 100;
  
  const visibleParticles = useMemo(() => 
    particles.filter(p => p.y >= viewportTop && p.y <= viewportBottom),
    [particles, viewportTop, viewportBottom]
  );
  
  const visiblePrey = useMemo(() => 
    prey.filter(p => !p.collected && p.visible && p.y >= viewportTop && p.y <= viewportBottom),
    [prey, viewportTop, viewportBottom]
  );
  
  const visibleLightBonuses = useMemo(() => 
    lightBonuses.filter(b => !b.collected && b.y >= viewportTop && b.y <= viewportBottom),
    [lightBonuses, viewportTop, viewportBottom]
  );
  
  const visibleNetTraps = useMemo(() => 
    netTraps.filter(t => t.y >= viewportTop && t.y <= viewportBottom),
    [netTraps, viewportTop, viewportBottom]
  );
  
  const visibleMines = useMemo(() => 
    mines.filter(m => !m.exploded && m.y >= viewportTop && m.y <= viewportBottom),
    [mines, viewportTop, viewportBottom]
  );

  return (
    <>
      {/* Marine snow particles - reduced count for mobile */}
      {visibleParticles.slice(0, 30).map(particle => (
        <div
          key={particle.id}
          className="absolute bg-white rounded-full pointer-events-none will-change-transform"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y - cameraY}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            transform: `translate3d(0, 0, 0)` // Force GPU acceleration
          }}
        />
      ))}

      {/* Bioluminescent waves */}
      {sonarWaves.map(wave => (
        <div
          key={wave.id}
          className="absolute border-2 border-cyan-400 rounded-full pointer-events-none will-change-transform"
          style={{
            left: `${wave.x - wave.radius}px`,
            top: `${wave.y - wave.radius - cameraY}px`,
            width: `${wave.radius * 2}px`,
            height: `${wave.radius * 2}px`,
            opacity: wave.opacity,
            transform: `translate3d(0, 0, 0)`,
            boxShadow: `0 0 ${wave.radius / 2}px rgba(34, 211, 238, ${wave.opacity * 0.5})`
          }}
        />
      ))}

      {/* Anglerfish light glow */}
      <div
        className="absolute rounded-full pointer-events-none will-change-transform"
        style={{
          left: `${anglerfishPos.x + 40 - lightRadius}px`,
          top: `${anglerfishPos.y + 10 - lightRadius - cameraY}px`,
          width: `${lightRadius * 2}px`,
          height: `${lightRadius * 2}px`,
          background: `radial-gradient(circle, 
            rgba(34, 211, 238, ${lightBonusActive ? 0.4 : 0.2}) 0%, 
            rgba(34, 211, 238, ${lightBonusActive ? 0.2 : 0.1}) 30%, 
            transparent 70%)`,
          filter: 'blur(8px)',
          transform: `translate3d(0, 0, 0)`
        }}
      />

      {/* Prey */}
      {visiblePrey.map(preyItem => {
        const size = preyItem.type === 'large' ? 24 : preyItem.type === 'medium' ? 18 : 12;
        const opacity = Math.min(1, preyItem.visibilityTimer / 1000);
        
        return (
          <img
            key={preyItem.id}
            src={`/${preyItem.fishSvg}.svg`}
            alt="prey"
            className="absolute pointer-events-none will-change-transform"
            style={{
              left: `${preyItem.x - size/2}px`,
              top: `${preyItem.y - size/2 - cameraY}px`,
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              filter: `drop-shadow(0 0 ${size/3}px rgba(34, 211, 238, ${opacity * 0.8}))`,
              transform: 'scaleX(-1) translate3d(0, 0, 0)' // Face left + GPU acceleration
            }}
          />
        );
      })}

      {/* Light bonuses */}
      {visibleLightBonuses.map(bonus => {
        const pulseScale = 1 + Math.sin(bonus.pulsePhase) * 0.3;
        const glowIntensity = 0.5 + Math.sin(bonus.pulsePhase) * 0.3;
        
        return (
          <div
            key={bonus.id}
            className="absolute pointer-events-none will-change-transform"
            style={{
              left: `${bonus.x - 15}px`,
              top: `${bonus.y - 15 - cameraY}px`,
              transform: `scale(${pulseScale}) translate3d(0, 0, 0)`,
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
      {visibleNetTraps.map(trap => {
        const pulseOpacity = 0.3 + Math.sin(trap.pulsePhase) * 0.2;
        const isVisible = trap.triggered || Math.sin(trap.pulsePhase) > 0;
        
        if (!isVisible) return null;
        
        return (
          <div
            key={trap.id}
            className="absolute pointer-events-none will-change-transform"
            style={{
              left: `${trap.x - 20}px`,
              top: `${trap.y - 20 - cameraY}px`,
              transform: `translate3d(0, 0, 0)`
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
      {visibleMines.map(mine => {
        const pulseScale = 1 + Math.sin(mine.pulsePhase) * 0.2;
        const glowIntensity = 0.4 + Math.sin(mine.pulsePhase) * 0.3;
        
        return (
          <div
            key={mine.id}
            className="absolute pointer-events-none will-change-transform"
            style={{
              left: `${mine.x - 20}px`,
              top: `${mine.y - 20 - cameraY}px`,
              transform: `scale(${pulseScale}) translate3d(0, 0, 0)`,
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
    </>
  );
};