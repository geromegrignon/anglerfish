import React from 'react';
import { JoystickState } from '../types/game';

interface VirtualJoystickProps {
  joystick: JoystickState;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  joystick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onMouseDown
}) => {
  return (
    <div className="md:hidden">
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
    </div>
  );
};