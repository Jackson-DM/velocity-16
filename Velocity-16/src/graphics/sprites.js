/**
 * Velocity-16 Sprite Renderer
 * Muscular F-Zero Silhouette Standard
 */

import { getColor, _ } from './palette.js';

export const SPRITES = {
    APEX_RED_NEUTRAL: [
        _,_,_,_,_,_,_,_,'O','O','O','O','O','O','O','O',_,_,_,_,_,_,_,_,
        _,_,_,_,_,'O','O','O','M','M','M','M','M','M','M','M','O','O','O',_,_,_,_,_,
        _,_,_,'O','O','M','R','R','R','R','R','R','R','R','R','R','R','M','O','O','O',_,_,_,
        _,_,'O','R','R','R','R','O','O','O','W','W','O','O','O','R','R','R','R','R','R','O',_,_,
        _,'O','R','R','R','R','O','M','M','R','R','R','R','M','M','O','R','R','R','R','R','R','O',_,
        'O','R','R','R','O','O','M','M','M','O','O','O','O','M','M','M','O','O','R','R','R','R','R','O',
        'O','M','M','O','O','M','M','M','M','M','O','O','M','M','M','M','M','O','O','M','M','R','R','O',
        'O','M','M','O','M','G','G','M','M','M','M','M','M','M','G','G','M','O','M','M','M','M','R','O',
        'O','M','M','O','G','G','G','G','M','M','M','M','M','G','G','G','G','O','M','M','M','M','R','O',
        'O','O','O','O','G','G','Y','G','G','O','O','O','O','G','G','Y','G','G','O','O','O','O','O','O',
        _,'O','O','G','G','G','Y','G','G','G','G','G','G','G','G','Y','G','G','G','G','O','O',_,_,
        _,_,'O','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','O',_,_,_,
        _,_,_,'O','O','O','G','G','G','G','G','G','G','G','G','G','G','G','O','O','O',_,_,_,
    ],
    PLASMA_REEF: [
        _,_,_,_,_,_,_,'O','O','O','O','O','O','O','O','O','O',_,_,_,_,_,_,_,
        _,_,_,_,_,'O','O','b','b','b','b','b','b','b','b','b','b','O','O',_,_,_,_,_,
        _,_,_,'O','O','b','b','b','b','b','b','b','b','b','b','b','b','b','O','O',_,_,_,_,
        _,_,'O','b','b','b','b','O','O','O','W','W','O','O','O','b','b','b','b','b','O',_,_,_,
        _,'O','b','b','b','b','O','M','M','b','b','b','b','M','M','O','b','b','b','b','b','O',_,_,
        'O','b','b','b','O','O','M','M','M','O','O','O','O','M','M','M','O','O','b','b','b','b','b','O',
        'O','M','M','O','O','M','M','M','M','M','O','O','M','M','M','M','M','O','O','M','M','b','b','O',
        'O','M','M','O','M','G','G','M','M','M','M','M','M','M','G','G','M','O','M','M','M','M','b','O',
        'O','M','M','O','G','G','G','G','M','M','M','M','M','G','G','G','G','O','M','M','M','M','b','O',
        'O','O','O','O','G','G','b','G','G','O','O','O','O','G','G','b','G','G','O','O','O','O','O','O',
        _,'O','O','G','G','G','b','G','G','G','G','G','G','G','G','b','G','G','G','G','O','O',_,_,
        _,_,'O','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','O',_,_,_,
        _,_,_,'O','O','O','G','G','G','G','G','G','G','G','G','G','G','G','O','O','O',_,_,_,
    ],
    IRON_VULTURE: [
        _,_,_,_,_,_,_,'O','O','O','g','g','g','g','O','O','O',_,_,_,_,_,_,_,
        _,_,_,_,_,'g','g','g','g','g','g','g','g','g','g','g','g',_,_,_,_,_,_,_,
        _,_,_,'O','g','g','g','g','g','g','g','g','g','g','g','g','g','g','O',_,_,_,_,_,
        _,_,'O','g','g','g','g','O','O','O','W','W','O','O','O','g','g','g','g','O',_,_,_,
        _,'O','i','i','i','i','O','g','g','g','g','g','g','g','g','O','i','i','i','i','O',_,_,
        'O','i','i','i','O','O','g','g','g','O','O','O','O','g','g','g','O','O','i','i','i','i','O',
        'O','g','g','O','O','i','i','i','i','i','O','O','i','i','i','i','i','O','O','g','g','O',_,
        'O','g','g','O','i','G','G','i','i','i','i','i','i','i','G','G','i','O','i','i','i','i','O',
        'O','g','g','O','G','G','G','G','i','i','i','i','i','G','G','G','G','O','i','i','i','i','O',
        'O','O','O','O','G','G','g','G','G','O','O','O','O','G','G','g','G','G','O','O','O','O','O','O',
        _,'O','O','G','G','G','g','G','G','G','G','G','G','G','G','g','G','G','G','G','O','O',_,_,
        _,_,'O','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','O',_,_,_,
        _,_,_,'O','O','O','G','G','G','G','G','G','G','G','G','G','G','G','O','O','O',_,_,_,
    ],
    PLASMA_PRISM: [
        _,_,_,_,_,_,_,_,'O','O','b','b','b','b','O','O',_,_,_,_,_,_,_,_,
        _,_,_,_,_,'O','O','b','b','b','b','b','b','b','b','O','O',_,_,_,_,_,
        _,_,_,'O','O','b','b','b','C','C','C','C','C','C','b','b','b','O','O',_,_,_,_,
        _,_,'O','b','b','b','b','O','C','C','W','W','C','C','O','b','b','b','b','O',_,_,_,
        _,'O','b','b','b','b','O','b','b','C','C','C','C','b','b','O','b','b','b','b','O',_,_,
        'O','b','b','b','O','O','b','b','b','O','O','O','O','b','b','b','O','O','b','b','b','b','O',
        'O','b','b','O','O','b','b','b','b','b','O','O','b','b','b','b','b','O','O','b','b','b','O',
        'O','b','b','O','b','G','G','b','b','b','b','b','b','b','G','G','b','O','b','b','b','b','O',
        'O','b','b','O','G','G','G','G','b','b','b','b','b','G','G','G','G','O','b','b','b','b','O',
        'O','O','O','O','G','G','C','G','G','O','O','O','O','G','G','C','G','G','O','O','O','O','O','O',
        _,'O','O','G','G','G','C','G','G','G','G','G','G','G','G','C','G','G','G','G','O','O',_,_,
        _,_,'O','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','O',_,_,_,
        _,_,_,'O','O','O','G','G','G','G','G','G','G','G','G','G','G','G','O','O','O',_,_,_,
    ],
    VOID_STALKER: [
        _,_,_,_,_,_,_,_,'O','O','O','O','O','O','O','O',_,_,_,_,_,_,_,_,
        _,_,_,_,_,'O','O','p','p','p','p','p','p','p','p','O','O',_,_,_,_,_,
        _,_,_,'O','O','p','p','p','p','p','p','p','p','p','p','p','p','O','O',_,_,_,_,
        _,_,'O','p','p','p','p','O','O','O','W','W','O','O','O','p','p','p','p','O',_,_,_,
        _,'O','p','p','p','p','O','p','p','p','p','p','p','p','p','O','p','p','p','p','O',_,_,
        'O','p','p','p','O','O','p','p','p','O','O','O','O','p','p','p','O','O','p','p','p','p','O',
        'O','p','p','O','O','p','p','p','p','p','O','O','p','p','p','p','p','O','O','p','p','p','O',
        'O','p','p','O','p','G','G','p','p','p','p','p','p','p','G','G','p','O','p','p','p','p','O',
        'O','p','p','O','G','G','G','G','p','p','p','p','p','G','G','G','G','O','p','p','p','p','O',
        'O','O','O','O','G','G','p','G','G','O','O','O','O','G','G','p','G','G','O','O','O','O','O','O',
        _,'O','O','G','G','G','p','G','G','G','G','G','G','G','G','p','G','G','G','G','O','O',_,_,
        _,_,'O','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','O',_,_,_,
        _,_,_,'O','O','O','G','G','G','G','G','G','G','G','G','G','G','G','O','O','O',_,_,_,
    ],
    NEON_FANG: [
        _,_,_,_,_,_,_,_,'O','O','O','O','O','O','O','O',_,_,_,_,_,_,_,_,
        _,_,_,_,_,'O','O','n','n','n','n','n','n','n','n','O','O',_,_,_,_,_,
        _,_,_,'O','O','n','n','n','n','n','n','n','n','n','n','n','n','O','O',_,_,_,_,
        _,_,'O','n','n','n','n','O','O','O','W','W','O','O','O','n','n','n','n','O',_,_,_,
        _,'O','n','n','n','n','O','n','n','n','n','n','n','n','n','O','n','n','n','n','O',_,_,
        'O','n','n','n','O','O','n','n','n','O','O','O','O','n','n','n','O','O','n','n','n','n','O',
        'O','n','n','O','O','n','n','n','n','n','O','O','n','n','n','n','n','O','O','n','n','n','O',
        'O','n','n','O','n','G','G','n','n','n','n','n','n','n','G','G','n','O','n','n','n','n','O',
        'O','n','n','O','G','G','G','G','n','n','n','n','n','G','G','G','G','O','n','n','n','n','O',
        'O','O','O','O','G','G','n','G','G','O','O','O','O','G','G','n','G','G','O','O','O','O','O','O',
        _,'O','O','G','G','G','n','G','G','G','G','G','G','G','G','n','G','G','G','G','O','O',_,_,
        _,_,'O','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','O',_,_,_,
        _,_,_,'O','O','O','G','G','G','G','G','G','G','G','G','G','G','G','O','O','O',_,_,_,
    ],
    CYBER_NAPA: [
        _,_,_,_,_,_,_,_,'O','O','O','O','O','O','O','O',_,_,_,_,_,_,_,_,
        _,_,_,_,_,'O','O','n','n','G','G','G','G','n','n','O','O',_,_,_,_,_,
        _,_,_,'O','O','n','n','n','n','n','n','n','n','n','n','n','n','O','O',_,_,_,_,
        _,_,'O','n','n','n','n','O','O','O','W','W','O','O','O','n','n','n','n','O',_,_,_,
        _,'O','g','g','g','g','O','n','n','n','n','n','n','n','n','O','g','g','g','g','O',_,_,
        'O','g','g','g','O','O','n','n','n','O','O','O','O','n','n','n','O','O','g','g','g','g','O',
        'O','n','n','O','O','n','n','n','n','n','O','O','n','n','n','n','n','O','O','n','n','n','O',
        'O','n','n','O','n','G','G','n','n','n','n','n','n','n','G','G','n','O','n','n','n','n','O',
        'O','n','n','O','G','G','G','G','n','n','n','n','n','G','G','G','G','O','n','n','n','n','O',
        'O','O','O','O','G','G','Y','G','G','O','O','O','O','G','G','Y','G','G','O','O','O','O','O','O',
        _,'O','O','G','G','G','Y','G','G','G','G','G','G','G','G','Y','G','G','G','G','O','O',_,_,
        _,_,'O','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','O',_,_,_,
        _,_,_,'O','O','O','G','G','G','G','G','G','G','G','G','G','G','G','O','O','O',_,_,_,
    ]
};

