# SPRITE_MANIFEST.md - Velocity-16 Asset Registry

## 🏁 Overview
This manifest defines the pixel-art data for the 7 core racing machines of Velocity-16. All sprites follow the **24x16** "Elvis Standard" grid and implement dynamic shearing for banking effects.

## 🎨 Jackson Standard Palettes
Colors are mapped from `src/graphics/palette.js`. Each machine uses a primary neon accent and a secondary dark/glow set.

| Pilot | Machine | Primary | Secondary | Glow/Accent |
| :--- | :--- | :--- | :--- | :--- |
| **Jackson** | Apex-Red | NEON_CYAN | NEON_MAGENTA | WHITE / GLOW |
| **Unit-X** | Juggernaut-7 | NEON_ORANGE | DARK_GRAY | NEON_YELLOW |
| **Unknown** | Mantis-Ray | NEON_MAGENTA | VIOLET | NEON_CYAN |
| **Lyra-Neon** | Vapor-Skimmer | NEON_GREEN | TEAL | WHITE / GLOW |
| **Baron Von Stryker** | Iron Vulture | DARK_GRAY | BLOOD_RED | NEON_ORANGE |
| **Xylar the Exiled** | Plasma Reef | VIOLET | NEON_CYAN | WHITE / GLOW |
| **Master-Remix** | Neon Symphony | NEON_MAGENTA | GOLD (YELLOW) | WHITE / GLOW |

## 📐 Shearing Logic (Dynamic Banking)
Sprites implement the **Velocity-16 Shearing Standard** defined in `src/graphics/sprites.js`.

To create the illusion of banking/turning without pre-rendered frames:
- **Neutral**: `shift = 0`
- **Tilt (Step s)**: `shift = round(shearOffset[s] * y / 15)`
- `shearOffset` ranges from **-4 (Hard Left)** to **+4 (Hard Right)**.

## 🚢 Machine Registry

### 1. Apex-Red (Pilot: Jackson)
The balanced AI-core racer. Pulsing cyan frame.
- **Attributes:** Balanced weight, high top speed.

```javascript
/* Apex-Red Neutral (24x16) */
// C = NEON_CYAN, M = NEON_MAGENTA, O = BLACK, W = WHITE, G = ENGINE_GLOW
const APEX_RED_NEUTRAL = [
  _,_,_,_,_,_,_,_,O,O,O,O,O,O,O,O,_,_,_,_,_,_,_,_,
  _,_,_,_,_,O,O,O,C,C,C,C,C,C,C,C,O,O,O,_,_,_,_,_
  _,_,_,O,O,C,C,C,C,C,M,M,C,C,C,C,C,C,C,O,O,_,_,_
  _,_,O,C,C,C,C,C,C,C,W,M,C,C,C,C,C,C,C,C,C,O,_,_
  _,O,C,C,C,C,C,M,M,C,C,C,C,M,M,C,C,C,C,C,C,C,O,_
  O,C,C,C,C,C,M,M,M,C,C,C,C,M,M,M,C,C,C,C,C,C,C,O
  O,C,C,C,C,M,M,M,M,C,C,C,C,M,M,M,M,C,C,C,C,C,C,O
  O,D,C,C,C,M,G,G,M,C,C,C,C,M,G,G,M,C,C,C,D,D,C,O
  O,D,D,C,C,G,G,G,G,C,C,C,C,G,G,G,G,C,C,D,D,D,C,O
  O,D,D,D,G,G,Y,G,G,C,C,C,C,G,G,Y,G,G,D,D,D,D,O,O
  _,O,D,D,G,G,Y,G,G,D,D,D,D,G,G,Y,G,G,D,D,D,O,O,_
  _,_,O,D,D,G,G,G,G,D,D,D,D,G,G,G,G,D,D,D,O,O,_,_
  _,_,_,O,O,D,D,G,G,D,D,D,D,G,G,D,D,D,O,O,O,_,_,_
  _,_,_,_,_,O,O,D,G,G,D,D,G,G,D,D,O,O,O,_,_,_,_,_
  _,_,_,_,_,_,_,O,O,G,G,G,G,O,O,O,O,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,_,_,O,O,O,O,O,_,_,_,_,_,_,_,_,_,_
];
```

### 2. Juggernaut-7 (Pilot: Unit-X)
Brutalist slab of orange metal. Heavy and wide profile.
- **Attributes:** High mass, extreme collision resistance, slow acceleration.

