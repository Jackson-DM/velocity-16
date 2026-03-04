/**
 * Velocity-16 Sprite Renderer
 * Muscular F-Zero Silhouette Standard
 */

import { getColor, _ } from './palette.js';

/**
 * 24x16 Sprite Matrices
 * O: Matte Black, R: Neon Red, M: Neon Magenta, W: White, Y: Neon Yellow, 
 * C: Neon Cyan, n: Neon Green, p: Void Purple, i: Iron Grey
 * G: Engine Glow (Flicker target)
 */

export const SPRITES = {
    // APEX-RED: Matte Black hull, Red accents, Cyan dual thrusters
    APEX_RED_NEUTRAL: [
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,'O','O','O','O','O','O','O','O',_,_,_,_,_,_,_,_,_,
        _,_,_,'O','O','O','O','R','R','R','R','R','R','O','O','O','O',_,_,_,_,_,_,_,
        _,_,'O','R','R','R','R','R','W','W','W','W','R','R','R','R','R','O',_,_,_,_,_,_,
        _,'O','R','R','M','M','M','M','M','M','M','M','M','M','R','R','R','O',_,_,_,_,_,_,
        'O','R','R','M','M','M','M','M','M','M','M','M','M','M','M','R','R','O',_,_,_,_,_,_,
        'O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O',_,_,_,_,_,_,
        'O','O','i','i','i','O','O','C','C','O','O','C','C','O','O','i','i','i','O','O',_,_,_,_,
        'O','i','i','i','i','i','C','G','G','C','C','G','G','C','i','i','i','i','i','O',_,_,_,_,
        'O','i','i','i','i','i','C','G','G','C','C','G','G','C','i','i','i','i','i','O',_,_,_,_,
        'O','O','i','i','i','O','O','C','C','O','O','C','C','O','O','i','i','i','O','O',_,_,_,_,
        _,_,'O','O','O',_,_,_,_,_,_,_,_,_,_,_,'O','O','O',_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
    ],

    // JUGGERNAUT-7: Yellow/Black industrial armor, Orange twin-burners
    JUGGERNAUT_7_NEUTRAL: [
        _,_,_,_,_,_,_,_,'O','O','O','O','O','O',_,_,_,_,_,_,_,_,_,_,
        _,_,_,'O','O','O','O','Y','Y','Y','Y','Y','Y','O','O','O','O',_,_,_,_,_,_,_,
        _,_,'O','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','O',_,_,_,_,_,_,
        _,'O','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','O',_,_,_,_,_,_,
        'O','Y','Y','Y','O','O','O','O','O','O','O','O','O','O','Y','Y','Y','O',_,_,_,_,_,_,
        'O','Y','Y','O','i','i','i','i','i','i','i','i','i','i','O','Y','Y','O',_,_,_,_,_,_,
        'O','Y','Y','O','i','i','i','i','i','i','i','i','i','i','O','Y','Y','O',_,_,_,_,_,_,
        'O','O','O','O','i','i','Y','Y','Y','i','i','Y','Y','Y','i','i','O','O','O','O',_,_,_,_,
        _,'O','i','i','i','Y','G','G','Y','i','i','Y','G','G','Y','i','i','i','O',_,_,_,_,_,
        _,'O','i','i','i','Y','G','G','Y','i','i','Y','G','G','Y','i','i','i','O',_,_,_,_,_,
        _,'O','O','O','O','i','Y','Y','Y','i','i','Y','Y','Y','i','O','O','O','O',_,_,_,_,_,
        _,_,_,_,_,'O','O','O','O','O','O','O','O','O','O',_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
    ],

    // VAPOR-SKIMMER: Narrow, Purple/Black frame, Green neon stinger thrusters
    VAPOR_SKIMMER_NEUTRAL: [
        _,_,_,_,_,_,_,_,_,_,'O','O',_,_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,'O','p','p','O',_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,'O','p','p','O',_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,'O','O','O','O','p','W','W','p','O','O','O','O',_,_,_,_,_,_,_,
        _,_,_,_,'O','p','p','p','p','p','p','p','p','p','p','p','O',_,_,_,_,_,_,_,
        _,_,_,_,'O','p','p','p','p','p','p','p','p','p','p','p','O',_,_,_,_,_,_,_,
        _,'O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O',_,_,_,_,_,
        'O','p','p','p','p','O','n','n','O','O','O','O','n','n','O','p','p','p','p','O',_,_,_,_,
        'O','p','p','p','p','O','n','G','n','O','O','n','G','n','O','p','p','p','p','O',_,_,_,_,
        'O','p','p','p','p','O','n','G','n','O','O','n','G','n','O','p','p','p','p','O',_,_,_,_,
        'O','O','O','O','O','O','n','n','O','O','O','O','n','n','O','O','O','O','O','O',_,_,_,_,
        _,_,_,_,_,_,_,'O','O',_,_,_,'O','O',_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
        _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
    ]
};

