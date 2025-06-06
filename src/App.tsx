import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from './game/GameConfig';

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = new Phaser.Game({
        ...gameConfig,
        parent: containerRef.current
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      <div ref={containerRef} id="game-container" className="w-full h-full" />
    </div>
  );
}

export default App;