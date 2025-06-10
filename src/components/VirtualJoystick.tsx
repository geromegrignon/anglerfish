import React from 'react';
import { Zap } from 'lucide-react';
import { JoystickState, GameMode } from '../types/game';

interface VirtualJoystickProps {
  gameMode: GameMode;
  joystick: JoystickState;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onEcholocationPress: () => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  gameMode,
  joystick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onMouseDown,
  onEcholocationPress
}) => {
  // Force mobile detection
  const isMobile = window.innerWidth < 768;
  
  return (
    <>
      {/* Mobile Controls - Show on mobile devices */}
      {isMobile && (
        <div className="fixed inset-0 pointer-events-none z-30">
          {/* Touch zones for movement indication */}
          <div className="absolute inset-0 flex">
            {/* Left touch zone indicator */}
            <div className="flex-1 flex items-center justify-center pointer-events-none">
              <div className="text-white/30 text-6xl font-bold">←</div>
            </div>
            {/* Right touch zone indicator */}
            <div className="flex-1 flex items-center justify-center pointer-events-none">
              <div className="text-white/30 text-6xl font-bold">→</div>
            </div>
          </div>
          
          <div className="absolute pointer-events-auto">

            {/* Echolocation Button */}
            <button
              className="fixed w-16 h-16 border-2 border-cyan-400/70 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center active:bg-cyan-400/30 transition-all duration-150 touch-manipulation z-40"
              style={{
                right: '20px',
                bottom: '120px',
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEcholocationPress();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEcholocationPress();
              }}
            >
              <Zap className="w-6 h-6 text-cyan-300" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};