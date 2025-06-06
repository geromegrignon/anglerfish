import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Add floating particles for atmosphere
    this.createFloatingParticles();

    // Title
    const title = this.add.text(width / 2, height / 3, 'ABYSS', {
      fontSize: '72px',
      color: '#22d3ee',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const subtitle = this.add.text(width / 2, height / 3 + 80, 'HUNTER', {
      fontSize: '48px',
      color: '#06b6d4',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const tagline = this.add.text(width / 2, height / 3 + 140, 'Deep Ocean Predator', {
      fontSize: '18px',
      color: '#6b7280',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Instructions
    const instructions = [
      '🌊 2000m below surface',
      '',
      'Use WASD or Arrow Keys to swim',
      'Press SPACE for bioluminescent pulse',
      'Hunt prey in the eternal darkness',
      '',
      'Only your light reveals what lurks in the abyss...'
    ];

    const instructionText = this.add.text(width / 2, height / 2 + 50, instructions.join('\n'), {
      fontSize: '16px',
      color: '#d1d5db',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.text(width / 2, height - 150, 'Descend into Darkness', {
      fontSize: '24px',
      color: '#000000',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      backgroundColor: '#22d3ee',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    startButton.setInteractive({ useHandCursor: true });
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    startButton.on('pointerover', () => {
      startButton.setScale(1.05);
      startButton.setBackgroundColor('#06b6d4');
    });

    startButton.on('pointerout', () => {
      startButton.setScale(1);
      startButton.setBackgroundColor('#22d3ee');
    });

    // Pulsing effects
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.7 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createFloatingParticles() {
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Math.random() * this.cameras.main.width,
        Math.random() * this.cameras.main.height,
        Math.random() * 3 + 1,
        0x6b7280,
        0.3
      );

      this.tweens.add({
        targets: particle,
        y: particle.y + Math.random() * 200 - 100,
        x: particle.x + Math.random() * 100 - 50,
        alpha: { from: 0.3, to: 0.1 },
        duration: Math.random() * 3000 + 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
}