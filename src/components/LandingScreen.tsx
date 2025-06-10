import React from 'react';
import { Zap, Circle } from 'lucide-react';
import { GameMode } from '../types/game';

interface LandingScreenProps {
  onStartGame: (mode: GameMode) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Swimming fish silhouettes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`fish-${i}`}
            className="absolute opacity-30"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              animationName: 'swimAcross',
              animationDuration: `${Math.random() * 15 + 10}s`,
              animationDelay: `${Math.random() * 10}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear'
            }}
          >
            <img 
              src="/fish-1.svg" 
              alt="fish" 
              className="w-8 h-8"
              style={{
                filter: 'drop-shadow(0 0 4px rgba(147, 197, 253, 0.6)) brightness(0.8)',
                transform: 'scaleX(-1)' // Face left for swimming animation
              }}
            />
          </div>
        ))}

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-blue-200 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              animationName: 'floatDown',
              animationDuration: `${Math.random() * 8 + 5}s`,
              animationDelay: `${Math.random() * 5}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear'
            }}
          />
        ))}

        {/* Twinkling lights */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`light-${i}`}
            className="absolute w-2 h-2 bg-cyan-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationName: 'twinkle',
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`,
              animationIterationCount: 'infinite'
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 mb-4 drop-shadow-2xl">
            ABYSS HUNTER
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-2 drop-shadow-lg">
            Survive the Endless Deep
          </p>
          <p className="text-lg text-gray-300 drop-shadow-md">
            An Anglerfish's Journey into Darkness
          </p>
        </div>

        {/* Controls & Objectives Card */}
        <div className="bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 mb-8 max-w-2xl w-full">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Controls */}
            <div>
              <h3 className="text-xl font-bold text-cyan-300 mb-3 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Controls
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="text-blue-400 font-mono">A/D / Left/Right</span> - Move horizontally</p>
                <p><span className="text-blue-400 font-mono">Spacebar</span> - Echolocation pulse</p>
                <p><span className="text-blue-400 font-mono">Touch</span> - Left/Right buttons (mobile)</p>
              </div>
            </div>

            {/* Objectives */}
            <div>
              <h3 className="text-xl font-bold text-cyan-300 mb-3 flex items-center">
                <Circle className="w-5 h-5 mr-2" />
                Objectives
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Hunt prey to maintain hunger</p>
                <p>• Avoid explosive mines</p>
                <p>• Escape net traps quickly</p>
                <p>• Auto-dive as deep as possible</p>
                <p>• Collect light bonuses for better vision</p>
              </div>
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={() => onStartGame('speedrun')}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl border border-purple-400/50 max-w-md"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">⚡ START HUNT</div>
            <div className="text-sm opacity-80">Auto-dive into the abyss</div>
          </div>
        </button>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Use your bioluminescent lure to reveal hidden prey in the darkness</p>
          <p className="mb-2">The deeper you go, the more dangerous it becomes...</p>
          <p className="text-xs">
            <span className="text-purple-300">Speed Run:</span> Race to the depths with automatic descent and left/right movement
          </p>
        </div>
      </div>
    </div>
  );
};