import React from 'react';
import { Zap, Circle, Smartphone } from 'lucide-react';
import { GameMode } from '../types/game';

// Force viewport height calculation on mobile
const setVH = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

interface LandingScreenProps {
  onStartGame: (mode: GameMode) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStartGame }) => {
  // Set viewport height on mount and resize
  React.useEffect(() => {
    setVH();
    const handleResize = () => setVH();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  // Detect if device is mobile/touch-enabled
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  
  // Feature flag for mobile support
  const MOBILE_SUPPORT_ENABLED = false;
  
  return (
    <div 
      className="w-full bg-gradient-to-b from-gray-900 via-blue-900 to-black relative overflow-hidden" 
      style={{ 
        height: '100vh',
        height: 'calc(var(--vh, 1vh) * 100)',
        minHeight: '100vh',
        minHeight: 'calc(var(--vh, 1vh) * 100)'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Swimming fish silhouettes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`fish-${i}`}
            className="absolute opacity-30"
            style={{
              left: '-60px', // Start off-screen to the left
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
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 md:p-8">
        {/* Hero Anglerfish */}
        <div className="relative mb-8">
          {/* Anglerfish with glowing lure */}
          <div className="relative">
            {/* Bioluminescent lure glow */}
            <div
              className="absolute rounded-full animate-pulse"
              style={{
                left: '140px',
                top: '20px',
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(34, 211, 238, 0.6) 0%, rgba(34, 211, 238, 0.3) 30%, transparent 70%)',
                filter: 'blur(8px)',
                animationDuration: '2s'
              }}
            />
            
            {/* Main anglerfish */}
            <img
              src="/anglerfish.svg"
              alt="Abyss Hunter - Anglerfish"
              className="w-32 h-24 md:w-40 md:h-30 relative z-10"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.8)) brightness(1.1)',
                animation: 'gentleFloat 4s ease-in-out infinite'
              }}
            />
            
            {/* Lure light core */}
            <div
              className="absolute w-3 h-3 bg-cyan-300 rounded-full animate-pulse"
              style={{
                left: '165px',
                top: '35px',
                boxShadow: '0 0 15px rgba(34, 211, 238, 1)',
                animationDuration: '1.5s'
              }}
            />
            
            {/* Trailing bioluminescent particles */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`trail-${i}`}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
                style={{
                  left: `${120 - i * 15}px`,
                  top: `${45 + Math.sin(i) * 8}px`,
                  animationName: 'trailPulse',
                  animationDuration: '3s',
                  animationDelay: `${i * 0.3}s`,
                  animationIterationCount: 'infinite',
                  filter: 'blur(0.5px)'
                }}
              />
            ))}
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-8xl font-bold mb-4 drop-shadow-2xl" style={{ fontFamily: 'Chewy, cursive' }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
              ANG
            </span>
            <span className="text-blue-200">
              U
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
              LARFISH
            </span>
          </h1>
          
          {/* Alpha Badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center px-3 py-1 rounded-lg border border-orange-300 shadow-lg">
              <span className="text-orange-300 text-sm font-bold tracking-wider" style={{ fontFamily: 'Verdana, sans-serif' }}>
                ALPHA
              </span>
            </div>
          </div>
          
          <p className="hidden md:block text-lg md:text-2xl text-blue-200 mb-2 drop-shadow-lg">
            Survive the Endless Deep
          </p>
        </div>

        {/* Controls & Objectives Card */}
        <div className="bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 mb-8 max-w-2xl w-full" style={{ fontFamily: 'Verdana, sans-serif' }}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Controls */}
            <div>
              <h3 className="text-lg md:text-xl font-bold text-cyan-300 mb-3 flex items-center">
                Controls
              </h3>
              {isMobile ? (
                <div className="space-y-2 text-xs md:text-sm text-gray-300">
                  <p><span className="text-blue-400 font-mono text-xs md:text-sm">Touch</span> - Left/right side of screen to move</p>
                  <p><span className="text-blue-400 font-mono text-xs md:text-sm">⚡</span> - Echolocation pulse button</p>
                </div>
              ) : (
                <div className="space-y-2 text-xs md:text-sm text-gray-300">
                  <p><span className="text-blue-400 font-mono text-xs md:text-sm">A/D or ←/→</span> - Move horizontally</p>
                  <p><span className="text-blue-400 font-mono text-xs md:text-sm">Spacebar</span> - Echolocation pulse</p>
                  <p className="text-gray-400 italic">Use keyboard controls</p>
                </div>
              )}
            </div>

            {/* Objectives */}
            <div>
              <h3 className="text-lg md:text-xl font-bold text-cyan-300 mb-3 flex items-center">
                Objectives
              </h3>
              <div className="space-y-2 text-xs md:text-sm text-gray-300">
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
        {isMobile && !MOBILE_SUPPORT_ENABLED ? (
          /* Mobile Coming Soon Message */
          <div className="w-full max-w-md text-center">
            <div className="px-6">
              <h3 className="text-2xl font-bold text-orange-300" style={{ fontFamily: 'Chewy, cursive' }}>
                Coming Soon to Mobile
              </h3>
            </div>
          </div>
        ) : (
          /* Regular Start Game Button */
          <button
            onClick={() => onStartGame('speedrun')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-full text-lg md:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl border border-purple-400/50 max-w-md"
            style={{ fontFamily: 'Chewy, cursive' }}
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl">Explore the abyss</div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};