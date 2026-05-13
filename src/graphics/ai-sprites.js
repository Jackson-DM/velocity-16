// ai-sprites.js — AI racer sprite builder.
// Same 24×16 / 9-frame shear structure as sprites.js.
// buildAiSprite(primaryColor, accentColor) — swaps body/fin/glow/nozzle colors.
// Returns identical {frames, frameW, frameH, count} shape so blitCarSprite reuses it.

import { PALETTE } from './palette.js';
import { clamp }   from '../utils/math.js';

// ─── hexToABGR ────────────────────────────────────────────────────────────────
// Converts '#RRGGBB' hex string to ABGR Uint32 (opaque).
function hexToABGR(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
}

// ─── Neutral template pixels (same layout as buildCarSprite NEUTRAL) ──────────
// Color slots: O=outline, B=body, V=fin, C=cockpit, W=glint, G=glow, Y=nozzle, D=shadow
const _O = PALETTE.BLACK;
const _B = PALETTE.DEEP_BLUE;
const _V = PALETTE.VIOLET;
const _C = PALETTE.NEON_CYAN;
const _W = PALETTE.WHITE;
const _G = PALETTE.NEON_GREEN;
const _Y = PALETTE.NEON_YELLOW;
const _D = PALETTE.DARK_GRAY;
const __ = 0x00000000;

// Same pixel art layout as NEUTRAL in sprites.js
const NEUTRAL_TEMPLATE = new Uint32Array([
  //Row 0
  __,__,__,__,__,__,__,__,_O,_O,_O,_O,_O,_O,_O,_O,__,__,__,__,__,__,__,__,
  //Row 1
  __,__,__,__,__,_O,_O,_O,_B,_B,_B,_B,_B,_B,_B,_B,_O,_O,_O,__,__,__,__,__,
  //Row 2
  __,__,__,_O,_O,_B,_B,_B,_B,_B,_C,_C,_B,_B,_B,_B,_B,_B,_B,_O,_O,__,__,__,
  //Row 3
  __,__,_O,_B,_B,_B,_B,_B,_B,_B,_W,_C,_B,_B,_B,_B,_B,_B,_B,_B,_B,_O,__,__,
  //Row 4
  __,_O,_B,_B,_B,_B,_B,_V,_V,_B,_B,_B,_B,_V,_V,_B,_B,_B,_B,_B,_B,_B,_O,__,
  //Row 5
  _O,_B,_B,_B,_B,_B,_V,_V,_V,_B,_B,_B,_B,_V,_V,_V,_B,_B,_B,_B,_B,_B,_B,_O,
  //Row 6
  _O,_B,_B,_B,_B,_V,_V,_V,_V,_B,_B,_B,_B,_V,_V,_V,_V,_B,_B,_B,_B,_B,_B,_O,
  //Row 7
  _O,_D,_B,_B,_B,_V,_G,_G,_V,_B,_B,_B,_B,_V,_G,_G,_V,_B,_B,_B,_D,_D,_B,_O,
  //Row 8
  _O,_D,_D,_B,_B,_G,_G,_G,_G,_B,_B,_B,_B,_G,_G,_G,_G,_B,_B,_D,_D,_D,_B,_O,
  //Row 9
  _O,_D,_D,_D,_G,_G,_Y,_G,_G,_B,_B,_B,_B,_G,_G,_Y,_G,_G,_D,_D,_D,_D,_D,_O,
  //Row 10
  __,_O,_D,_D,_G,_G,_Y,_G,_G,_D,_D,_D,_D,_G,_G,_Y,_G,_G,_D,_D,_D,_D,_O,__,
  //Row 11
  __,__,_O,_D,_D,_G,_G,_G,_G,_D,_D,_D,_D,_G,_G,_G,_G,_D,_D,_D,_D,_O,__,__,
  //Row 12
  __,__,__,_O,_O,_D,_D,_G,_G,_D,_D,_D,_D,_G,_G,_D,_D,_D,_D,_O,_O,__,__,__,
  //Row 13
  __,__,__,__,__,_O,_O,_D,_G,_G,_D,_D,_G,_G,_D,_D,_O,_O,__,__,__,__,__,__,
  //Row 14
  __,__,__,__,__,__,__,_O,_O,_G,_G,_G,_G,_O,_O,__,__,__,__,__,__,__,__,__,
  //Row 15
  __,__,__,__,__,__,__,__,__,_O,_O,_O,_O,__,__,__,__,__,__,__,__,__,__,__,
]);

// ─── buildAiSprite ────────────────────────────────────────────────────────────
// primaryColor: '#RRGGBB' for body/fin
// accentColor:  '#RRGGBB' for glow/nozzle/cockpit
export function buildAiSprite(primaryColor, accentColor) {
  const FW = 24, FH = 16, COUNT = 9;

  const bodyCol    = hexToABGR(primaryColor);
  const accentCol  = hexToABGR(accentColor);

  // Build a remapped neutral frame: swap original colors to new palette
  const remapped = new Uint32Array(FW * FH);
  for (let i = 0; i < FW * FH; i++) {
    const p = NEUTRAL_TEMPLATE[i];
    if      (p === _B || p === _V)  remapped[i] = bodyCol;   // body + fins
    else if (p === _G || p === _Y)  remapped[i] = accentCol; // glow + nozzle
    else if (p === _C || p === _W)  remapped[i] = accentCol; // cockpit/glint
    else                             remapped[i] = p;          // outline/shadow/transparent
  }

  // Bake 9 shear frames
  const frames = new Uint32Array(FW * FH * COUNT);
  for (let f = 0; f < COUNT; f++) {
    const shearOffset = f - 4;
    const base        = f * FW * FH;
    for (let y = 0; y < FH; y++) {
      const shift = Math.round(shearOffset * y / 15);
      for (let x = 0; x < FW; x++) {
        const srcX = x - shift;
        if (srcX < 0 || srcX >= FW) continue;
        frames[base + y * FW + x] = remapped[y * FW + srcX];
      }
    }
  }

  return { frames, frameW: FW, frameH: FH, count: COUNT };
}