```javascript
/* Juggernaut-7 Neutral (24x16) */
// A = NEON_ORANGE, D = DARK_GRAY, Y = NEON_YELLOW
const JUGGERNAUT_7_NEUTRAL = [
  _,_,_,_,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,_,_,_,_
  _,_,_,O,A,A,A,A,A,A,A,A,A,A,A,A,A,A,A,A,O,_,_,_
  _,_,O,A,A,A,A,A,A,A,D,D,A,A,A,A,A,A,A,A,A,O,_,_
  _,O,A,A,A,A,A,A,A,A,W,D,A,A,A,A,A,A,A,A,A,A,O,_
  O,A,A,A,A,D,D,D,A,A,D,D,A,A,D,D,D,A,A,A,A,A,A,O
  O,A,A,A,A,D,D,D,A,A,A,A,A,A,D,D,D,A,A,A,A,A,A,O
  O,A,A,A,D,D,D,D,D,A,A,A,A,D,D,D,D,D,A,A,A,A,A,O
  O,D,A,A,D,G,G,G,D,A,A,A,A,D,G,G,G,D,A,A,D,D,A,O
  O,D,D,A,G,G,Y,G,G,A,A,A,A,G,G,Y,G,G,A,D,D,D,A,O
  O,D,D,D,G,G,Y,G,G,D,D,D,D,G,G,Y,G,G,D,D,D,D,D,O
  O,O,D,D,G,G,G,G,D,D,D,D,D,D,G,G,G,G,D,D,D,D,O,O
  _,O,O,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,O,O,O,_
  _,_,O,O,D,D,D,D,D,D,D,D,D,D,D,D,D,D,O,O,O,_,_,_
  _,_,_,O,O,O,D,D,D,D,D,D,D,D,D,D,O,O,O,_,_,_,_,_
  _,_,_,_,_,O,O,O,O,O,O,O,O,O,O,O,O,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_
];
```

### 3. Mantis-Ray (Pilot: Unknown)
Organic magenta shimmer. Wings reflect circuit neon.
- **Attributes:** Low mass, exceptional turn rate, fragile collisions.

```javascript
/* Mantis-Ray Neutral (24x16) */
// M = NEON_MAGENTA, V = VIOLET, C = NEON_CYAN
const MANTIS_RAY_NEUTRAL = [
  _,_,_,_,_,_,_,_,_,O,O,O,O,_,_,_,_,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,_,O,M,M,M,M,O,_,_,_,_,_,_,_,_,_,_
  _,_,_,_,_,O,O,O,M,M,V,V,M,M,O,O,O,_,_,_,_,_,_,_
  _,_,_,_,O,M,M,M,M,M,W,V,M,M,M,M,M,O,_,_,_,_,_,_
  _,_,_,O,M,M,M,V,V,M,V,V,M,V,V,M,M,M,O,_,_,_,_,_
  _,_,O,M,M,V,V,V,V,M,M,M,M,V,V,V,V,M,M,O,_,_,_,_
  _,O,M,V,V,V,V,V,V,C,C,C,C,V,V,V,V,V,V,M,O,_,_,_
  O,M,V,V,V,V,C,C,V,C,C,C,C,V,C,C,V,V,V,V,M,O,_,_
  O,M,V,V,C,C,G,G,C,C,C,C,C,C,G,G,C,C,V,V,M,O,_,_
  O,D,V,C,G,G,Y,G,G,C,C,C,C,G,G,Y,G,G,C,V,D,O,_,_
  _,O,D,C,G,G,Y,G,G,D,D,D,D,G,G,Y,G,G,C,D,O,_,_,_
  _,_,O,D,G,G,G,G,D,D,D,D,D,D,G,G,G,G,D,O,_,_,_,_
  _,_,_,O,D,D,D,D,D,D,D,D,D,D,D,D,D,D,O,_,_,_,_,_
  _,_,_,_,O,O,D,D,D,D,D,D,D,D,D,D,O,O,_,_,_,_,_,_
  _,_,_,_,_,_,O,O,O,O,O,O,O,O,O,O,_,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_
];
```

### 4. Vapor-Skimmer (Pilot: Lyra-Neon)
Ultra-lean profile for aerodynamic dominance.
- **Attributes:** Highest acceleration, lowest collision resistance.

