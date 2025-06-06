import Phaser from 'phaser';

interface Prey {
  sprite: Phaser.GameObjects.Sprite;
  type: 'small' | 'medium' | 'large';
  visible: boolean;
  visibilityTimer: number;
  collected: boolean;
}

interface Mine {
  sprite: Phaser.GameObjects.Sprite;
  glowSprite: Phaser.GameObjects.Sprite;
  velocityX: number;
  velocityY: number;
  changeDirectionTimer: number;
  exploded: boolean;
}

interface Particle {
  sprite: Phaser.GameObjects.Sprite;
  speed: number;
}

export class GameScene extends Phaser.Scene {
  private anglerfish!: Phaser.GameObjects.Container;
  private anglerfishBody!: Phaser.GameObjects.Sprite;
  private lure!: Phaser.GameObjects.Sprite;
  private lureGlow!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  
  private score = 0;
  private depth = 2000;
  private glowRadius = 60;
  private glowIntensity = 0.3;
  
  private prey: Prey[] = [];
  private mines: Mine[] = [];
  private particles: Particle[] = [];
  private sonarWaves: Phaser.GameObjects.Graphics[] = [];
  
  private scoreText!: Phaser.GameObjects.Text;
  private depthText!: Phaser.GameObjects.Text;
  private instructionsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Create simple colored rectangles as textures
    this.add.graphics()
      .fillStyle(0x4a5568)
      .fillRect(0, 0, 80, 50)
      .generateTexture('anglerfish-body', 80, 50);

    this.add.graphics()
      .fillStyle(0x22d3ee)
      .fillCircle(8, 8, 8)
      .generateTexture('lure', 16, 16);

    this.add.graphics()
      .fillStyle(0x10b981)
      .fillCircle(8, 8, 8)
      .generateTexture('prey-small', 16, 16);

    this.add.graphics()
      .fillStyle(0xf97316)
      .fillRect(0, 0, 24, 16)
      .generateTexture('prey-medium', 24, 16);

    this.add.graphics()
      .fillStyle(0xef4444)
      .fillRect(0, 0, 32, 20)
      .generateTexture('prey-large', 32, 20);

    this.add.graphics()
      .fillStyle(0xef4444)
      .fillCircle(12, 12, 12)
      .generateTexture('mine', 24, 24);

    this.add.graphics()
      .fillStyle(0xd1d5db)
      .fillCircle(2, 2, 2)
      .generateTexture('particle', 4, 4);

    // Create glow texture
    this.add.graphics()
      .fillGradientStyle(0x22d3ee, 0x22d3ee, 0x22d3ee, 0x22d3ee, 0.8, 0.8, 0, 0)
      .fillCircle(50, 50, 50)
      .generateTexture('glow', 100, 100);

