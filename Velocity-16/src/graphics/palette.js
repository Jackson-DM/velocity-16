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
    NEON_GREEN: '#39ff14', // Cyber Napa
    PLASMA_BLUE: '#00d4ff',
    VULTURE_GOLD: '#d4af37',
    VOID_PURPLE: '#8a2be2',
    IRON_GREY: '#808080',
    
    // Racing Elements
    ROAD_GLOW: 'rgba(255, 0, 255, 0.4)',
    SCANLINE_COLOR: 'rgba(0, 255, 255, 0.15)',
    ENGINE_GLOW: '#ffcc00',
    
    // Track 2: Crystalline Mesa
    MESA_TEAL: '#008080',
    MESA_GOLD: '#FFD700',
    MESA_AMBER: '#FFBF00',
    MESA_DARK_TEAL: '#004d4d',
    
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
        case 'n': return COLORS.NEON_GREEN;
        case 'b': return COLORS.PLASMA_BLUE;
        case 'g': return COLORS.VULTURE_GOLD;
        case 'p': return COLORS.VOID_PURPLE;
        case 'i': return COLORS.IRON_GREY;
        case 'y': return COLORS.NEON_YELLOW;
        case 'mt': return COLORS.MESA_TEAL;
        case 'mg': return COLORS.MESA_GOLD;
        case 'ma': return COLORS.MESA_AMBER;
        case 'mdt': return COLORS.MESA_DARK_TEAL;
        default: return null;
    }
}
