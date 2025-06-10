import { useCallback } from 'react';

interface UseTouchMovementProps {
  setKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const useTouchMovement = ({ setKeys }: UseTouchMovementProps) => {
  const handleGameTouchMove = useCallback((e: React.TouchEvent) => {
    // Only handle touch movement on mobile devices
    if (window.innerWidth >= 768) return;
    
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;
    const touchX = touch.clientX;
    
    // Clear previous movement keys first
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete('arrowleft');
      newKeys.delete('arrowright');
      
      // Add new direction based on current touch position
      if (touchX < screenWidth / 2) {
        // Left side of screen - move right
        newKeys.add('arrowright');
      } else {
        // Right side of screen - move left
        newKeys.add('arrowleft');
      }
      
      return newKeys;
    });
  }, [setKeys]);

  const handleGameTouchStart = useCallback((e: React.TouchEvent) => {
    // Only handle touch movement on mobile devices
    if (window.innerWidth >= 768) return;
    
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;
    const touchX = touch.clientX;
    
    // Clear previous movement and set new direction
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete('arrowleft');
      newKeys.delete('arrowright');
      
      // Divide screen into left and right halves
      if (touchX < screenWidth / 2) {
        // Left side of screen - move right
        newKeys.add('arrowright');
      } else {
        // Right side of screen - move left
        newKeys.add('arrowleft');
      }
      
      return newKeys;
    });
  }, [setKeys]);

  const handleGameTouchEnd = useCallback((e: React.TouchEvent) => {
    // Only handle touch movement on mobile devices
    if (window.innerWidth >= 768) return;
    
    // Stop all movement when touch ends
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete('arrowleft');
      newKeys.delete('arrowright');
      return newKeys;
    });
  }, [setKeys]);

  return {
    handleGameTouchStart,
    handleGameTouchMove,
    handleGameTouchEnd
  };
};