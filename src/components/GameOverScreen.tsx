import React from 'react';
import { GameMode, DeathCause } from '../types/game';

interface GameOverScreenProps {
  maxDepthReached: number;
  survivalTime: number;
  deathCause: DeathCause;
  onRestart: (mode: GameMode) => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  maxDepthReached,
  survivalTime,
  deathCause,
  onRestart
}) => {
  const finalScore = Math.floor(maxDepthReached);
  const timeMinutes = Math.floor(survivalTime / 60000);
  const timeSeconds = Math.floor((survivalTime % 60000) / 1000);

  const getDeathMessage = () => {
    switch (deathCause) {
      case 'starvation':
        return {
          title: 'STARVED',
          subtitle: 'The Hunger Consumed You',
          description: 'Your bioluminescent lure dimmed as starvation claimed you in the endless depths.'
        };
      case 'mines':
        return {
          title: 'DESTROYED',
          subtitle: 'Torn Apart by Explosives',
          description: 'The deep sea mines proved too deadly for even an apex predator like you.'
        };
      default:
        return {
          title: 'PERISHED',
          subtitle: 'The Abyss Claims Another',
          description: 'The endless darkness has swallowed another hunter.'
        };
    }
  };

  const deathMessage = getDeathMessage();

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
        <h1 className={`text-6xl font-bold mb-4 drop-shadow-lg animate-pulse ${
          deathCause === 'mines' ? 'text-orange-400' : 'text-red-400'
        }`}>
          {deathMessage.title}
        </h1>
        <h2 className={`text-3xl mb-4 drop-shadow-md ${
          deathCause === 'mines' ? 'text-orange-300' : 'text-red-300'
        }`}>
          {deathMessage.subtitle}
        </h2>
        <p className="text-lg text-gray-300 mb-6 max-w-md mx-auto italic">
          {deathMessage.description}
        </p>
        
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
            onClick={() => onRestart('speedrun')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ⚡ Hunt Again
          </button>
        </div>
      </div>
    </div>
  );
};