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
    ]
};

export const PILOTS = [
    { name: 'Apex-Red', sprite: 'APEX_RED_NEUTRAL', color: '#ff0000', aiStyle: 'player' }
    // AI Pilots populated in main.js
];

export class SpriteRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    renderSprite(data, x, y, shearOffset = 0) {
        const pixelSize = 2; // Scaled for retro feel
        const sx = x - (24 * pixelSize / 2);
        const sy = y - (16 * pixelSize / 2);

        for (let r = 0; r < 13; r++) {
            for (let c = 0; c < 24; c++) {
                const colorCode = data[r * 24 + c];
                if (colorCode === null) continue;

                // Simple shearing for banking
                const finalX = sx + (c * pixelSize) + (shearOffset * (r / 5));
                this.ctx.fillStyle = getColor(colorCode);
                this.ctx.fillRect(finalX, sy + (r * pixelSize), pixelSize, pixelSize);
            }
        }
    }
}
