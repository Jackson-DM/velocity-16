// 16-color neon palette (SNES-era inspired).
// ABGR Uint32 (little-endian ImageData): bits 0-7=R, 8-15=G, 16-23=B, 24-31=A
// Formula: (0xFF000000 | (B<<16) | (G<<8) | R) >>> 0

const C = (r, g, b) => (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;

export const PALETTE = {
  BLACK:       C(  0,   0,   0),
  WHITE:       C(255, 255, 255),
  NEON_CYAN:   C(  0, 255, 255),
  NEON_MAGENTA:C(255,   0, 255),
  NEON_YELLOW: C(255, 255,   0),
  NEON_GREEN:  C(  0, 255,   0),
  NEON_ORANGE: C(255, 140,   0),
  DEEP_BLUE:   C(  0,  20, 180),
  DEEP_PURPLE: C( 80,   0, 160),
  RED:         C(255,   0,   0),
  TEAL:        C(  0, 200, 180),
  VIOLET:      C(180,   0, 200),
  GRAY:        C(128, 128, 128),
  LIGHT_GRAY:  C(200, 200, 200),
  DARK_GRAY:   C( 50,  50,  50),
  GOLD:        C(255, 200,   0),
};
