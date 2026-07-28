// MODE 7 SCANLINE RENDERER
// Lode Vandevenne's floor-casting algorithm, adapted for SNES Mode 7 style.
// Pure math, no state. Called once per frame from renderer.js.
//
// ABGR Uint32 color format (little-endian ImageData):
//   bits  0- 7 = R,  bits  8-15 = G,  bits 16-23 = B,  bits 24-31 = A
//   e.g., opaque cyan (R=0,G=255,B=255) = (0xFF000000 | (255<<16) | (255<<8) | 0) >>> 0
//
// CRITICAL: horizon must be snapped to an integer scanline before use.
// A float horizon causes rowOffset = y * screenW to land mid-row in the
// Uint32Array, breaking scanline alignment and making the floor "slide."

import { renderStarfield } from '../graphics/starfield.js';

function C(r, g, b) {
  return (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
}

function rgbFromHex(hex, fallback) {
  if (typeof hex !== 'string') return fallback;
  const value = Number.parseInt(hex.replace('#', ''), 16);
  if (!Number.isFinite(value)) return fallback;
  return {
    r: (value >> 16) & 0xFF,
    g: (value >> 8) & 0xFF,
    b: value & 0xFF,
  };
}

function lerpColor(a, b, t) {
  return C(
    Math.round(a.r + (b.r - a.r) * t),
    Math.round(a.g + (b.g - a.g) * t),
    Math.round(a.b + (b.b - a.b) * t),
  );
}

export function renderFloor(outBuffer, screenW, screenH, camera, floorTexture) {
  const { x: camX, y: camY, angle, height: camH, fov } = camera;
  // Snap to integer scanline — prevents mid-row pixel writes when drift
  // shifts camera.horizon to a fractional value.
  const horizonI = Math.round(camera.horizon);

  const { pixels: texPixels, width: texW, height: texH, scale: texScale = 1 } = floorTexture;
  const texMaskW = texW - 1;
  const texMaskH = texH - 1;

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  // Camera plane perpendicular to view direction (controls horizontal FOV).
  const planeX = -sinA * fov;
  const planeY =  cosA * fov;

  // Ray directions at leftmost and rightmost screen columns.
  const leftRayX  = cosA - planeX;
  const leftRayY  = sinA - planeY;
  const rightRayX = cosA + planeX;
  const rightRayY = sinA + planeY;

  // Step direction per pixel — constant per frame, scaled by rowZ/screenW each row.
  const dRayX = rightRayX - leftRayX;
  const dRayY = rightRayY - leftRayY;

  for (let y = horizonI + 1; y < screenH; y++) {
    // Perspective depth using integer horizon — consistent vanishing point.
    const rowZ  = camH / (y - horizonI);
    const scale = rowZ / screenW;

    let floorX = camX + leftRayX * rowZ;
    let floorY = camY + leftRayY * rowZ;

    const stepX = dRayX * scale;
    const stepY = dRayY * scale;

    const rowOffset = y * screenW;   // y is always an integer here — correct alignment

    for (let px = 0; px < screenW; px++) {
      const tx = Math.floor(floorX * texScale) & texMaskW;
      const ty = Math.floor(floorY * texScale) & texMaskH;
      outBuffer[rowOffset + px] = texPixels[ty * texW + tx];
      floorX += stepX;
      floorY += stepY;
    }
  }
}

function renderAuroraBand(outBuffer, screenW, skyH, frame, theme) {
  const auroraA = rgbFromHex(theme.auroraA, { r: 53, g: 240, b: 208 });
  const auroraB = rgbFromHex(theme.auroraB, { r: 125, g: 92, b: 255 });

  for (let x = 0; x < screenW; x++) {
    const phase = x * 0.031 + frame * 0.008;
    const center = Math.round(skyH * 0.30 + Math.sin(phase) * 4 + Math.sin(phase * 0.43 + 1.7) * 3);
    const thickness = 3 + Math.round((Math.sin(x * 0.017 + frame * 0.004) + 1) * 1.5);

    for (let offset = -thickness; offset <= thickness; offset++) {
      const y = center + offset;
      if (y < 1 || y >= skyH - 3) continue;
      const edgeFade = 1 - Math.abs(offset) / Math.max(1, thickness + 1);
      if (edgeFade < 0.35 && ((x + y) & 1)) continue;
      outBuffer[y * screenW + x] = lerpColor(auroraA, auroraB, (Math.sin(phase * 0.6) + 1) * 0.5);
    }
  }
}

function renderSkyline(outBuffer, screenW, skyH, frame, theme, camera) {
  const skyline = rgbFromHex(theme.skyline, { r: 7, g: 16, b: 39 });
  const light = rgbFromHex(theme.skylineLight, { r: 52, g: 207, b: 255 });
  const baseShift = Math.floor((camera?.angle ?? 0) * 20);

  for (let x = 0; x < screenW; x += 4) {
    const seed = ((x + baseShift) * 1103515245 + 12345) >>> 0;
    const edgeWeight = Math.abs(x - screenW * 0.5) / (screenW * 0.5);
    const height = 2 + Math.floor(((seed >> 25) & 7) * (0.35 + edgeWeight * 0.65));
    const width = 2 + ((seed >> 7) & 3);

    for (let px = x; px < Math.min(screenW, x + width); px++) {
      for (let y = skyH - 1; y >= Math.max(1, skyH - height); y--) {
        outBuffer[y * screenW + px] = C(skyline.r, skyline.g, skyline.b);
      }
    }

    if (height > 4 && ((seed >> 13) & 3) === 0) {
      const lightY = skyH - 2 - ((frame >> 5) + x) % Math.max(2, height - 2);
      if (lightY > 0 && lightY < skyH) {
        outBuffer[lightY * screenW + Math.min(screenW - 1, x + 1)] = C(light.r, light.g, light.b);
      }
    }
  }
}

function renderCausewayPylons(outBuffer, screenW, skyH, frame, theme) {
  const pylon = rgbFromHex(theme.storm, { r: 83, g: 96, b: 168 });
  const beacon = C(255, 92, 48);
  const shift = Math.floor(frame * 0.02) % 72;

  for (let x = -shift; x < screenW + 20; x += 72) {
    const height = 8 + ((x + 360) % 11);
    for (let y = skyH - 2; y >= Math.max(1, skyH - height); y--) {
      if (x >= 0 && x < screenW) outBuffer[y * screenW + x] = C(pylon.r, pylon.g, pylon.b);
    }
    if (x >= 0 && x < screenW && ((frame >> 4) & 1) === 0) {
      outBuffer[Math.max(1, skyH - height) * screenW + x] = beacon;
    }
  }
}

function renderDistantLightning(outBuffer, screenW, skyH, frame) {
  const cycle = frame % 420;
  if (cycle > 16) return;

  const xBase = cycle < 8 ? Math.round(screenW * 0.83) : Math.round(screenW * 0.14);
  const color = cycle < 5 ? C(180, 205, 255) : C(82, 104, 180);
  let x = xBase;
  for (let y = Math.round(skyH * 0.34); y < skyH - 3; y++) {
    x += ((y * 17 + frame) % 3) - 1;
    if (x >= 0 && x < screenW) outBuffer[y * screenW + x] = color;
    if ((y & 3) === 0 && x + 1 < screenW) outBuffer[y * screenW + x + 1] = color;
  }
}

function renderAuroraSky(outBuffer, screenW, skyH, frame, track, camera) {
  const theme = track.theme;
  const top = rgbFromHex(theme.skyTop, { r: 3, g: 8, b: 34 });
  const bottom = rgbFromHex(theme.skyBottom, { r: 36, g: 59, b: 119 });

  for (let y = 0; y < skyH; y++) {
    const t = y / Math.max(1, skyH);
    const color = lerpColor(top, bottom, t);
    const rowOffset = y * screenW;
    for (let px = 0; px < screenW; px++) outBuffer[rowOffset + px] = color;
  }

  renderAuroraBand(outBuffer, screenW, skyH, frame, theme);
  renderSkyline(outBuffer, screenW, skyH, frame, theme, camera);
  renderCausewayPylons(outBuffer, screenW, skyH, frame, theme);
  renderDistantLightning(outBuffer, screenW, skyH, frame);
}

// Sky: F-Zero style deep space gradient, bright neon glow at horizon.
// Optional starfield overlay: pass stars array + frame for twinkling.
export function renderSky(outBuffer, screenW, horizon, starfield = null, frame = 0, track = null, camera = null) {
  // Integer horizon prevents horizon line from landing mid-row.
  const hY = Math.round(horizon);

  if (track?.theme?.id === 'aurora-causeway') {
    renderAuroraSky(outBuffer, screenW, hY, frame, track, camera);
  } else {
    for (let y = 0; y < hY; y++) {
      const t = y / hY;   // 0 = top (dark), 1 = horizon (bright glow)

      const r = Math.round(t * 80)  | 0;
      const g = Math.round(t * 180) | 0;
      const b = Math.round(30 + t * 200) | 0;
      const color = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;

      const rowOffset = y * screenW;
      for (let px = 0; px < screenW; px++) {
        outBuffer[rowOffset + px] = color;
      }
    }
  }

  // Star overlay — drawn after gradient fill, before horizon line
  if (starfield) {
    renderStarfield(outBuffer, screenW, hY, starfield, frame);
  }

  // Horizon scanline: bright neon cyan — written at an integer row.
  const horizonRgb = rgbFromHex(track?.theme?.horizon, { r: 0, g: 255, b: 255 });
  const cyan = C(horizonRgb.r, horizonRgb.g, horizonRgb.b);
  const hRow = hY * screenW;
  for (let px = 0; px < screenW; px++) {
    outBuffer[hRow + px] = cyan;
  }
}
