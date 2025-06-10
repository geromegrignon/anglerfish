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
        <>
          {/* Echolocation Button - Sticky in bottom right */}
          <button
            className="fixed w-16 h-16 border-2 border-cyan-400/70 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center active:bg-cyan-400/30 transition-all duration-150 touch-manipulation z-50 shadow-lg"
            style={{
              right: '20px',
              bottom: '80px',
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
        </>
      )}
    </>
  );
};