    this.add.graphics()
      .fillGradientStyle(0xef4444, 0xef4444, 0xef4444, 0xef4444, 0.6, 0.6, 0, 0)
      .fillCircle(25, 25, 25)
      .generateTexture('mine-glow', 50, 50);
  }

  create() {
    // Set world bounds for infinite scrolling
    this.physics.world.setBounds(0, 0, 1600, 10000);

    // Create background
    this.cameras.main.setBackgroundColor('#000000');

    // Create anglerfish
    this.createAnglerfish();

    // Create initial prey
    this.createInitialPrey();

    // Create initial mines
    this.createInitialMines();

    // Create particles (marine snow)
    this.createParticles();

    // Setup camera to follow anglerfish
    this.cameras.main.startFollow(this.anglerfish, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(200, 100);

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys('W,S,A,D');
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Create UI
    this.createUI();

    // Start game loop
    this.time.addEvent({
      delay: 16,
      callback: this.gameLoop,
      callbackScope: this,
      loop: true
    });
  }

  private createAnglerfish() {
    this.anglerfish = this.add.container(100, 300);
    
    // Main body
    this.anglerfishBody = this.add.sprite(0, 0, 'anglerfish-body');
    this.anglerfishBody.setOrigin(0, 0.5);
    
    // Lure
    this.lure = this.add.sprite(12, -20, 'lure');
    this.lure.setOrigin(0.5);
    
    // Lure glow
    this.lureGlow = this.add.sprite(12, -20, 'glow');
    this.lureGlow.setOrigin(0.5);
    this.lureGlow.setAlpha(this.glowIntensity);
    this.lureGlow.setScale(this.glowRadius / 50);
    
    this.anglerfish.add([this.lureGlow, this.anglerfishBody, this.lure]);
    
    // Enable physics
    this.physics.add.existing(this.anglerfish);
    const body = this.anglerfish.body as Phaser.Physics.Arcade.Body;
    body.setSize(80, 50);
    body.setCollideWorldBounds(false);
  }

  private createInitialPrey() {
    for (let i = 0; i < 200; i++) {
      this.createPrey();
    }
  }

  private createPrey() {
    const types: ('small' | 'medium' | 'large')[] = ['small', 'small', 'small', 'medium', 'medium', 'large'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let textureKey = 'prey-small';
    if (type === 'medium') textureKey = 'prey-medium';
    if (type === 'large') textureKey = 'prey-large';
    
    const sprite = this.add.sprite(
      Math.random() * 1400 + 200,
      Math.random() * 8000 + 100,
      textureKey
    );
    
    sprite.setVisible(false);
    sprite.setAlpha(0);
    
    this.physics.add.existing(sprite);
    
    this.prey.push({
      sprite,
      type,
      visible: false,
      visibilityTimer: 0,
      collected: false
    });
  }

  private createInitialMines() {
    for (let i = 0; i < 50; i++) {
      this.createMine();
    }
  }

  private createMine() {
    const sprite = this.add.sprite(
      Math.random() * 1400 + 200,
      Math.random() * 8000 + 500,
      'mine'
    );
    
    const glowSprite = this.add.sprite(sprite.x, sprite.y, 'mine-glow');
    glowSprite.setAlpha(0.3);
    
    this.physics.add.existing(sprite);
    this.physics.add.existing(glowSprite);
    
    this.mines.push({
      sprite,
      glowSprite,
      velocityX: 0,
      velocityY: 0,
      changeDirectionTimer: Math.random() * 300 + 100,
      exploded: false
    });
  }

  private createParticles() {
    for (let i = 0; i < 50; i++) {
      const sprite = this.add.sprite(
        Math.random() * 1600,
        Math.random() * 2000 - 1000,
        'particle'
      );
      
      sprite.setAlpha(Math.random() * 0.6 + 0.2);
      
      this.particles.push({
        sprite,
        speed: Math.random() * 1 + 0.5
      });
    }
  }

  private createUI() {
    this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
      fontSize: '24px',
      color: '#22d3ee',
      fontFamily: 'Arial'
    }).setScrollFactor(0).setDepth(100);

    this.depthText = this.add.text(20, 50, `Depth: ${Math.floor(this.depth)}m`, {
      fontSize: '16px',
      color: '#9ca3af',
      fontFamily: 'Arial'
    }).setScrollFactor(0).setDepth(100);

    this.instructionsText = this.add.text(this.cameras.main.width - 20, 20, 
      'WASD/Arrows: Swim\nSPACE: Bioluminescence\nAvoid red mines! (-50 points)\nDeep mines move randomly!', {
      fontSize: '14px',
      color: '#22d3ee',
      fontFamily: 'Arial',
      align: 'right'
    }).setScrollFactor(0).setDepth(100).setOrigin(1, 0);
  }

  private gameLoop() {
    this.handleInput();
    this.updateDepth();
    this.updateGlow();
    this.updateParticles();
    this.updatePrey();
    this.updateMines();
    this.updateSonarWaves();
    this.checkCollisions();
    this.spawnNewContent();
    this.updateUI();
  }

  private handleInput() {
    const body = this.anglerfish.body as Phaser.Physics.Arcade.Body;
    
    body.setVelocity(0);
    
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      body.setVelocityX(-200);
      this.anglerfish.setRotation(-0.1);
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      body.setVelocityX(200);
      this.anglerfish.setRotation(0.1);
    } else {
      this.anglerfish.setRotation(0);
    }
    
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      body.setVelocityY(-150);
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      body.setVelocityY(150);
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.triggerBioluminescence();
    }
  }

  private updateDepth() {
    this.depth = 2000 + Math.max(0, this.anglerfish.y - 300);
  }

  private updateGlow() {
    const baseRadius = 60;
    const maxRadius = 200;
    const radiusIncrease = Math.min(140, this.score * 0.5);
    this.glowRadius = baseRadius + radiusIncrease;
    
    const baseIntensity = 0.3;
    const intensityIncrease = Math.min(0.5, this.score * 0.002);
    this.glowIntensity = baseIntensity + intensityIncrease;
    
    this.lureGlow.setScale(this.glowRadius / 50);
    this.lureGlow.setAlpha(this.glowIntensity);
  }

  private updateParticles() {
    this.particles.forEach(particle => {
      particle.sprite.y += particle.speed;
      particle.sprite.x += Math.sin(Date.now() * 0.001) * 0.3;
      
      if (particle.sprite.y > this.cameras.main.scrollY + this.cameras.main.height + 200) {
        particle.sprite.y = this.cameras.main.scrollY - 100;
        particle.sprite.x = Math.random() * 1600;
      }
    });
  }

  private updatePrey() {
    this.prey.forEach(preyItem => {
      if (preyItem.collected) return;
      
      preyItem.visibilityTimer = Math.max(0, preyItem.visibilityTimer - 16);
      
      // Check if prey is within glow radius
      const lureWorldX = this.anglerfish.x + 12;
      const lureWorldY = this.anglerfish.y - 20;
      const distance = Phaser.Math.Distance.Between(
        lureWorldX, lureWorldY,
        preyItem.sprite.x, preyItem.sprite.y
      );
      
      if (distance <= this.glowRadius) {
        preyItem.visible = true;
        preyItem.visibilityTimer = Math.max(preyItem.visibilityTimer, 2000);
      }
      
      // Update visibility
      if (preyItem.visibilityTimer <= 0) {
        preyItem.visible = false;
      }
      
      preyItem.sprite.setVisible(preyItem.visible);
      if (preyItem.visible) {
        const alpha = preyItem.visibilityTimer > 1000 ? 1 : preyItem.visibilityTimer / 1000;
        preyItem.sprite.setAlpha(alpha);
        
        // Add floating animation
        const scale = 0.8 + Math.sin(Date.now() * 0.003 + preyItem.sprite.x) * 0.2;
        preyItem.sprite.setScale(scale);
      }
    });
  }

  private updateMines() {
    this.mines.forEach(mine => {
      if (mine.exploded) return;
      
      // Update glow position
      mine.glowSprite.setPosition(mine.sprite.x, mine.sprite.y);
      
      // Pulsing effect
      const pulse = 0.3 + Math.sin(Date.now() * 0.005) * 0.2;
      mine.glowSprite.setAlpha(pulse);
      mine.sprite.setScale(1 + Math.sin(Date.now() * 0.005) * 0.1);
      
      // Movement for deep mines
      if (this.depth > 3000) {
        mine.changeDirectionTimer -= 16;
        
        if (mine.changeDirectionTimer <= 0) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.3 + 0.1;
          mine.velocityX = Math.cos(angle) * speed;
          mine.velocityY = Math.sin(angle) * speed;
          mine.changeDirectionTimer = Math.random() * 400 + 200;
        }
        
        mine.sprite.x += mine.velocityX;
        mine.sprite.y += mine.velocityY;
        
        // Boundary checks
        if (mine.sprite.x < 100 || mine.sprite.x > 1500) {
          mine.velocityX *= -1;
        }
        if (mine.sprite.y < this.anglerfish.y - 500 || mine.sprite.y > this.anglerfish.y + 1000) {
          mine.velocityY *= -1;
        }
        
        mine.sprite.x = Phaser.Math.Clamp(mine.sprite.x, 100, 1500);
        mine.sprite.y = Math.max(500, mine.sprite.y);
      }
    });
  }

  private updateSonarWaves() {
    this.sonarWaves = this.sonarWaves.filter(wave => {
      wave.clear();
      
      const radius = wave.getData('radius') + 6;
      const opacity = Math.max(0, wave.getData('opacity') - 0.025);
      
      if (opacity <= 0) {
        wave.destroy();
        return false;
      }
      
      wave.setData('radius', radius);
      wave.setData('opacity', opacity);
      
      wave.lineStyle(2, 0x22d3ee, opacity);
      wave.strokeCircle(wave.getData('x'), wave.getData('y'), radius);
      
      // Check prey visibility
      this.prey.forEach(preyItem => {
        const distance = Phaser.Math.Distance.Between(
          wave.getData('x'), wave.getData('y'),
          preyItem.sprite.x, preyItem.sprite.y
        );
        if (distance <= radius && distance >= radius - 15) {
          preyItem.visible = true;
          preyItem.visibilityTimer = 4000;
        }
      });
      
      return true;
    });
  }

  private triggerBioluminescence() {
    const lureWorldX = this.anglerfish.x + 12;
    const lureWorldY = this.anglerfish.y - 20;
    
    const wave = this.add.graphics();
    wave.setData('x', lureWorldX);
    wave.setData('y', lureWorldY);
    wave.setData('radius', 0);
    wave.setData('opacity', 1);
    
    this.sonarWaves.push(wave);
  }

  private checkCollisions() {
    // Check prey collisions
    this.prey.forEach(preyItem => {
      if (!preyItem.collected && preyItem.visible) {
        const distance = Phaser.Math.Distance.Between(
          this.anglerfish.x + 40, this.anglerfish.y + 25,
          preyItem.sprite.x, preyItem.sprite.y
        );
        
        if (distance < 35) {
          const points = preyItem.type === 'large' ? 25 : preyItem.type === 'medium' ? 15 : 10;
          this.score += points;
          preyItem.collected = true;
          preyItem.sprite.setVisible(false);
        }
      }
    });
    
    // Check mine collisions
    this.mines.forEach(mine => {
      if (!mine.exploded) {
        const distance = Phaser.Math.Distance.Between(
          this.anglerfish.x + 40, this.anglerfish.y + 25,
          mine.sprite.x, mine.sprite.y
        );
        
        if (distance < 45) {
          this.score = Math.max(0, this.score - 50);
          mine.exploded = true;
          mine.sprite.setVisible(false);
          mine.glowSprite.setVisible(false);
        }
      }
    });
  }

  private spawnNewContent() {
    // Spawn new prey
    const deepestPrey = Math.max(...this.prey.map(p => p.sprite.y));
    if (this.anglerfish.y > deepestPrey - 500 && this.prey.length < 400) {
      for (let i = 0; i < 20; i++) {
        this.createPrey();
        const newPrey = this.prey[this.prey.length - 1];
        newPrey.sprite.y = deepestPrey + Math.random() * 500 + 200;
      }
    }
    
    // Spawn new mines
    const deepestMine = Math.max(...this.mines.map(m => m.sprite.y));
    if (this.anglerfish.y > deepestMine - 800 && this.mines.length < 100) {
      for (let i = 0; i < 8; i++) {
        this.createMine();
        const newMine = this.mines[this.mines.length - 1];
        newMine.sprite.y = deepestMine + Math.random() * 600 + 300;
      }
    }
  }

  private updateUI() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.depthText.setText(`Depth: ${Math.floor(this.depth)}m\nLight Radius: ${Math.floor(this.glowRadius)}px`);
  }
}