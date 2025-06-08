import React from 'react';
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
  return (
    <>
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
    </>
  );
};