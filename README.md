# 🐟 Angularfish - Deep Sea Survival Game

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

> **Alpha Version** - An atmospheric deep-sea survival game where you play as a bioluminescent anglerfish navigating the endless abyss.

## 🌊 About

Angularfish is an open-source browser-based survival game that immerses players in the mysterious depths of the ocean. As a bioluminescent anglerfish, you must hunt prey, avoid deadly mines and traps, and survive as long as possible while automatically descending into the endless abyss.

### 🎮 Gameplay Features

- **Atmospheric Deep-Sea Environment**: Experience the haunting beauty of the ocean depths with dynamic lighting and particle effects
- **Bioluminescent Mechanics**: Use your natural light to hunt prey and navigate the darkness
- **Echolocation System**: Send out sonar waves to reveal hidden prey in the darkness
- **Survival Elements**: Manage hunger while avoiding environmental hazards
- **Progressive Difficulty**: The deeper you go, the more dangerous it becomes
- **Power-ups**: Collect light bonuses and electric field abilities
- **Mobile-Optimized**: Responsive design with touch controls for mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/angularfish.git
   cd angularfish
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to play the game

### Building for Production

```bash
npm run build
npm run preview
```

## 🎯 How to Play

### Controls

**Desktop:**
- `←/→ Arrow Keys` - Move horizontally
- `Spacebar` - Echolocation pulse (reveals nearby prey)

**Mobile:**
- Touch left/right side of screen to move
- Tap the ⚡ button for echolocation

### Objectives

1. **Hunt Prey** - Catch fish to maintain your hunger meter
2. **Avoid Hazards** - Stay away from explosive mines and net traps
3. **Collect Power-ups** - Grab light bonuses for better vision and electric bonuses for protection
4. **Survive & Descend** - The game automatically scrolls downward - survive as long as possible
5. **Reach Maximum Depth** - Challenge yourself to reach the deepest parts of the abyss

### Game Elements

- 🐟 **Prey Fish** - Restore hunger when caught (must be visible in your light)
- 💡 **Light Bonuses** - Temporarily increase your bioluminescent range
- ⚡ **Electric Bonuses** - Create a protective electric field that destroys nearby mines
- 💣 **Mines** - Explosive hazards that damage you on contact
- 🕸️ **Net Traps** - Slow you down temporarily when triggered
- 🌊 **Bioluminescent Particles** - Atmospheric plankton that light up the depths

## 🛠️ Technical Architecture

### Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React for consistent iconography
- **Performance**: Optimized for 60fps gameplay with mobile considerations

### Project Structure

```
src/
├── components/           # React components
│   ├── GameEntities.tsx     # Renders all game objects
│   ├── GameOverScreen.tsx   # Death/restart screen
│   ├── GameUI.tsx          # HUD and status displays
│   ├── LandingScreen.tsx   # Main menu
│   └── VirtualJoystick.tsx # Mobile touch controls
├── hooks/               # Custom React hooks
│   ├── useGameLogic.ts     # Core game state management
│   ├── useGameLoop.ts      # Main game loop and physics
│   ├── useGameInitialization.ts # Entity spawning
│   ├── useJoystick.ts      # Touch/mouse input handling
│   ├── useKeyboard.ts      # Keyboard input
│   └── useTouchMovement.ts # Mobile touch movement
├── types/               # TypeScript type definitions
│   └── game.ts             # Game entity interfaces
├── App.tsx              # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles and animations
```

### Key Systems

#### Game Loop Architecture
- **60fps target** with adaptive frame skipping for mobile devices
- **Viewport culling** - only renders entities visible on screen
- **Performance monitoring** - automatically adjusts update frequency based on device capability

#### Entity System
- **Modular entity types** - Prey, Mines, Traps, Bonuses, Particles
- **Efficient collision detection** - Uses squared distance calculations to avoid expensive sqrt operations
- **Dynamic spawning** - Entities spawn procedurally as the player descends

#### Mobile Optimization
- **Touch controls** - Screen-based movement with dedicated echolocation button
- **Reduced particle counts** - Fewer visual effects on mobile for better performance
- **Adaptive quality** - Automatically reduces complexity on lower-end devices

## 🎨 Assets & Design

### Visual Style
- **Deep-sea atmosphere** with gradient backgrounds from dark blue to black
- **Bioluminescent effects** using CSS animations and dynamic lighting
- **Particle systems** for marine snow and glowing plankton
- **Smooth animations** with hardware acceleration for optimal performance

### Required Assets
All SVG assets should be placed in the `public/` directory:
- `anglerfish.svg` - Main player character
- `fish-1.svg`, `fish-2.svg` - Prey variants
- `mine.svg` - Explosive hazards
- `trap.svg` - Net traps
- `light-bonus.svg` - Light power-up
- `og-image.png` - Social media preview image

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** (recommended) for code formatting
- **Modular architecture** with clear separation of concerns

### Performance Considerations

- **Mobile-first optimization** with adaptive quality settings
- **Efficient rendering** using viewport culling and frame skipping
- **Memory management** with entity pooling and cleanup
- **Hardware acceleration** using CSS transforms and will-change properties

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly on both desktop and mobile
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Contribution Areas

- 🎮 **Gameplay Features** - New mechanics, power-ups, or game modes
- 🎨 **Visual Improvements** - Better animations, effects, or UI design
- 📱 **Mobile Experience** - Touch controls, performance optimizations
- 🐛 **Bug Fixes** - Performance issues, gameplay bugs, or compatibility problems
- 📚 **Documentation** - Code comments, tutorials, or guides
- 🌐 **Accessibility** - Making the game more accessible to all players

### Code Guidelines

- Follow TypeScript best practices
- Maintain 60fps performance target
- Test on both desktop and mobile devices
- Keep components modular and reusable
- Add comments for complex game logic
- Ensure responsive design principles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the mysterious beauty of deep-sea creatures
- Built with modern web technologies for optimal performance
- Designed for both casual and dedicated gamers
- Community-driven development and feedback

## 🔗 Links

- **Play Online**: [Live Demo](https://angularfish.netlify.app/)
- **Report Issues**: [GitHub Issues](https://github.com/yourusername/angularfish/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/angularfish/discussions)

---

**Dive into the abyss and see how long you can survive! 🌊**