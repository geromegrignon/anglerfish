import { useCallback, useRef } from "react";

interface UseTouchMovementProps {
  setKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const useTouchMovement = ({ setKeys }: UseTouchMovementProps) => {
  const lastTouchPositionRef = useRef<{ x: number; y: number } | null>(null);
  const movementThreshold = 3; // Reduced from 5 to make it more responsive
  const touchStartTimeRef = useRef<number>(0);
  const touchStartPositionRef = useRef<{ x: number; y: number } | null>(null);

  const clearMovementKeys = useCallback(() => {
    setKeys((prev) => {
      const newKeys = new Set(prev);
      newKeys.delete("arrowleft");
      newKeys.delete("arrowright");
      return newKeys;
    });
  }, [setKeys]);

  const handleGameTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // Only handle touch movement on mobile devices
      if (window.innerWidth >= 768) return;

      const touch = e.touches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      // If this is the first move after touch start, initialize the reference
      if (!lastTouchPositionRef.current) {
        lastTouchPositionRef.current = { x: touchX, y: touchY };
        return;
      }

      // Calculate movement delta
      const deltaX = touchX - lastTouchPositionRef.current.x;
      const deltaY = touchY - lastTouchPositionRef.current.y;

      // Update last position
      lastTouchPositionRef.current = { x: touchX, y: touchY };

      // Only process movement if it's significant enough
      if (Math.abs(deltaX) < movementThreshold) return;

      // Clear previous movement keys
      setKeys((prev) => {
        const newKeys = new Set(prev);
        newKeys.delete("arrowleft");
        newKeys.delete("arrowright");

        // Add new direction based on movement
        if (deltaX < 0) {
          newKeys.add("arrowleft");
        } else {
          newKeys.add("arrowright");
        }

        return newKeys;
      });
    },
    [setKeys]
  );

  const handleGameTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Only handle touch movement on mobile devices
      if (window.innerWidth >= 768) return;

      const touch = e.touches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      // Store initial touch position and time
      touchStartTimeRef.current = Date.now();
      touchStartPositionRef.current = { x: touchX, y: touchY };
      lastTouchPositionRef.current = { x: touchX, y: touchY };

      // Clear previous movement
      clearMovementKeys();
    },
    [clearMovementKeys]
  );

  const handleGameTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      // Only handle touch movement on mobile devices
      if (window.innerWidth >= 768) return;

      // Reset all touch tracking
      lastTouchPositionRef.current = null;
      touchStartPositionRef.current = null;

      // Stop all movement
      clearMovementKeys();
    },
    [clearMovementKeys]
  );

  return {
    handleGameTouchStart,
    handleGameTouchMove,
    handleGameTouchEnd,
  };
};
