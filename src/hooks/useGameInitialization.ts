import { useEffect } from 'react';
import { Prey, Mine, NetTrap, LightBonus, ElectricBonus, Particle } from '../types/game';

interface UseGameInitializationProps {
  setPrey: React.Dispatch<React.SetStateAction<Prey[]>>;
  setMines: React.Dispatch<React.SetStateAction<Mine[]>>;
  setNetTraps: React.Dispatch<React.SetStateAction<NetTrap[]>>;
  setLightBonuses: React.Dispatch<React.SetStateAction<LightBonus[]>>;
  setElectricBonuses: React.Dispatch<React.SetStateAction<ElectricBonus[]>>;
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
}

export const useGameInitialization = ({
  setPrey,
  setMines,
  setNetTraps,
  setLightBonuses,
  setElectricBonuses,
  setParticles
}: UseGameInitializationProps) => {
  // Initialize prey (reduced count for mobile performance)
  useEffect(() => {
    const newPrey: Prey[] = [];
    const screenWidth = window.innerWidth;
    const spawnWidth = screenWidth - 120; // 60px margin on each side
    for (let i = 0; i < 150; i++) { // Reduced from 200
      const types: ('small' | 'medium' | 'large')[] = ['small', 'small', 'small', 'medium', 'medium', 'large'];
      const fishSvgs: ('fish-1' | 'fish-2')[] = ['fish-1', 'fish-2'];
      newPrey.push({
        id: i,
        x: Math.random() * spawnWidth + 60,
        y: Math.random() * 2000 + 100, // Tighter initial spawn area for faster progression
        collected: false,
        visible: false,
        visibilityTimer: 0,
        type: types[Math.floor(Math.random() * types.length)],
        fishSvg: fishSvgs[Math.floor(Math.random() * fishSvgs.length)]
      });
    }
    setPrey(newPrey);
  }, [setPrey]);

  // Initialize mines (reduced count)
  useEffect(() => {
    const newMines: Mine[] = [];
    const screenWidth = window.innerWidth;
    const spawnWidth = screenWidth - 120; // 60px margin on each side
    const isMobile = window.innerWidth < 768;
    const mineCount = isMobile ? 4 : 35; // Divide by ~10 on mobile
    for (let i = 0; i < mineCount; i++) {
      newMines.push({
        id: i,
        x: Math.random() * spawnWidth + 60,
        y: Math.random() * 2000 + 300, // Tighter spawn area for faster encounters
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

  // Initialize net traps (reduced count)
  useEffect(() => {
    const newNetTraps: NetTrap[] = [];
    const screenWidth = window.innerWidth;
    const spawnWidth = screenWidth - 120; // 60px margin on each side
    for (let i = 0; i < 20; i++) { // Reduced from 30
      newNetTraps.push({
        id: i,
        x: Math.random() * spawnWidth + 60,
        y: Math.random() * 1500 + 600, // Tighter spawn area
        triggered: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    setNetTraps(newNetTraps);
  }, [setNetTraps]);

  // Initialize light bonuses
  useEffect(() => {
    const newLightBonuses: LightBonus[] = [];
    const screenWidth = window.innerWidth;
    const spawnWidth = screenWidth - 120; // 60px margin on each side
    for (let i = 0; i < 5; i++) {
      newLightBonuses.push({
        id: i,
        x: Math.random() * spawnWidth + 60,
        y: 1500 + i * 500 + Math.random() * 300, // Closer spacing for faster progression
        collected: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    setLightBonuses(newLightBonuses);
  }, [setLightBonuses]);

  // Initialize electric bonuses
  useEffect(() => {
    const newElectricBonuses: ElectricBonus[] = [];
    const screenWidth = window.innerWidth;
    const spawnWidth = screenWidth - 120; // 60px margin on each side
    for (let i = 0; i < 3; i++) {
      newElectricBonuses.push({
        id: i,
        x: Math.random() * spawnWidth + 60,
        y: 2000 + i * 800 + Math.random() * 400, // Closer spacing
        collected: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    setElectricBonuses(newElectricBonuses);
  }, [setElectricBonuses]);

  // Initialize floating particles (marine snow) - reduced count
  useEffect(() => {
    const newParticles: Particle[] = [];
    
    // Marine snow particles
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * 1000 - 500, // Tighter initial area
        speed: Math.random() * 1 + 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        type: 'snow'
      });
    }
    
    // Bioluminescent plankton particles
    for (let i = 20; i < 60; i++) {
      const colors = ['#00FFFF', '#00CED1', '#40E0D0', '#48D1CC', '#20B2AA', '#87CEEB'];
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * 1200 - 600,
        speed: Math.random() * 0.8 + 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.3,
        type: 'plankton',
        pulsePhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setParticles(newParticles);
  }, [setParticles]);
};