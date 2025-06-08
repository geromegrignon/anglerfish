import React from 'react';
import { Zap } from 'lucide-react';
import { JoystickState } from '../types/game';

interface VirtualJoystickProps {
  joystick: JoystickState;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onEcholocationPress: () => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  joystick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onMouseDown,
  onEcholocationPress
}) => {
  return (
    <div className="md:hidden">
      {/* Movement Joystick */}
      <div
        className="absolute w-20 h-20 border-2 border-white/30 rounded-full bg-black/20 backdrop-blur-sm"
        style={{
          left: `${joystick.centerX - 40}px`,
          top: `${joystick.centerY - 40}px`,
        }}
      >
        <div
          className="absolute w-8 h-8 bg-white/60 rounded-full transition-all duration-75"
          style={{
            left: `${joystick.knobX - joystick.centerX + 40 - 16}px`,
            top: `${joystick.knobY - joystick.centerY + 40 - 16}px`,
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        />
      </div>

      {/* Echolocation Button */}
      <button
        className="absolute w-16 h-16 border-2 border-cyan-400/50 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:bg-cyan-400/20 transition-all duration-150"
        style={{
          right: '20px',
          bottom: '120px',
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          onEcholocationPress();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          onEcholocationPress();
        }}
      >
        <Zap className="w-6 h-6 text-cyan-300" />
      </button>
    </div>
  );
};