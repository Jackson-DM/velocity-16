/**
 * Velocity-16 Color Palette
 * 16-bit styled color constants with F-Zero aesthetic
 */

export const COLORS = {
    // Primary Neon Colors
    NEON_CYAN: '#00f2ff',
    NEON_MAGENTA: '#ff00ff',
    NEON_GREEN: '#00ff66',
    NEON_ORANGE: '#ff7700',
    NEON_YELLOW: '#ffff00',
    NEON_RED: '#ff0000',
    
    // Secondary Colors
    VIOLET: '#9900ff',
    TEAL: '#00a7a7',
    DARK_GRAY: '#333333',
    BLOOD_RED: '#bb0000',
    GOLD: '#ffcc00',
    
    // Base Colors
    BLACK: '#000000',
    MATTE_BLACK: '#050505',
    WHITE: '#ffffff',
    
    // Special Effect Colors
    ENGINE_GLOW: '#ff3300',
    SCANLINE_COLOR: 'rgba(0, 255, 255, 0.15)',
    GRID_COLOR: 'rgba(255, 0, 255, 0.1)'
};

// Unused slot in sprite matrices
export const _ = null;

// Lookup helper for sprite matrices
export function getColor(colorCode) {
    switch(colorCode) {
        case 'O': return COLORS.MATTE_BLACK;
        case 'W': return COLORS.WHITE;
        case 'C': return COLORS.NEON_CYAN;
        case 'M': return COLORS.NEON_MAGENTA;
        case 'L': return COLORS.NEON_GREEN;
        case 'A': return COLORS.NEON_ORANGE;
        case 'Y': return COLORS.NEON_YELLOW;
        case 'R': return COLORS.NEON_RED;
        case 'V': return COLORS.VIOLET;
        case 'T': return COLORS.TEAL;
        case 'D': return COLORS.DARK_GRAY;
        case 'B': return COLORS.BLOOD_RED;
        case 'G': return COLORS.ENGINE_GLOW;
        case 'K': return COLORS.BLACK;
        default: return null;
    }
}