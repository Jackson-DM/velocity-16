/**
 * Velocity-16 Sprite System
 * Manages pixel-art sprites with shearing for the 16-bit racing effect
 */

import { getColor, _ } from './palette.js';

// Pixel size for rendering (can be adjusted for scaling)
const PIXEL_SIZE = 1;

// Shear offset multipliers for different tilt angles (-4 to +4)
export const SHEAR_OFFSETS = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

// Vehicle Sprite Matrix Definitions
export const SPRITES = {
    /* Apex-Red Neutral (24x16) - Muscular F-Zero style aerodynamic shape with Matte Black/Red/Magenta palette */
    // O = MATTE_BLACK (#050505), R = NEON_RED (#ff0000), M = NEON_MAGENTA (#ff00ff), W = WHITE, G = ENGINE_GLOW
    APEX_RED_NEUTRAL: [
      _,_,_,_,_,_,_,_,'O','O','O','O','O','O','O','O',_,_,_,_,_,_,_,_,
      _,_,_,_,_,'O','O','O','O','O','O','O','O','O','O','O','O','O','O',_,_,_,_,_,
      _,_,_,'O','O','O','O','O','O','O','M','M','O','O','O','O','O','O','O','O','O',_,_,_,
      _,_,'O','O','O','O','M','M','O','O','W','M','O','O','M','M','O','O','O','O','O','O',_,_,
      _,'O','O','O','O','M','M','M','M','O','O','O','O','M','M','M','M','O','O','O','O','O','O',_,
      'O','O','O','O','M','M','M','M','M','O','O','O','O','M','M','M','M','M','O','O','O','O','O','O',
      'O','O','O','O','M','M','R','R','M','O','O','O','O','M','R','R','M','M','O','O','O','O','O','O',
      'O','O','O','O','M','R','G','G','R','O','R','R','O','R','G','G','R','M','O','O','O','O','O','O',
      'O','O','O','O','R','G','G','G','G','R','R','R','R','G','G','G','G','R','O','O','O','O','O','O',
      'O','O','O','R','G','G','M','G','G','R','R','R','R','G','G','M','G','G','R','O','O','O','O','O',
      _,'O','O','R','G','G','M','G','G','R','R','R','R','G','G','M','G','G','R','O','O','O',_,_,
      _,_,'O','O','R','G','G','G','G','O','R','R','O','G','G','G','G','R','O','O','O','O',_,_,
      _,_,_,'O','O','R','R','G','G','O','O','R','O','G','G','R','R','O','O','O','O',_,_,_,
      _,_,_,_,'O','O','O','R','G','G','R','R','G','G','R','O','O','O','O',_,_,_,_,_,
      _,_,_,_,_,_,'O','O','R','R','R','R','R','R','O','O',_,_,_,_,_,_,_,_,
      _,_,_,_,_,_,_,_,_,'O','O','O','O','O',_,_,_,_,_,_,_,_,_,_,
    ],
    
    /* Iron Vulture (24x16) - Dark gray with yellow highlights */
    // O = MATTE_BLACK, D = DARK_GRAY, Y = NEON_YELLOW, W = WHITE, G = ENGINE_GLOW
    IRON_VULTURE: [
      _,_,_,_,_,_,_,_,'D','D','D','D','D','D','D','D',_,_,_,_,_,_,_,_,
      _,_,_,_,_,'D','D','D','D','D','D','D','D','D','D','D','D','D','D',_,_,_,_,_,
      _,_,_,'D','D','D','D','D','D','D','Y','Y','D','D','D','D','D','D','D','D','D',_,_,_,
      _,_,'D','D','D','D','D','D','D','D','W','Y','D','D','D','D','D','D','D','D','D','D',_,_,
      _,'D','D','D','D','D','D','Y','Y','D','D','D','D','Y','Y','D','D','D','D','D','D','D','D',_,
      'D','D','D','D','D','D','Y','Y','Y','D','D','D','D','Y','Y','Y','D','D','D','D','D','D','D','D',
      'D','D','D','D','D','Y','Y','Y','Y','D','D','D','D','Y','Y','Y','Y','D','D','D','D','D','D','D',
      'D','D','D','D','D','Y','G','G','Y','D','Y','Y','D','Y','G','G','Y','D','D','D','D','D','D','D',
      'D','D','D','D','D','G','G','G','G','Y','Y','Y','Y','G','G','G','G','D','D','D','D','D','D','D',
      'D','D','D','D','G','G','O','G','G','Y','Y','Y','Y','G','G','O','G','G','D','D','D','D','D','D',
      _,'D','D','D','G','G','O','G','G','D','Y','Y','D','G','G','O','G','G','D','D','D','D','D',_,
      _,_,'D','D','D','G','G','G','G','D','D','D','D','G','G','G','G','D','D','D','D','D',_,_,
      _,_,_,'D','D','D','D','G','G','D','D','Y','D','G','G','D','D','D','D','D','D',_,_,_,
      _,_,_,_,_,'D','D','D','G','G','Y','Y','G','G','D','D','D','D','D',_,_,_,_,_,
      _,_,_,_,_,_,_,'D','D','G','G','G','G','D','D','D','D',_,_,_,_,_,_,_,
      _,_,_,_,_,_,_,_,_,'D','D','D','D','D',_,_,_,_,_,_,_,_,_,_,
    ],
    
    /* Plasma Reef (24x16) - Cyan with neon accents */
    // O = MATTE_BLACK, C = NEON_CYAN, T = TEAL, W = WHITE, G = ENGINE_GLOW
    PLASMA_REEF: [
      _,_,_,_,_,_,_,_,'T','T','T','T','T','T','T','T',_,_,_,_,_,_,_,_,
      _,_,_,_,_,'T','T','T','T','T','T','T','T','T','T','T','T','T','T',_,_,_,_,_,
      _,_,_,'T','T','T','T','T','T','T','C','C','T','T','T','T','T','T','T','T','T',_,_,_,
      _,_,'T','T','T','T','T','T','T','T','W','C','T','T','T','T','T','T','T','T','T','T',_,_,
      _,'T','T','T','T','T','T','C','C','T','T','T','T','C','C','T','T','T','T','T','T','T','T',_,
      'T','T','T','T','T','T','C','C','C','T','T','T','T','C','C','C','T','T','T','T','T','T','T','T',
      'T','T','T','T','T','C','C','C','C','T','T','T','T','C','C','C','C','T','T','T','T','T','T','T',
      'T','T','T','T','T','C','G','G','C','T','C','C','T','C','G','G','C','T','T','T','T','T','T','T',
      'T','T','T','T','T','G','G','G','G','C','C','C','C','G','G','G','G','T','T','T','T','T','T','T',
      'T','T','T','T','G','G','W','G','G','C','C','C','C','G','G','W','G','G','T','T','T','T','T','T',
      _,'T','T','T','G','G','W','G','G','T','C','C','T','G','G','W','G','G','T','T','T','T','T',_,
      _,_,'T','T','T','G','G','G','G','T','T','T','T','G','G','G','G','T','T','T','T','T',_,_,
      _,_,_,'T','T','T','T','G','G','T','T','C','T','G','G','T','T','T','T','T','T',_,_,_,
      _,_,_,_,_,'T','T','T','G','G','C','C','G','G','T','T','T','T','T',_,_,_,_,_,
      _,_,_,_,_,_,_,'T','T','G','G','G','G','T','T','T','T',_,_,_,_,_,_,_,
      _,_,_,_,_,_,_,_,_,'T','T','T','T','T',_,_,_,_,_,_,_,_,_,_,
    ],
    
    /* Glow Vortex (24x16) - Green with neon accents */
    // O = MATTE_BLACK, L = NEON_GREEN, T = TEAL, W = WHITE, G = ENGINE_GLOW
    GLOW_VORTEX: [
      _,_,_,_,_,_,_,_,'O','O','O','O','O','O','O','O',_,_,_,_,_,_,_,_,
      _,_,_,_,_,'O','O','O','O','O','O','O','O','O','O','O','O','O','O',_,_,_,_,_,
      _,_,_,'O','O','O','O','O','O','O','L','L','O','O','O','O','O','O','O','O','O',_,_,_,
      _,_,'O','O','O','O','O','O','O','O','W','L','O','O','O','O','O','O','O','O','O','O',_,_,
      _,'O','O','O','O','O','O','L','L','O','O','O','O','L','L','O','O','O','O','O','O','O','O',_,
      'O','O','O','O','O','O','L','L','L','O','O','O','O','L','L','L','O','O','O','O','O','O','O','O',
      'O','O','O','O','O','L','L','L','L','O','O','O','O','L','L','L','L','O','O','O','O','O','O','O',
      'O','O','O','O','O','L','G','G','L','O','L','L','O','L','G','G','L','O','O','O','O','O','O','O',
      'O','O','O','O','O','G','G','G','G','L','L','L','L','G','G','G','G','O','O','O','O','O','O','O',
      'O','O','O','O','G','G','T','G','G','L','L','L','L','G','G','T','G','G','O','O','O','O','O','O',
      _,'O','O','O','G','G','T','G','G','O','L','L','O','G','G','T','G','G','O','O','O','O','O',_,
      _,_,'O','O','O','G','G','G','G','O','O','O','O','G','G','G','G','O','O','O','O','O',_,_,
      _,_,_,'O','O','O','O','G','G','O','O','L','O','G','G','O','O','O','O','O','O',_,_,_,
      _,_,_,_,_,'O','O','O','G','G','L','L','G','G','O','O','O','O','O',_,_,_,_,_,
      _,_,_,_,_,_,_,'O','O','G','G','G','G','O','O','O','O',_,_,_,_,_,_,_,
      _,_,_,_,_,_,_,_,_,'O','O','O','O','O',_,_,_,_,_,_,_,_,_,_,
    ],
    
    /* Neon Phantom (24x16) - Violet with neon accents */
    // O = MATTE_BLACK, V = VIOLET, M = NEON_MAGENTA, W = WHITE, G = ENGINE_GLOW
    NEON_PHANTOM: [
      _,_,_,_,_,_,_,_,'O','O','O','O','O','O','O','O',_,_,_,_,_,_,_,_,
      _,_,_,_,_,'O','O','O','O','O','O','O','O','O','O','O','O','O','O',_,_,_,_,_,
      _,_,_,'O','O','O','O','O','O','O','V','V','O','O','O','O','O','O','O','O','O',_,_,_,
      _,_,'O','O','O','O','O','O','O','O','W','V','O','O','O','O','O','O','O','O','O','O',_,_,
      _,'O','O','O','O','O','O','V','V','O','O','O','O','V','V','O','O','O','O','O','O','O','O',_,
      'O','O','O','O','O','O','V','V','V','O','O','O','O','V','V','V','O','O','O','O','O','O','O','O',
      'O','O','O','O','O','V','V','V','V','O','O','O','O','V','V','V','V','O','O','O','O','O','O','O',
      'O','O','O','O','O','V','G','G','V','O','V','V','O','V','G','G','V','O','O','O','O','O','O','O',
      'O','O','O','O','O','G','G','G','G','V','V','V','V','G','G','G','G','O','O','O','O','O','O','O',
      'O','O','O','O','G','G','M','G','G','V','V','V','V','G','G','M','G','G','O','O','O','O','O','O',
      _,'O','O','O','G','G','M','G','G','O','V','V','O','G','G','M','G','G','O','O','O','O','O',_,
      _,_,'O','O','O','G','G','G','G','O','O','O','O','G','G','G','G','O','O','O','O','O',_,_,
      _,_,_,'O','O','O','O','G','G','O','O','V','O','G','G','O','O','O','O','O','O',_,_,_,
      _,_,_,_,_,'O','O','O','G','G','V','V','G','G','O','O','O','O','O',_,_,_,_,_,
      _,_,_,_,_,_,_,'O','O','G','G','G','G','O','O','O','O',_,_,_,_,_,_,_,
      _,_,_,_,_,_,_,_,_,'O','O','O','O','O',_,_,_,_,_,_,_,_,_,_,
    ],
    
    /* Ember Rush (24x16) - Orange/red with fiery accents */
    // O = MATTE_BLACK, A = NEON_ORANGE, R = NEON_RED, W = WHITE, G = ENGINE_GLOW
    EMBER_RUSH: [
      _,_,_,_,_,_,_,_,'O','O','O','O','O','O','O','O',_,_,_,_,_,_,_,_,
      _,_,_,_,_,'O','O','O','O','O','O','O','O','O','O','O','O','O','O',_,_,_,_,_,
      _,_,_,'O','O','O','O','O','O','O','A','A','O','O','O','O','O','O','O','O','O',_,_,_,
      _,_,'O','O','O','O','O','O','O','O','W','A','O','O','O','O','O','O','O','O','O','O',_,_,
      _,'O','O','O','O','O','O','A','A','O','O','O','O','A','A','O','O','O','O','O','O','O','O',_,
      'O','O','O','O','O','O','A','A','A','O','O','O','O','A','A','A','O','O','O','O','O','O','O','O',
      'O','O','O','O','O','A','A','A','A','O','O','O','O','A','A','A','A','O','O','O','O','O','O','O',
      'O','O','O','O','O','A','G','G','A','O','A','A','O','A','G','G','A','O','O','O','O','O','O','O',
      'O','O','O','O','O','G','G','G','G','A','A','A','A','G','G','G','G','O','O','O','O','O','O','O',
      'O','O','O','O','G','G','R','G','G','A','A','A','A','G','G','R','G','G','O','O','O','O','O','O',
      _,'O','O','O','G','G','R','G','G','O','A','A','O','G','G','R','G','G','O','O','O','O','O',_,
      _,_,'O','O','O','G','G','G','G','O','O','O','O','G','G','G','G','O','O','O','O','O',_,_,
      _,_,_,'O','O','O','O','G','G','O','O','A','O','G','G','O','O','O','O','O','O',_,_,_,
      _,_,_,_,_,'O','O','O','G','G','A','A','G','G','O','O','O','O','O',_,_,_,_,_,
      _,_,_,_,_,_,_,'O','O','G','G','G','G','O','O','O','O',_,_,_,_,_,_,_,
      _,_,_,_,_,_,_,_,_,'O','O','O','O','O',_,_,_,_,_,_,_,_,_,_,
    ],

    /* Gold Streak (24x16) - Gold with neon yellow accents */
    // O = MATTE_BLACK, Y = NEON_YELLOW, G = ENGINE_GLOW, W = WHITE, B = GOLD
    GOLD_STREAK: [
      _,_,_,_,_,_,_,_,'O','O','O','O','O','O','O','O',_,_,_,_,_,_,_,_,
      _,_,_,_,_,'O','O','O','O','O','O','O','O','O','O','O','O','O','O',_,_,_,_,_,
      _,_,_,'O','O','O','O','O','O','O','B','B','O','O','O','O','O','O','O','O','O',_,_,_,
      _,_,'O','O','O','O','O','O','O','O','W','B','O','O','O','O','O','O','O','O','O','O',_,_,
      _,'O','O','O','O','O','O','B','B','O','O','O','O','B','B','O','O','O','O','O','O','O','O',_,
      'O','O','O','O','O','O','B','B','B','O','O','O','O','B','B','B','O','O','O','O','O','O','O','O',
      'O','O','O','O','O','B','B','B','B','O','O','O','O','B','B','B','B','O','O','O','O','O','O','O',
      'O','O','O','O','O','B','G','G','B','O','B','B','O','B','G','G','B','O','O','O','O','O','O','O',
      'O','O','O','O','O','G','G','G','G','B','B','B','B','G','G','G','G','O','O','O','O','O','O','O',
      'O','O','O','O','G','G','Y','G','G','B','B','B','B','G','G','Y','G','G','O','O','O','O','O','O',
      _,'O','O','O','G','G','Y','G','G','O','B','B','O','G','G','Y','G','G','O','O','O','O','O',_,
      _,_,'O','O','O','G','G','G','G','O','O','O','O','G','G','G','G','O','O','O','O','O',_,_,
      _,_,_,'O','O','O','O','G','G','O','O','B','O','G','G','O','O','O','O','O','O',_,_,_,
      _,_,_,_,_,'O','O','O','G','G','B','B','G','G','O','O','O','O','O',_,_,_,_,_,
      _,_,_,_,_,_,_,'O','O','G','G','G','G','O','O','O','O',_,_,_,_,_,_,_,
      _,_,_,_,_,_,_,_,_,'O','O','O','O','O',_,_,_,_,_,_,_,_,_,_,
    ]
};

