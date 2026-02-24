// MODE 7 SCANLINE RENDERER
// Lode Vandevenne's floor-casting algorithm, adapted for SNES Mode 7 style.
// Pure math, no state. Called once per frame from renderer.js.
//
// ABGR Uint32 color format (little-endian ImageData):
//   bits  0- 7 = R,  bits  8-15 = G,  bits 16-23 = B,  bits 24-31 = A
//   e.g., opaque cyan (R=0,G=255,B=255) = (0xFF000000 | (255<<16) | (255<<8) | 0) >>> 0

export function renderFloor(outBuffer, screenW, screenH, camera, floorTexture) {
  const { x: camX, y: camY, angle, height: camH, fov, horizon } = camera;
  // scale: world units → texture pixels. e.g. scale=4 means 1 tile = (tilePixels/4) world units.
  const { pixels: texPixels, width: texW, height: texH, scale: texScale = 1 } = floorTexture;
  const texMaskW = texW - 1;
  const texMaskH = texH - 1;

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  // Camera plane perpendicular to view direction (controls horizontal FOV).
  // planeX/Y is the half-width vector of the view frustum at unit depth.
  const planeX = -sinA * fov;
  const planeY =  cosA * fov;

  // Ray directions at leftmost and rightmost screen columns:
  //   leftRay  = dir - plane  (screen-left edge)
  //   rightRay = dir + plane  (screen-right edge)
  const leftRayX  = cosA - planeX;   // = cosA + sinA*fov
  const leftRayY  = sinA - planeY;   // = sinA - cosA*fov
  const rightRayX = cosA + planeX;   // = cosA - sinA*fov
  const rightRayY = sinA + planeY;   // = sinA + cosA*fov

  // Step direction per pixel across a scanline.
  // This is constant per frame; scaled by rowZ/screenW each row.
  const dRayX = rightRayX - leftRayX;  // = -2*sinA*fov
  const dRayY = rightRayY - leftRayY;  // =  2*cosA*fov

  for (let y = horizon + 1; y < screenH; y++) {
    // Perspective depth: near horizon = far, near bottom = close
    const rowZ = camH / (y - horizon);
    const scale = rowZ / screenW;

    // World position at the left edge of this scanline
    let floorX = camX + leftRayX * rowZ;
    let floorY = camY + leftRayY * rowZ;

    // World step per pixel (interpolate from left ray to right ray)
    const stepX = dRayX * scale;
    const stepY = dRayY * scale;

    const rowOffset = y * screenW;

    for (let px = 0; px < screenW; px++) {
      // texScale maps world units → texture pixels. Math.floor + mask wraps correctly.
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
  for (let y = 0; y < horizon; y++) {
    const t = y / horizon;  // 0 = top (dark), 1 = horizon (bright glow)

    // ABGR: R=bits0-7, G=bits8-15, B=bits16-23, A=bits24-31
    const r = Math.round(t * 80)  | 0;          //   0 → 80  (warm glow near horizon)
    const g = Math.round(t * 180) | 0;          //   0 → 180 (teal midtones)
    const b = Math.round(30 + t * 200) | 0;     //  30 → 230 (deep blue → bright)
    // Use >>> 0 to coerce Int32 → Uint32 before writing
    const color = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;

    const rowOffset = y * screenW;
    for (let px = 0; px < screenW; px++) {
      outBuffer[rowOffset + px] = color;
    }
  }

  // Horizon scanline: bright neon cyan (R=0, G=255, B=255, A=255)
  const cyan = (0xFF000000 | (255 << 16) | (255 << 8) | 0) >>> 0;
  const hRow = horizon * screenW;
  for (let px = 0; px < screenW; px++) {
    outBuffer[hRow + px] = cyan;
  }
}
