# Velocity-16: Cyber Napa Circuit - UI and Sprite Implementation

This implementation focuses on the visual aspects of the Velocity-16 racing game, specifically:

1. **CRT/Arcade UI** - Retro-styled cabinet interface with:
   - Neon-styled title and headers
   - Status display with LED indicators
   - Speedometer and vehicle info
   - CRT scan line effects and screen glare

2. **Sprite Renderer** - Custom pixel-art sprite system with:
   - Implementation of the 24x16 pixel-art sprite matrices
   - Dynamic "shearing" for banking/turning effects
   - Focus on the Apex-Red vehicle as specified

3. **Parallax Neon Grid Background** - Cyberpunk racing environment with:
   - Perspective grid with parallax scrolling
   - Neon scan lines for retro effect
   - Dynamic horizon with cyber mountain silhouette

## How to Run

Open either:
- `index.html` using a local web server 
- `standalone.html` directly in a browser (no server needed)

## Controls

- **Arrow Up**: Accelerate
- **Arrow Down**: Brake
- **Arrow Left/Right**: Turn (with banking effect)
- **Click "Initialize Engine"**: Start the game

## Technical Details

The implementation includes:
- Module-based approach for graphics, sprites, and audio
- WebAudio API for engine sounds and voice feedback
- Canvas-based rendering with pixel-perfect sprites
- CSS-based CRT/arcade cabinet effects

The sprite renderer supports the 7 vehicles defined in the sprite manifest, with the Apex-Red vehicle fully implemented in this version.

## Credits

- Pixel art based on the sprite matrices from `doc/SPRITE_MANIFEST.md`
- UI design inspired by classic 16-bit arcade cabinets
- Color palette from Jackson's Standard Palette