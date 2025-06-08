import React from 'react';
import { Circle, Zap } from 'lucide-react';

interface GameUIProps {
  hunger: number;
  depth: number;
  lightBonusActive: boolean;
  lightBonusTimer: number;
  slowedDown: boolean;
  slowdownTimer: number;
}

export const GameUI: React.FC<GameUIProps> = ({
  hunger,
  depth,
  lightBonusActive,
  lightBonusTimer,
  slowedDown,
  slowdownTimer
}) => {
  return (
    <>
      {/* Hunger bar - full width on mobile, max-3xl on larger screens */}
      <div className="absolute top-4 left-4 right-4 z-20 max-w-3xl mx-auto">
        <div className="h-4 bg-gray-700/80 rounded-full overflow-hidden backdrop-blur-sm border border-red-500/30">
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-red-300 transition-all duration-300"
            style={{ width: `${hunger}%` }}
          />
        </div>
        
        {/* Depth indicator - directly under hunger bar */}
        <div className="text-lg font-bold text-cyan-300 mt-2">
          {Math.floor(depth).toLocaleString()}m
        </div>
      </div>

      {/* Light bonus timer */}
      {lightBonusActive && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/30">
            <div className="flex items-center mb-1">
              <Zap className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-yellow-300 text-sm font-semibold">Enhanced Vision</span>
            </div>
            <div className="text-lg font-bold text-yellow-300">
              {Math.ceil(lightBonusTimer / 1000)}s
            </div>
          </div>
        </div>
      )}

      {/* Slowdown effect indicator */}
      {slowedDown && (
        <div className="absolute top-20 right-4 z-20">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-red-500/30">
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 border-2 border-red-400 rounded mr-2" />
              <span className="text-red-300 text-sm font-semibold">Trapped!</span>
            </div>
            <div className="text-lg font-bold text-red-300">
              {Math.ceil(slowdownTimer / 1000)}s
            </div>
          </div>
        </div>
      )}
    </>
  );
};