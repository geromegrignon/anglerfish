import { useCallback, useRef } from "react";

interface UseTouchMovementProps {
  setKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
  setAnglerfishPos: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
}

export const useTouchMovement = ({
  setKeys,
  setAnglerfishPos,
}: UseTouchMovementProps) => {
  const lastTouchPositionRef = useRef<{ x: number; y: number } | null>(null);
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
      const touch = e.touches[0];
      const touchX = touch.clientX;
      const screenWidth = window.innerWidth;

      // Calculate the target position for the anglerfish
      // The anglerfish should be centered on the touch position
      const targetX = Math.max(0, Math.min(screenWidth - 80, touchX - 40));

      // Update anglerfish position directly
      setAnglerfishPos((prev) => ({
        ...prev,
        x: targetX,
      }));
    },
    [setAnglerfishPos]
  );

  const handleGameTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const touchX = touch.clientX;
      const screenWidth = window.innerWidth;

      // Store initial touch position and time
      touchStartTimeRef.current = Date.now();
      touchStartPositionRef.current = { x: touchX, y: touch.clientY };
      lastTouchPositionRef.current = { x: touchX, y: touch.clientY };

      // Clear previous movement
      clearMovementKeys();

      // Set initial anglerfish position
      const targetX = Math.max(0, Math.min(screenWidth - 80, touchX - 40));
      setAnglerfishPos((prev) => ({
        ...prev,
        x: targetX,
      }));
    },
    [clearMovementKeys, setAnglerfishPos]
  );

  const handleGameTouchEnd = useCallback(
    (e: React.TouchEvent) => {
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
