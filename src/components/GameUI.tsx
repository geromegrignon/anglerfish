import React from 'react';
import { Circle, Zap, Heart } from 'lucide-react';
import { GameMode } from '../types/game';

interface GameUIProps {
  hunger: number;
  hitPoints: number;
  fishEaten: number;
  gameMode: GameMode;
  depth: number;
  lightBonusActive: boolean;
  lightBonusTimer: number;
  electricFieldActive: boolean;
  electricFieldTimer: number;
  slowedDown: boolean;
  slowdownTimer: number;
}

export const GameUI: React.FC<GameUIProps> = ({
  hunger,
  hitPoints,
  fishEaten,
  gameMode,
  depth,
  lightBonusActive,
  lightBonusTimer,
  electricFieldActive,
  electricFieldTimer,
  slowedDown,
  slowdownTimer
}) => {
  return (
    <>
      {/* Hunger bar - full width on mobile, max-3xl on larger screens */}
      <div className="absolute top-8 md:top-4 left-4 right-4 z-20 max-w-3xl mx-auto">
        <div className="h-4 bg-gray-700/80 rounded-full overflow-hidden backdrop-blur-sm border border-red-500/30">
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-red-300"
            style={{ width: `${hunger}%` }}
          />
        </div>
        
        {/* Bottom row with depth and hit points */}
        <div className="flex justify-between items-center mt-3">
          {/* Depth indicator with game mode */}
          <div className="flex items-center space-x-4">
            <div className="text-lg font-bold text-cyan-300">
              {Math.floor(depth).toLocaleString()}m
            </div>
            
            {/* Fish eaten counter */}
            <div className="flex items-center space-x-1">
              <img 
                src="/fish-2.svg" 
                alt="fish" 
                className="w-5 h-5"
                style={{
                  filter: 'drop-shadow(0 0 3px rgba(34, 211, 238, 0.6))'
                }}
              />
              <span className="text-sm font-semibold text-cyan-200">
                {fishEaten}
              </span>
            </div>
          </div>

          {/* Hit Points */}
          <div className="flex items-center">
            {Array.from({ length: 3 }).map((_, index) => (
              <Heart
                key={index}
                className={`w-6 h-6 ml-1 text-red-500 ${
                  index < hitPoints ? 'fill-red-500' : 'fill-none'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* In-game effects - absolutely centered */}
      <div className="absolute top-12 md:top-10 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-3">
          {/* Light bonus effect */}
          {lightBonusActive && (
            <div className="flex items-center">
              <Zap className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-yellow-300 text-sm font-bold">
                {Math.ceil(lightBonusTimer / 1000)}s
              </span>
            </div>
          )}
          
          {/* Electric field effect */}
          {electricFieldActive && (
            <div className="flex items-center">
              <Zap className="w-4 h-4 text-yellow-300 mr-1" />
              <span className="text-yellow-200 text-sm font-bold">
                ⚡ {Math.ceil(electricFieldTimer / 1000)}s
              </span>
            </div>
          )}
          
          {/* Slowdown/trap effect */}
          {slowedDown && (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-red-400 rounded mr-1" />
              <span className="text-red-300 text-sm font-bold">
                {Math.ceil(slowdownTimer / 1000)}s
              </span>
            </div>
          )}
        </div>
      </div>

    </>
  );
};