// Complete list of all racing pilots in the game
export const PILOTS = [
    {
        name: "Apex Red", 
        sprite: "APEX_RED_NEUTRAL",
        color: "#ff0000",
        aiStyle: "balanced"
    },
    {
        name: "Iron Vulture", 
        sprite: "IRON_VULTURE",
        color: "#ffff00",
        aiStyle: "aggressive"
    },
    {
        name: "Plasma Reef", 
        sprite: "PLASMA_REEF",
        color: "#00f2ff",
        aiStyle: "technical"
    },
    {
        name: "Glow Vortex", 
        sprite: "GLOW_VORTEX",
        color: "#00ff66",
        aiStyle: "defensive"
    },
    {
        name: "Neon Phantom", 
        sprite: "NEON_PHANTOM",
        color: "#9900ff",
        aiStyle: "tactical"
    },
    {
        name: "Ember Rush", 
        sprite: "EMBER_RUSH",
        color: "#ff7700",
        aiStyle: "reckless"
    },
    {
        name: "Gold Streak", 
        sprite: "GOLD_STREAK",
        color: "#ffcc00",
        aiStyle: "precise"
    }
];

// Class to handle rendering pixel-art sprites with shearing for banking effect
export class SpriteRenderer {
    constructor(context) {
        this.ctx = context;
        this.width = 24;  // Standard width for all sprites
        this.height = 16; // Standard height for all sprites
    }
    
