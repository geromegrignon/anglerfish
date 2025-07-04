import { useCallback, useEffect } from 'react';
import { JoystickState } from '../types/game';

interface UseJoystickProps {
  joystick: JoystickState;
  setJoystick: React.Dispatch<React.SetStateAction<JoystickState>>;
  onEcholocation: () => void;
}

export const useJoystick = ({ joystick, setJoystick, onEcholocation }: UseJoystickProps) => {
  // Update joystick center position on window resize
  useEffect(() => {
    const handleResize = () => {
      setJoystick(prev => ({
        ...prev,
        centerY: window.innerHeight - 120,
        knobY: prev.active ? prev.knobY : window.innerHeight - 120
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setJoystick]);

  const handleJoystickStart = useCallback((clientX: number, clientY: number) => {
    setJoystick(prev => ({
      ...prev,
      active: true,
      knobX: clientX,
      knobY: clientY
    }));
  }, [setJoystick]);

  const handleJoystickMove = useCallback((clientX: number, clientY: number) => {
    setJoystick(prev => {
      if (!prev.active) return prev;

      const deltaX = clientX - prev.centerX;
      // Only track horizontal movement
      const distance = Math.abs(deltaX);
      const maxDistance = 40;

      let newKnobX = clientX;
      const newKnobY = prev.centerY; // Keep Y position fixed
      let normalizedDeltaX = deltaX;
      let normalizedDeltaY = 0; // No vertical movement

      if (distance > maxDistance) {
        // Clamp horizontal movement only
        newKnobX = prev.centerX + (deltaX > 0 ? maxDistance : -maxDistance);
        normalizedDeltaX = deltaX > 0 ? maxDistance : -maxDistance;
      }

      return {
        ...prev,
        knobX: newKnobX,
        knobY: newKnobY,
        deltaX: normalizedDeltaX / maxDistance,
        deltaY: 0 // No vertical movement
      };
    });
  }, [setJoystick]);

  const handleJoystickEnd = useCallback(() => {
    setJoystick(prev => ({
      ...prev,
      active: false,
      knobX: prev.centerX,
      knobY: prev.centerY,
      deltaX: 0,
      deltaY: 0
    }));
  }, [setJoystick]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleJoystickStart(touch.clientX, touch.clientY);
  }, [handleJoystickStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleJoystickMove(touch.clientX, touch.clientY);
    }
  }, [handleJoystickMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleJoystickEnd();
  }, [handleJoystickEnd]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleJoystickStart(e.clientX, e.clientY);
  }, [handleJoystickStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleJoystickMove(e.clientX, e.clientY);
  }, [handleJoystickMove]);

  const handleMouseUp = useCallback(() => {
    handleJoystickEnd();
  }, [handleJoystickEnd]);

  const handleEcholocationPress = useCallback(() => {
    onEcholocation();
  }, [onEcholocation]);
  // Add mouse event listeners when joystick is active
  useEffect(() => {
    if (joystick.active) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [joystick.active, handleMouseMove, handleMouseUp]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleEcholocationPress
  };
};