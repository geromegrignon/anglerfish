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
  return (
    <div className="md:hidden">
      {/* Left/Right Controls */}
      <button
        className="absolute w-16 h-16 border-2 border-white/30 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:bg-white/20 transition-all duration-150"
        style={{
          left: '20px',
          bottom: '120px',
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          // Simulate left arrow key
          const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
          window.dispatchEvent(event);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          const event = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
          window.dispatchEvent(event);
        }}
      >
        <span className="text-white text-xl">←</span>
      </button>
      
      <button
        className="absolute w-16 h-16 border-2 border-white/30 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:bg-white/20 transition-all duration-150"
        style={{
          left: '100px',
          bottom: '120px',
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
          window.dispatchEvent(event);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          const event = new KeyboardEvent('keyup', { key: 'ArrowRight' });
          window.dispatchEvent(event);
        }}
      >
        <span className="text-white text-xl">→</span>
      </button>

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