    /**
     * Renders a sprite with enhanced banking effect
     * @param {Array} spriteData - The sprite pixel matrix (24x16)
     * @param {Number} x - X coordinate on canvas
     * @param {Number} y - Y coordinate on canvas
     * @param {Number} shearLevel - Banking level (-4 to 4)
     */
    renderSprite(spriteData, x, y, shearLevel = 0) {
        // Validate shear level is in range
        const safeShearLevel = Math.max(-4, Math.min(4, shearLevel));
        const shearIndex = safeShearLevel + 4; // Convert to 0-8 index
        
        // Center the sprite at x,y
        const startX = x - (this.width * PIXEL_SIZE / 2);
        const startY = y - (this.height * PIXEL_SIZE / 2);
        
        // Add banking rotation angle for more dramatic effect
        const bankingAngle = safeShearLevel * 3; // -12 to 12 degrees of rotation
        
        // Save context state before transformations
        this.ctx.save();
        
        // Apply transformations: translate to sprite center, rotate, translate back
        this.ctx.translate(x, y);
        this.ctx.rotate(bankingAngle * Math.PI / 180);
        this.ctx.translate(-x, -y);
        
        // Add a banking-direction specific shadow/trail effect
        if (safeShearLevel !== 0) {
            const trailColor = safeShearLevel > 0 ? 'rgba(255, 0, 255, 0.4)' : 'rgba(255, 0, 0, 0.4)';
            const trailOffset = safeShearLevel > 0 ? -2 : 2;
            
            // Draw trail shadow
            this.ctx.fillStyle = trailColor;
            this.ctx.fillRect(
                x - (this.width * PIXEL_SIZE / 2) + (trailOffset * Math.abs(safeShearLevel)), 
                y - (this.height * PIXEL_SIZE / 2) + 4,
                this.width * PIXEL_SIZE,
                this.height * PIXEL_SIZE
            );
        }
        
        // Render each pixel with enhanced shearing
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                // Get color code from sprite matrix
                const colorCode = spriteData[row * this.width + col];
                if (colorCode === null) continue; // Skip transparent pixels
                
                const color = getColor(colorCode);
                if (!color) continue;
                
                // Apply shearing based on row height and shear level
                // More pronounced shearing at the bottom of the sprite (F-Zero style)
                const shearAmount = Math.round(SHEAR_OFFSETS[shearIndex] * (row / 12) * 1.5);
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(
                    startX + (col + shearAmount) * PIXEL_SIZE, 
                    startY + row * PIXEL_SIZE,
                    PIXEL_SIZE,
                    PIXEL_SIZE
                );
            }
        }
        
        // Restore context state
        this.ctx.restore();
    }
}