import React from 'react';
import { Fish, Circle, Zap } from 'lucide-react';

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
      {/* Main UI Elements */}
      <div className="absolute top-4 left-4 z-20">
        {/* Hunger bar */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 mb-2 border border-red-500/30">
          <div className="flex items-center mb-1">
            <Fish className="w-4 h-4 text-red-400 mr-2" />
            <span className="text-red-300 text-sm font-semibold">Hunger</span>
          </div>
          <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-300 transition-all duration-300"
              style={{ width: `${hunger}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">{Math.round(hunger)}%</div>
        </div>

        {/* Depth indicator */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30">
          <div className="flex items-center mb-1">
            <Circle className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-blue-300 text-sm font-semibold">Depth</span>
          </div>
          <div className="text-lg font-bold text-cyan-300">
            {Math.floor(depth).toLocaleString()}m
          </div>
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