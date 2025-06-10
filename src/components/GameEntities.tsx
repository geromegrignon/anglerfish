import React, { useMemo } from 'react';
import { Zap } from 'lucide-react';
import { 
  Prey, 
  Mine, 
  NetTrap, 
  LightBonus, 
  ElectricBonus,
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
  electricFieldActive: boolean;
  prey: Prey[];
  lightBonuses: LightBonus[];
  electricBonuses: ElectricBonus[];
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
  electricFieldActive,
  prey,
  lightBonuses,
  electricBonuses,
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
  
  const marineSnow = useMemo(() => 
    visibleParticles.filter(p => p.type === 'snow'),
    [visibleParticles]
  );
  
  const planktonParticles = useMemo(() => 
    visibleParticles.filter(p => p.type === 'plankton'),
    [visibleParticles]
  );
  
  const visiblePrey = useMemo(() => 
    prey.filter(p => !p.collected && p.visible && p.y >= viewportTop && p.y <= viewportBottom),
    [prey, viewportTop, viewportBottom]
  );
  
  const visibleLightBonuses = useMemo(() => 
    lightBonuses.filter(b => !b.collected && b.y >= viewportTop && b.y <= viewportBottom),
    [lightBonuses, viewportTop, viewportBottom]
  );
  
  const visibleElectricBonuses = useMemo(() => 
    electricBonuses.filter(b => !b.collected && b.y >= viewportTop && b.y <= viewportBottom),
    [electricBonuses, viewportTop, viewportBottom]
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
      {/* Marine snow particles */}
      {marineSnow.slice(0, 20).map(particle => (
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
      
      {/* Bioluminescent plankton particles */}
      {planktonParticles.map(particle => {
        const pulseIntensity = particle.pulsePhase ? 0.5 + Math.sin(particle.pulsePhase) * 0.5 : 1;
        const glowSize = particle.size * 3;
        
        return (
          <div
            key={particle.id}
            className="absolute rounded-full pointer-events-none will-change-transform"
            style={{
              left: `${particle.x - glowSize/2}px`,
              top: `${particle.y - glowSize/2 - cameraY}px`,
              width: `${glowSize}px`,
              height: `${glowSize}px`,
              background: `radial-gradient(circle, 
                ${particle.color}${Math.floor(pulseIntensity * particle.opacity * 255).toString(16).padStart(2, '0')} 0%, 
                ${particle.color}${Math.floor(pulseIntensity * particle.opacity * 128).toString(16).padStart(2, '0')} 30%, 
                transparent 70%)`,
              filter: `blur(${particle.size}px)`,
              transform: `translate3d(0, 0, 0)`,
              opacity: pulseIntensity * particle.opacity
            }}
          >
            {/* Core particle */}
            <div
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                transform: 'translate(-50%, -50%)',
                opacity: pulseIntensity,
                filter: 'blur(0.5px)'
              }}
            />
          </div>
        );
      })}

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

      {/* Bioluminescent plankton particles */}
      {planktonParticles.slice(0, 40).map(particle => {
        const pulseIntensity = 0.5 + Math.sin(particle.pulsePhase || 0) * 0.4;
        const glowSize = particle.size * (1 + pulseIntensity * 0.5);
        
        return (
          <div
            key={particle.id}
            className="absolute pointer-events-none will-change-transform"
            style={{
              left: `${particle.x - glowSize}px`,
              top: `${particle.y - glowSize - cameraY}px`,
              width: `${glowSize * 2}px`,
              height: `${glowSize * 2}px`,
              transform: `translate3d(0, 0, 0)`
            }}
          >
            {/* Core particle */}
            <div
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                opacity: particle.opacity * pulseIntensity,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
              }}
            />
            {/* Glow effect */}
            <div
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                width: `${glowSize * 1.5}px`,
                height: `${glowSize * 1.5}px`,
                background: `radial-gradient(circle, ${particle.color}${Math.floor(pulseIntensity * 40).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                transform: 'translate(-50%, -50%)',
                filter: 'blur(2px)'
              }}
            />
          </div>
        );
      })}

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

      {/* Electric field around anglerfish when active */}
      {electricFieldActive && (
        <div
          className="absolute rounded-full pointer-events-none will-change-transform"
          style={{
            left: `${anglerfishPos.x + 40 - 120}px`,
            top: `${anglerfishPos.y + 30 - 120 - cameraY}px`,
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(255, 255, 0, 0.1) 0%, rgba(255, 255, 0, 0.05) 50%, transparent 70%)',
            border: '2px solid rgba(255, 255, 0, 0.6)',
            filter: 'blur(1px)',
            boxShadow: `
              0 0 20px rgba(255, 255, 0, 0.4),
              0 0 40px rgba(255, 255, 0, 0.2),
              inset 0 0 20px rgba(255, 255, 0, 0.1)
            `,
            transform: `scale(${1 + Math.sin(Date.now() * 0.003) * 0.05}) translate3d(0, 0, 0)`,
          }}
        >
          {/* Electric sparks around the perimeter */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2 + Date.now() * 0.001;
            const sparkX = 120 + Math.cos(angle) * 105;
            const sparkY = 120 + Math.sin(angle) * 105;
            
            return (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                style={{
                  left: `${sparkX}px`,
                  top: `${sparkY}px`,
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.7 + Math.sin(Date.now() * 0.005 + i) * 0.3,
                  filter: 'blur(0.5px)',
                  boxShadow: '0 0 4px rgba(255, 255, 0, 0.8)'
                }}
              />
            );
          })}
        </div>
      )}

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
            <img
              src="/light-bonus.svg"
              alt="light bonus"
              className="w-8 h-8 pointer-events-none"
              style={{
                filter: `drop-shadow(0 0 ${10 * glowIntensity}px rgba(253, 224, 71, ${glowIntensity})) brightness(1.2)`
              }}
            />
          </div>
        );
      })}

      {/* Electric bonuses */}
      {visibleElectricBonuses.map(bonus => {
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
            {/* Wave border container */}
            <div
              className="relative w-8 h-8"
              style={{
                filter: `drop-shadow(0 0 ${15 * glowIntensity}px rgba(255, 255, 0, ${glowIntensity}))`
              }}
            >
              {/* Animated wave border */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'transparent',
                  border: '2px solid rgba(255, 255, 0, 0.8)',
                  borderRadius: '50%',
                  clipPath: `polygon(
                    50% 0%,
                    ${50 + 15 * Math.sin(bonus.pulsePhase * 2)}% ${10 + 5 * Math.cos(bonus.pulsePhase * 3)}%,
                    ${85 + 10 * Math.sin(bonus.pulsePhase * 2.5)}% ${25 + 8 * Math.cos(bonus.pulsePhase * 2)}%,
                    ${90 + 8 * Math.sin(bonus.pulsePhase * 3)}% 50%,
                    ${85 + 10 * Math.sin(bonus.pulsePhase * 2.5 + Math.PI)}% ${75 + 8 * Math.cos(bonus.pulsePhase * 2 + Math.PI)}%,
                    ${50 + 15 * Math.sin(bonus.pulsePhase * 2 + Math.PI)}% ${90 + 5 * Math.cos(bonus.pulsePhase * 3 + Math.PI)}%,
                    50% 100%,
                    ${50 - 15 * Math.sin(bonus.pulsePhase * 2)}% ${90 + 5 * Math.cos(bonus.pulsePhase * 3 + Math.PI)}%,
                    ${15 - 10 * Math.sin(bonus.pulsePhase * 2.5)}% ${75 + 8 * Math.cos(bonus.pulsePhase * 2 + Math.PI)}%,
                    ${10 - 8 * Math.sin(bonus.pulsePhase * 3)}% 50%,
                    ${15 - 10 * Math.sin(bonus.pulsePhase * 2.5 + Math.PI)}% ${25 + 8 * Math.cos(bonus.pulsePhase * 2)}%,
                    ${50 - 15 * Math.sin(bonus.pulsePhase * 2 + Math.PI)}% ${10 + 5 * Math.cos(bonus.pulsePhase * 3)}%
                  )`,
                  opacity: glowIntensity
                }}
              />
              
              {/* Inner glow effect */}
              <div
                className="absolute inset-1 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255, 255, 0, ${0.3 * glowIntensity}) 0%, transparent 70%)`,
                  filter: 'blur(1px)'
                }}
              />
              
              {/* Zap icon */}
              <Zap 
                className="absolute inset-0 w-8 h-8 text-yellow-400"
                style={{
                  filter: 'brightness(1.3)'
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Net traps */}
      {visibleNetTraps.map(trap => {
        const pulseOpacity = 0.3 + Math.sin(trap.pulsePhase) * 0.2;
        const pulseScale = 1 + Math.sin(trap.pulsePhase) * 0.2;
        const glowIntensity = 0.4 + Math.sin(trap.pulsePhase) * 0.3;
        
        return (
          <div
            key={trap.id}
            className="absolute pointer-events-none will-change-transform"
            style={{
              left: `${trap.x - 15}px`,
              top: `${trap.y - 15 - cameraY}px`,
              transform: `scale(${pulseScale}) translate3d(0, 0, 0)`,
            }}
          >
            <img
              src="/trap.svg"
              alt="trap"
              className="w-8 h-8 pointer-events-none"
              style={{
                filter: trap.triggered 
                  ? `drop-shadow(0 0 ${15 * glowIntensity}px rgba(239, 68, 68, ${glowIntensity})) brightness(1.2)`
                  : `drop-shadow(0 0 ${10 * glowIntensity}px rgba(251, 146, 60, ${glowIntensity})) brightness(1.1)`
              }}
            />
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
            <img
              src="/mine.svg"
              alt="mine"
              className="w-10 h-10 pointer-events-none"
              style={{
                filter: `drop-shadow(0 0 ${15 * glowIntensity}px rgba(239, 68, 68, ${glowIntensity})) brightness(1.2)`
              }}
            />
          </div>
        );
      })}
    </>
  );
};