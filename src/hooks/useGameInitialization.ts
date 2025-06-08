import { useEffect } from 'react';
import { Prey, Mine, NetTrap, LightBonus, Particle } from '../types/game';

interface UseGameInitializationProps {
  setPrey: React.Dispatch<React.SetStateAction<Prey[]>>;
  setMines: React.Dispatch<React.SetStateAction<Mine[]>>;
  setNetTraps: React.Dispatch<React.SetStateAction<NetTrap[]>>;
  setLightBonuses: React.Dispatch<React.SetStateAction<LightBonus[]>>;
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
}

export const useGameInitialization = ({
  setPrey,
  setMines,
  setNetTraps,
  setLightBonuses,
  setParticles
}: UseGameInitializationProps) => {
  // Initialize prey
  useEffect(() => {
    const newPrey: Prey[] = [];
    for (let i = 0; i < 200; i++) {
      const types: ('small' | 'medium' | 'large')[] = ['small', 'small', 'small', 'medium', 'medium', 'large'];
      const fishSvgs: ('fish-1' | 'fish-2')[] = ['fish-1', 'fish-2'];
      newPrey.push({
        id: i,
        x: Math.random() * 1400 + 200,
        y: Math.random() * 4000 + 100,
        collected: false,
        visible: false,
        visibilityTimer: 0,
        type: types[Math.floor(Math.random() * types.length)],
        fishSvg: fishSvgs[Math.floor(Math.random() * fishSvgs.length)]
      });
    }
    setPrey(newPrey);
  }, [setPrey]);

  // Initialize mines
  useEffect(() => {
    const newMines: Mine[] = [];
    for (let i = 0; i < 50; i++) {
      newMines.push({
        id: i,
        x: Math.random() * 1400 + 200,
        y: Math.random() * 4000 + 500,
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
  }, [setMines]);

  // Initialize net traps
  useEffect(() => {
    const newNetTraps: NetTrap[] = [];
    for (let i = 0; i < 30; i++) {
      newNetTraps.push({
        id: i,
        x: Math.random() * 1400 + 200,
        y: Math.random() * 4000 + 1000,
        triggered: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    setNetTraps(newNetTraps);
  }, [setNetTraps]);

  // Initialize light bonuses
  useEffect(() => {
    const newLightBonuses: LightBonus[] = [];
    for (let i = 0; i < 5; i++) {
      newLightBonuses.push({
        id: i,
        x: Math.random() * 1400 + 200,
        y: 2000 + i * 1000 + Math.random() * 500,
        collected: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    setLightBonuses(newLightBonuses);
  }, [setLightBonuses]);

  // Initialize floating particles (marine snow)
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * 2000 - 1000,
        speed: Math.random() * 1 + 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2
      });
    }
    setParticles(newParticles);
  }, [setParticles]);
};