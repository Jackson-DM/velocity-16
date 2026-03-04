/**
 * Velocity-16 Color Palette
 * Matte Black / Red / Magenta F-Zero Standard
 */

export const COLORS = {
    // Primary "Apex-Red" Palette
    MATTE_BLACK: '#050505',
    NEON_RED: '#ff0000',
    NEON_MAGENTA: '#ff00ff',
    NEON_CYAN: '#00f2ff', // Secondary/Dashboard
    NEON_YELLOW: '#ffff00', // UI/Centerline
    
    // Racing Elements
    ROAD_GLOW: 'rgba(255, 0, 255, 0.4)',
    SCANLINE_COLOR: 'rgba(0, 255, 255, 0.15)',
    ENGINE_GLOW: '#ffcc00',
    
    // Base Utils
    BLACK: '#000000',
    WHITE: '#ffffff'
};

export const _ = null;

export function getColor(code) {
    switch(code) {
        case 'O': return COLORS.MATTE_BLACK;
        case 'R': return COLORS.NEON_RED;
        case 'M': return COLORS.NEON_MAGENTA;
        case 'W': return COLORS.WHITE;
        case 'Y': return COLORS.NEON_YELLOW;
        case 'C': return COLORS.NEON_CYAN;
        case 'G': return COLORS.ENGINE_GLOW;
        default: return null;
    }
}
