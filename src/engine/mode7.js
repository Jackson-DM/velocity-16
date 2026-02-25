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

// Sky: F-Zero style deep space gradient, bright neon glow at horizon.
export function renderSky(outBuffer, screenW, horizon) {
  // Integer horizon prevents horizon line from landing mid-row.
  const hY = Math.round(horizon);

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

  // Horizon scanline: bright neon cyan — written at an integer row.
  const cyan = (0xFF000000 | (255 << 16) | (255 << 8) | 0) >>> 0;
  const hRow = hY * screenW;
  for (let px = 0; px < screenW; px++) {
    outBuffer[hRow + px] = cyan;
  }
}
