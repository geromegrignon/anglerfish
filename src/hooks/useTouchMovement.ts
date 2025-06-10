import { useCallback, useRef } from 'react';

interface UseTouchMovementProps {
  setKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const useTouchMovement = ({ setKeys }: UseTouchMovementProps) => {
  const lastTouchPositionRef = useRef<{ x: number; y: number } | null>(null);
  const stationaryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const movementThreshold = 5; // pixels
  const stationaryDelay = 150; // milliseconds

  const clearMovementKeys = useCallback(() => {
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete('arrowleft');
      newKeys.delete('arrowright');
      return newKeys;
    });
  }, [setKeys]);

  const handleGameTouchMove = useCallback((e: React.TouchEvent) => {
    // Only handle touch movement on mobile devices
    if (window.innerWidth >= 768) return;
    
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    
    // Check if touch has moved significantly
    if (lastTouchPositionRef.current) {
      const deltaX = Math.abs(touchX - lastTouchPositionRef.current.x);
      const deltaY = Math.abs(touchY - lastTouchPositionRef.current.y);
      const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // If touch hasn't moved much, don't update movement
      if (totalMovement < movementThreshold) {
        // Clear any existing timer and start a new one
        if (stationaryTimerRef.current) {
          clearTimeout(stationaryTimerRef.current);
        }
        
        stationaryTimerRef.current = setTimeout(() => {
          clearMovementKeys();
        }, stationaryDelay);
        
        return;
      }
    }
    
    // Clear stationary timer since we're moving
    if (stationaryTimerRef.current) {
      clearTimeout(stationaryTimerRef.current);
      stationaryTimerRef.current = null;
    }
    
    // Update last touch position
    lastTouchPositionRef.current = { x: touchX, y: touchY };
    
    // Clear previous movement keys first
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete('arrowleft');
      newKeys.delete('arrowright');
      
      // Add new direction based on current touch position
      if (touchX < screenWidth / 2) {
        // Left side of screen - move left
        newKeys.add('arrowleft');
      } else {
        // Right side of screen - move right
        newKeys.add('arrowright');
      }
      
      return newKeys;
    });
  }, [setKeys, clearMovementKeys]);

  const handleGameTouchStart = useCallback((e: React.TouchEvent) => {
    // Only handle touch movement on mobile devices
    if (window.innerWidth >= 768) return;
    
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    
    // Store initial touch position
    lastTouchPositionRef.current = { x: touchX, y: touchY };
    
    // Clear any existing stationary timer
    if (stationaryTimerRef.current) {
      clearTimeout(stationaryTimerRef.current);
      stationaryTimerRef.current = null;
    }
    
    // Clear previous movement and set new direction
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete('arrowleft');
      newKeys.delete('arrowright');
      
      // Divide screen into left and right halves
      if (touchX < screenWidth / 2) {
        // Left side of screen - move left
        newKeys.add('arrowleft');
      } else {
        // Right side of screen - move right
        newKeys.add('arrowright');
      }
      
      return newKeys;
    });
  }, [setKeys]);

  const handleGameTouchEnd = useCallback((e: React.TouchEvent) => {
    // Only handle touch movement on mobile devices
    if (window.innerWidth >= 768) return;
    
    // Clear stationary timer
    if (stationaryTimerRef.current) {
      clearTimeout(stationaryTimerRef.current);
      stationaryTimerRef.current = null;
    }
    
    // Reset touch position tracking
    lastTouchPositionRef.current = null;
    
    // Stop all movement when touch ends
    clearMovementKeys();
  }, [clearMovementKeys]);

  return {
    handleGameTouchStart,
    handleGameTouchMove,
    handleGameTouchEnd
  };
};