```javascript
/* Vapor-Skimmer Neutral (24x16) */
// L = NEON_GREEN, T = TEAL, W = WHITE, G = ENGINE_GLOW, Y = NEON_YELLOW, D = DARK_GRAY
const VAPOR_SKIMMER_NEUTRAL = [
  _,_,_,_,_,_,_,_,_,_,O,O,_,_,_,_,_,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,_,_,O,L,L,O,_,_,_,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,_,O,L,L,L,L,O,_,_,_,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,O,L,L,L,L,L,L,O,_,_,_,_,_,_,_,_,_
  _,_,_,_,_,_,O,L,L,L,W,T,L,L,L,O,_,_,_,_,_,_,_,_
  _,_,_,_,_,O,L,L,T,T,T,T,T,T,L,L,O,_,_,_,_,_,_,_
  _,_,_,_,O,L,L,T,T,T,T,T,T,T,T,L,L,O,_,_,_,_,_
  _,_,_,O,L,L,T,T,G,G,T,T,G,G,T,T,L,L,O,_,_,_,_,_
  _,_,O,L,L,T,G,G,G,G,T,T,G,G,G,G,T,L,L,O,_,_,_,_
  _,O,L,L,G,G,G,Y,G,G,D,D,G,G,Y,G,G,G,L,L,O,_,_,_
  _,O,D,L,G,G,Y,G,G,D,D,D,D,G,G,Y,G,G,L,D,O,_,_,_
  _,_,O,D,G,G,G,G,D,D,D,D,D,D,G,G,G,G,D,O,_,_,_,_
  _,_,_,O,O,D,D,D,D,D,D,D,D,D,D,D,D,O,O,_,_,_,_,_
  _,_,_,_,_,O,O,D,D,D,D,D,D,D,D,O,O,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,O,O,O,O,O,O,O,O,_,_,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_
];
```

### 5. Iron Vulture (Pilot: Baron Von Stryker)
Serrated, military-grade frame with matte black coating.
- **Attributes:** High traction, extremely stable at top speeds.

```javascript
/* Iron Vulture Neutral (24x16) */
// R = BLOOD_RED, D = DARK_GRAY, W = WHITE, G = ENGINE_GLOW
const IRON_VULTURE_NEUTRAL = [
  _,_,_,O,O,_,_,_,_,_,_,_,_,_,_,_,_,_,_,O,O,_,_,_
  _,_,O,D,D,O,_,_,_,_,O,O,O,O,_,_,_,_,O,D,D,O,_,_
  _,_,O,D,D,D,O,_,_,O,D,D,D,D,O,_,_,O,D,D,D,O,_,_
  _,O,D,D,D,D,D,O,O,D,D,D,D,D,D,O,O,D,D,D,D,D,O,_
  _,O,D,D,R,R,D,D,D,D,W,D,D,D,D,D,D,D,R,R,D,D,O,_
  O,D,D,R,R,R,R,D,D,D,D,D,D,D,D,D,D,R,R,R,R,D,D,O
  O,D,D,R,R,R,R,R,D,D,D,D,D,D,D,D,R,R,R,R,R,D,D,O
  O,D,D,R,R,G,G,R,R,D,D,D,D,D,D,R,R,G,G,R,R,D,D,O
  O,D,D,G,G,G,G,G,G,D,D,D,D,D,D,G,G,G,G,G,G,D,D,O
  O,D,G,G,Y,G,G,G,G,D,D,D,D,D,D,G,G,G,G,G,G,D,D,O
  _,O,D,G,G,Y,G,G,D,D,D,D,D,D,D,D,G,G,G,G,D,O,_,_
  _,_,O,D,D,G,G,D,D,D,D,D,D,D,D,D,D,G,G,D,O,_,_,_
  _,_,_,O,O,D,D,D,D,D,D,D,D,D,D,D,D,D,D,O,O,_,_,_
  _,_,_,_,_,O,O,D,D,D,D,D,D,D,D,D,D,O,O,_,_,_,_
  _,_,_,_,_,_,_,O,O,O,O,O,O,O,O,O,O,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_
];
```

### 6. Plasma Reef (Pilot: Xylar the Exiled)
Translucent violet shell with cyan energy veins.
- **Attributes:** Unique energy-recharge rates, slippery handling.

