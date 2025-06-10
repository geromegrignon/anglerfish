import React from 'react';
import { GameMode, DeathCause } from '../types/game';

// Force viewport height calculation on mobile
const setVH = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

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

  const finalScore = Math.floor(maxDepthReached);
  const timeMinutes = Math.floor(survivalTime / 60000);
  const timeSeconds = Math.floor((survivalTime % 60000) / 1000);

  const getDeathMessage = () => {
    switch (deathCause) {
      case 'starvation':
        return {
          title: 'STARVED',
          subtitle: 'The Hunger Consumed You',
          description: 'Your bioluminescent lure dimmed as starvation claimed you in the endless depths.',
          color: 'red'
        };
      case 'mines':
        return {
          title: 'DESTROYED',
          subtitle: 'Torn Apart by Explosives',
          description: 'The deep sea mines proved too deadly for even an apex predator like you.',
          color: 'orange'
        };
      default:
        return {
          title: 'PERISHED',
          subtitle: 'The Abyss Claims Another',
          description: 'The endless darkness has swallowed another hunter.',
          color: 'red'
        };
    }
  };

  const deathMessage = getDeathMessage();

  return (
    <div 
      className="w-full bg-gradient-to-b from-gray-900 via-red-900 to-black relative overflow-hidden" 
      style={{ 
        height: '100vh',
        height: 'calc(var(--vh, 1vh) * 100)',
        minHeight: '100vh',
        minHeight: 'calc(var(--vh, 1vh) * 100)'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating debris/remains */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`debris-${i}`}
            className="absolute opacity-20"
            style={{
              left: '-60px',
              top: `${Math.random() * 80 + 10}%`,
              animationName: 'swimAcross',
              animationDuration: `${Math.random() * 20 + 15}s`,
              animationDelay: `${Math.random() * 10}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear'
            }}
          >
            <img 
              src="/mine.svg" 
              alt="debris" 
              className="w-6 h-6"
              style={{
                filter: `drop-shadow(0 0 4px rgba(239, 68, 68, 0.6)) brightness(0.6)`,
                transform: Math.random() > 0.5 ? 'scaleX(-1)' : 'none'
              }}
            />
          </div>
        ))}

        {/* Sinking particles */}
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className={`absolute w-1 h-1 rounded-full opacity-40 ${
              deathMessage.color === 'orange' ? 'bg-orange-200' : 'bg-red-200'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationName: 'floatDown',
              animationDuration: `${Math.random() * 12 + 8}s`,
              animationDelay: `${Math.random() * 5}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear'
            }}
          />
        ))}

        {/* Dimming bioluminescent lights */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`light-${i}`}
            className={`absolute w-2 h-2 rounded-full ${
              deathMessage.color === 'orange' ? 'bg-orange-300' : 'bg-red-300'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationName: 'dimTwinkle',
              animationDuration: `${Math.random() * 4 + 3}s`,
              animationDelay: `${Math.random() * 2}s`,
              animationIterationCount: 'infinite'
            }}
          />
        ))}

        {/* Death-themed background glow */}
        <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`glow-${i}`}
              className={`absolute rounded-full animate-pulse ${
                deathMessage.color === 'orange' ? 'bg-orange-900' : 'bg-red-900'
              } opacity-10`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 400 + 200}px`,
                height: `${Math.random() * 400 + 200}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 md:p-8">
        {/* Death Icon/Symbol */}
        <div className="relative mb-8">
          <div className="relative">
            {/* Fading anglerfish with death effect */}
            <img
              src="/anglerfish.svg"
              alt="Fallen Anglerfish"
              className="w-24 h-18 md:w-32 md:h-24 relative z-10 opacity-60"
              style={{
                filter: `drop-shadow(0 0 20px rgba(${deathMessage.color === 'orange' ? '251, 146, 60' : '239, 68, 68'}, 0.8)) brightness(0.5) grayscale(0.7)`,
                animation: 'fadeFloat 6s ease-in-out infinite',
                transform: 'rotate(25deg)' // Tilted to suggest death
              }}
            />
            
            {/* Dimmed lure */}
            <div
              className={`absolute w-2 h-2 rounded-full animate-pulse ${
                deathMessage.color === 'orange' ? 'bg-orange-400' : 'bg-red-400'
              } opacity-30`}
              style={{
                left: '140px',
                top: '25px',
                boxShadow: `0 0 8px rgba(${deathMessage.color === 'orange' ? '251, 146, 60' : '239, 68, 68'}, 0.6)`,
                animationDuration: '3s'
              }}
            />
            
            {/* Fading particles around the anglerfish */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`death-trail-${i}`}
                className={`absolute w-1 h-1 rounded-full opacity-30 ${
                  deathMessage.color === 'orange' ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{
                  left: `${100 - i * 20}px`,
                  top: `${35 + Math.sin(i) * 10}px`,
                  animationName: 'deathTrailPulse',
                  animationDuration: '4s',
                  animationDelay: `${i * 0.5}s`,
                  animationIterationCount: 'infinite',
                  filter: 'blur(0.5px)'
                }}
              />
            ))}
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className={`text-4xl md:text-8xl font-bold mb-4 drop-shadow-2xl animate-pulse ${
            deathMessage.color === 'orange' ? 'text-orange-400' : 'text-red-400'
          }`} style={{ fontFamily: 'Chewy, cursive' }}>
            {deathMessage.title}
          </h1>
          
          <h2 className={`text-2xl md:text-3xl mb-4 drop-shadow-md ${
            deathMessage.color === 'orange' ? 'text-orange-300' : 'text-red-300'
          }`} style={{ fontFamily: 'Chewy, cursive' }}>
            {deathMessage.subtitle}
          </h2>
          
          <p className="text-base md:text-lg text-gray-300 mb-6 max-w-md mx-auto italic" style={{ fontFamily: 'Verdana, sans-serif' }}>
            {deathMessage.description}
          </p>
        </div>

        {/* Stats Card - matching landing page style */}
        <div className="bg-black/40 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 mb-8 max-w-md w-full" style={{ fontFamily: 'Verdana, sans-serif' }}>
          <h3 className="text-lg md:text-xl font-bold text-cyan-300 mb-4 text-center">
            Final Statistics
          </h3>
          
          <div className="space-y-3 text-center">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm md:text-base">Maximum Depth:</span>
              <span className="text-blue-400 font-semibold text-sm md:text-base">{finalScore.toLocaleString()}m</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm md:text-base">Survival Time:</span>
              <span className="text-green-400 font-semibold text-sm md:text-base">{timeMinutes}m {timeSeconds}s</span>
            </div>
            
            <div className="pt-2 border-t border-gray-600">
              <span className={`text-sm font-bold ${
                deathMessage.color === 'orange' ? 'text-orange-300' : 'text-red-300'
              }`}>
                Cause of Death: {deathMessage.title}
              </span>
            </div>
          </div>
        </div>

        {/* Restart Button - matching landing page style */}
        <button
          onClick={() => onRestart('speedrun')}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-full text-lg md:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl border border-purple-400/50 max-w-md"
          style={{ fontFamily: 'Chewy, cursive' }}
        >
          <div className="text-center">
            <div className="text-xl md:text-2xl">Return to the Abyss</div>
            <div className="text-sm md:text-base opacity-80">Hunt Again</div>
          </div>
        </button>
      </div>
    </div>
  );
};