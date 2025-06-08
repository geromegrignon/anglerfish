import React from 'react';
import { GameMode } from '../types/game';

interface GameOverScreenProps {
  maxDepthReached: number;
  survivalTime: number;
  onRestart: (mode: GameMode) => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  maxDepthReached,
  survivalTime,
  onRestart
}) => {
  const finalScore = Math.floor(maxDepthReached);
  const timeMinutes = Math.floor(survivalTime / 60000);
  const timeSeconds = Math.floor((survivalTime % 60000) / 1000);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-red-900 flex items-center justify-center relative overflow-hidden">
      {/* Death ambiance effects */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-red-900 opacity-20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 300 + 150}px`,
              height: `${Math.random() * 300 + 150}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`
            }}
          />
        ))}
      </div>

      <div className="text-center z-10">
        <h1 className="text-6xl font-bold text-red-400 mb-4 drop-shadow-lg animate-pulse">
          STARVED
        </h1>
        <h2 className="text-3xl text-red-300 mb-6 drop-shadow-md">
          The Abyss Claims Another
        </h2>
        
        <div className="mb-8 text-gray-300 space-y-2">
          <p className="text-xl">
            <span className="text-blue-400 font-semibold">Maximum Depth:</span> {finalScore.toLocaleString()}m
          </p>
          <p className="text-xl">
            <span className="text-green-400 font-semibold">Survival Time:</span> {timeMinutes}m {timeSeconds}s
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onRestart('explore')}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🌊 Hunt Again (Explore)
          </button>
          
          <button
            onClick={() => onRestart('speedrun')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ⚡ Hunt Again (Speed Run)
          </button>
        </div>
      </div>
    </div>
  );
};