```javascript
/* Plasma Reef Neutral (24x16) */
// V = VIOLET, C = NEON_CYAN, W = WHITE, G = ENGINE_GLOW
const PLASMA_REEF_NEUTRAL = [
  _,_,_,_,_,_,_,_,_,O,O,O,O,O,_,_,_,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,O,O,V,V,V,V,V,O,O,_,_,_,_,_,_,_,_
  _,_,_,_,_,O,O,V,V,V,V,V,V,V,V,V,O,O,_,_,_,_,_,_
  _,_,_,_,O,V,V,V,C,C,W,C,C,V,V,V,V,V,O,_,_,_,_,_
  _,_,_,O,V,V,C,C,C,C,C,C,C,C,C,C,V,V,V,O,_,_,_,_
  _,_,O,V,V,C,C,V,V,V,V,V,V,V,V,C,C,V,V,V,O,_,_,_
  _,O,V,V,C,C,V,V,V,V,V,V,V,V,V,V,C,C,V,V,V,O,_,_
  O,V,V,C,C,V,V,G,G,V,V,V,V,G,G,V,V,C,C,V,V,V,O,_
  O,V,V,C,C,V,G,G,G,G,V,V,G,G,G,G,V,C,C,V,V,V,O,_
  O,V,V,G,G,G,G,Y,G,G,V,V,G,G,Y,G,G,G,G,V,V,O,O,_
  _,O,V,G,G,G,G,Y,G,G,D,D,G,G,Y,G,G,G,G,V,O,O,_,_
  _,_,O,V,G,G,G,G,G,G,D,D,G,G,G,G,G,G,V,O,O,_,_,_
  _,_,_,O,O,V,V,G,G,D,D,D,D,G,G,V,V,O,O,O,_,_,_,_
  _,_,_,_,_,O,O,V,V,D,D,D,D,V,V,O,O,O,_,_,_,_,_,_
  _,_,_,_,_,_,_,O,O,G,G,G,G,O,O,O,_,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,_,_,O,O,O,O,_,_,_,_,_,_,_,_,_,_,_
];
```

### 7. Neon Symphony (Pilot: Master-Remix)
Architectural geometric frame with shifting LEDs.
- **Attributes:** Adaptive handling, experimental boost-efficiency.

```javascript
/* Neon Symphony Neutral (24x16) */
// M = NEON_MAGENTA, Y = GOLD, W = WHITE, G = ENGINE_GLOW
const NEON_SYMPHONY_NEUTRAL = [
  _,_,_,_,_,O,O,O,O,O,O,O,O,O,O,O,O,_,_,_,_,_,_,_
  _,_,_,_,O,M,M,M,M,M,M,M,M,M,M,M,M,O,_,_,_,_,_,_
  _,_,_,O,M,M,Y,Y,M,M,M,M,M,M,Y,Y,M,M,O,_,_,_,_,_
  _,_,O,M,M,Y,W,Y,M,M,M,M,M,M,Y,W,Y,M,M,O,_,_,_,_
  _,O,M,M,M,Y,Y,M,M,M,M,M,M,M,Y,Y,M,M,M,O,_,_,_
  O,M,M,M,M,M,M,M,M,M,M,M,M,M,M,M,M,M,M,M,O,_,_
  O,M,M,Y,Y,M,M,Y,Y,M,M,M,M,Y,Y,M,M,Y,Y,M,O,_,_
  O,M,M,Y,Y,M,G,G,Y,M,M,M,M,Y,G,G,M,Y,Y,M,O,_,_
  O,M,M,M,M,G,G,G,G,M,M,M,M,G,G,G,G,M,M,M,O,_,_
  O,D,M,M,G,G,Y,G,G,M,M,M,M,G,G,Y,G,G,M,M,D,O,_,_
  _,O,D,M,G,G,Y,G,G,D,D,D,D,G,G,Y,G,G,M,D,O,_,_,_
  _,_,O,D,G,G,G,G,D,D,D,D,D,D,G,G,G,G,D,O,_,_,_,_
  _,_,_,O,O,D,D,D,D,D,D,D,D,D,D,D,D,O,O,_,_,_,_,_
  _,_,_,_,_,O,O,D,D,D,D,D,D,D,D,O,O,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,O,O,O,O,O,O,O,O,_,_,_,_,_,_,_,_
  _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_
];
```

---
*Maintained by the Velocity Documentation Core.*