export const PILOTS = [
    { name: 'Apex-Red', sprite: 'APEX_RED_NEUTRAL', color: '#ff0000', aiStyle: 'player' },
    { name: 'Plasma-Reef', sprite: 'PLASMA_REEF', color: '#00d4ff', aiStyle: 'aggressive' },
    { name: 'Iron-Vulture', sprite: 'IRON_VULTURE', color: '#d4af37', aiStyle: 'defensive' },
    { name: 'Plasma-Prism', sprite: 'PLASMA_PRISM', color: '#00d4ff', aiStyle: 'balanced' },
    { name: 'Void-Stalker', sprite: 'VOID_STALKER', color: '#8a2be2', aiStyle: 'sneaky' },
    { name: 'Neon-Fang', sprite: 'NEON_FANG', color: '#39ff14', aiStyle: 'aggressive' },
    { name: 'Cyber-Napa', sprite: 'CYBER_NAPA', color: '#39ff14', aiStyle: 'balanced' }
];

export class SpriteRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    renderSprite(data, x, y, shearOffset = 0, scale = 1) {
        const pixelSize = 2 * scale; // Scaled for retro feel
        const sx = x - (24 * pixelSize / 2);
        const sy = y - (13 * pixelSize / 2); // Corrected height from 16 to 13

        for (let r = 0; r < 13; r++) {
            // Calculate tilt: row-based shift for banking
            // row 0 (top) shifts most, row 12 (bottom) shifts least or vice versa
            // Let's shift top more to create a leaning effect
            const rowShear = (12 - r) * (shearOffset * 0.5);

            for (let c = 0; c < 24; c++) {
                const colorCode = data[r * 24 + c];
                if (colorCode === null || colorCode === _) continue;

                const finalX = sx + (c * pixelSize) + rowShear;
                this.ctx.fillStyle = getColor(colorCode);
                this.ctx.fillRect(finalX, sy + (r * pixelSize), pixelSize, pixelSize);
            }
        }
    }
}
