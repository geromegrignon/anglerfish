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
  // Mobile detection for performance optimizations
  const isMobile = window.innerWidth < 768;
  
  // Larger margins on mobile to prevent items spawning too close to edges
  const horizontalMargin = isMobile ? 100 : 60; // 100px margin on mobile vs 60px on desktop
  
  // Initialize prey (reduced count for mobile performance)
  useEffect(() => {
    const newPrey: Prey[] = [];
    const screenWidth = window.innerWidth;
    const spawnWidth = screenWidth - (horizontalMargin * 2); // Dynamic margin based on device
    const preyCount = isMobile ? 80 : 150;
    for (let i = 0; i < preyCount; i++) {
      const types: ('small' | 'medium' | 'large')[] = ['small', 'small', 'small', 'medium', 'medium', 'large'];
      const fishSvgs: ('fish-1' | 'fish-2')[] = ['fish-1', 'fish-2'];
      newPrey.push({
        id: i,
        x: Math.random() * spawnWidth + horizontalMargin,
        y: Math.random() * 3000 + 100, // Reduced initial spawn area
        collected: false,
        visible: false,
        visibilityTimer: 0,
        type: types[Math.floor(Math.random() * types.length)],
        fishSvg: fishSvgs[Math.floor(Math.random() * fishSvgs.length)]
      });
    }
    setPrey(newPrey);
  }, [setPrey, isMobile, horizontalMargin]);

  // Initialize mines (reduced count)
  useEffect(() => {
    const newMines: Mine[] = [];
    const screenWidth = window.innerWidth;
    const spawnWidth = screenWidth - (horizontalMargin * 2); // Dynamic margin based on device
    const mineCount = isMobile ? 8 : 35;
    for (let i = 0; i < mineCount; i++) {
      newMines.push({
        id: i,
        x: Math.random() * spawnWidth + horizontalMargin,
        y: Math.random() * 3000 + 500, // Reduced initial spawn area
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
  }, [setMines, isMobile, horizontalMargin]);

  // Initialize net traps (reduced count)
  useEffect(() => {
    const newNetTraps: NetTrap[] = [];
    const screenWidth = window.innerWidth;
    const spawnWidth = screenWidth - (horizontalMargin * 2); // Dynamic margin based on device
    const trapCount = isMobile ? 12 : 20;
    for (let i = 0; i < trapCount; i++) {
      newNetTraps.push({
        id: i,
        x: Math.random() * spawnWidth + horizontalMargin,
        y: Math.random() * 3000 + 1000, // Reduced initial spawn area
        triggered: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    setNetTraps(newNetTraps);
  }, [setNetTraps, isMobile, horizontalMargin]);

  // Initialize light bonuses
  useEffect(() => {
    const newLightBonuses: LightBonus[] = [];
    const screenWidth = window.innerWidth;
    const spawnWidth = screenWidth - (horizontalMargin * 2); // Dynamic margin based on device
    const bonusCount = isMobile ? 3 : 5;
    for (let i = 0; i < bonusCount; i++) {
      newLightBonuses.push({
        id: i,
        x: Math.random() * spawnWidth + horizontalMargin,
        y: 2000 + i * 800 + Math.random() * 400, // Reduced spacing
        collected: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    setLightBonuses(newLightBonuses);
  }, [setLightBonuses, isMobile, horizontalMargin]);

  // Initialize electric bonuses
  useEffect(() => {
    const newElectricBonuses: ElectricBonus[] = [];
    const screenWidth = window.innerWidth;
    const spawnWidth = screenWidth - (horizontalMargin * 2); // Dynamic margin based on device
    const bonusCount = isMobile ? 2 : 3;
    for (let i = 0; i < bonusCount; i++) {
      newElectricBonuses.push({
        id: i,
        x: Math.random() * spawnWidth + horizontalMargin,
        y: 3000 + i * 1200 + Math.random() * 600, // Spawn deeper than light bonuses
        collected: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    setElectricBonuses(newElectricBonuses);
  }, [setElectricBonuses, isMobile, horizontalMargin]);

  // Initialize floating particles (marine snow) - reduced count
  useEffect(() => {
    const newParticles: Particle[] = [];
    
    const snowCount = isMobile ? 10 : 20;
    const planktonCount = isMobile ? 20 : 40;
    
    // Marine snow particles
    for (let i = 0; i < snowCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * 1500 - 750, // Reduced initial area
        speed: Math.random() * 1 + 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        type: 'snow'
      });
    }
    
    // Bioluminescent plankton particles
    for (let i = snowCount; i < snowCount + planktonCount; i++) {
      const colors = ['#00FFFF', '#00CED1', '#40E0D0', '#48D1CC', '#20B2AA', '#87CEEB'];
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * 2000 - 1000,
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