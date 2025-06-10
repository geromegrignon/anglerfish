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
          <div className="absolute pointer-events-auto">
        {/* Left Movement Button */}
        <button
          className="fixed w-16 h-16 border-2 border-white/50 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center active:bg-white/30 transition-all duration-150 touch-manipulation z-40"
          style={{
            left: '20px',
            bottom: '120px',
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Simulate left arrow key
            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(event);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            window.dispatchEvent(event);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(event);
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            window.dispatchEvent(event);
          }}
          onMouseLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            window.dispatchEvent(event);
          }}
        >
          <span className="text-white text-xl font-bold">←</span>
        </button>
        
        {/* Right Movement Button */}
        <button
          className="fixed w-16 h-16 border-2 border-white/50 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center active:bg-white/30 transition-all duration-150 touch-manipulation z-40"
          style={{
            left: '100px',
            bottom: '120px',
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            window.dispatchEvent(event);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new KeyboardEvent('keyup', { key: 'ArrowRight' });
            window.dispatchEvent(event);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            window.dispatchEvent(event);
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new KeyboardEvent('keyup', { key: 'ArrowRight' });
            window.dispatchEvent(event);
          }}
          onMouseLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new KeyboardEvent('keyup', { key: 'ArrowRight' });
            window.dispatchEvent(event);
          }}
        >
          <span className="text-white text-xl font-bold">→</span>
        </button>

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