export const PILOTS = [
    { 
        name: 'Jackson', 
        machine: 'APEX RED', 
        sprite: 'APEX_RED_NEUTRAL', 
        color: '#ff0000', 
        aiStyle: 'player',
        bio: 'HETEROCHROMIA (CYAN/MAGENTA) | MUSCULAR',
        specs: 'TOP SPEED: 480 KM/H | ACCEL: S',
        mass: 1.0
    },
    { 
        name: 'Baron', 
        machine: 'JUGGERNAUT-7', 
        sprite: 'JUGGERNAUT_7_NEUTRAL', 
        color: '#d4af37', 
        aiStyle: 'heavy',
        bio: 'GREY BEARD | FACIAL SCAR | HEAVY ARMOR',
        specs: 'TOP SPEED: 520 KM/H | ARMOR: S',
        mass: 2.0
    },
    { 
        name: 'Lyra', 
        machine: 'VAPOR SKIMMER', 
        sprite: 'VAPOR_SKIMMER_NEUTRAL', 
        color: '#39ff14', 
        aiStyle: 'light',
        bio: 'CYBER-VISOR | CIRCUIT HIGHLIGHTS',
        specs: 'TOP SPEED: 440 KM/H | HANDLING: S',
        mass: 0.5
    },
    { 
        name: 'Master-Remix', 
        machine: 'NEON SYMPHONY', 
        sprite: 'APEX_RED_NEUTRAL', 
        color: '#ff00ff', 
        aiStyle: 'erratic',
        bio: 'IRIDESCENT HELMET | MAGENTA GALAXY',
        specs: 'TOP SPEED: 440 KM/H | BOOST: S',
        mass: 0.8
    }
];

export class SpriteRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.frame = 0;
    }

    renderSprite(data, x, y, shearOffset = 0, scale = 1, isAccelerating = true) {
        this.frame++;
        const pixelSize = 2 * scale; 
        const cols = 24;
        const rows = 16;
        const sx = x - (cols * pixelSize / 2);
        const sy = y - (rows * pixelSize / 2);

        // Thruster flicker logic
        const flicker = isAccelerating && (Math.floor(this.frame / 2) % 2 === 0);

        for (let r = 0; r < rows; r++) {
            const rowShear = (rows - 1 - r) * (shearOffset * 0.4);

            for (let c = 0; c < cols; c++) {
                let colorCode = data[r * cols + c];
                if (!colorCode || colorCode === _) continue;

                // Handle thruster flicker
                if (colorCode === 'G' && !flicker) {
                    continue; // Skip glowing pixel for this frame
                }

                const finalX = sx + (c * pixelSize) + rowShear;
                this.ctx.fillStyle = getColor(colorCode);
                this.ctx.fillRect(finalX, sy + (r * pixelSize), pixelSize, pixelSize);
            }
        }
    }
}

