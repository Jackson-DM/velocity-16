// MUTE CITY I — closed oval circuit definition.
// Oval: center (512,512), semi-axis A=300 (E-W), semi-axis B=262 (N-S).
// World convention: heading=0 = east (+X), positive Y = south (screen-down).
// Car travels clockwise on screen.
//
// 8 checkpoints parameterised at -90°,-45°,0°,45°,90°,135°,180°,-135°.
// Each gate: line segment perpendicular to the forward tangent, half-width hw=100.
// Gate endpoints pre-computed (no per-frame trig):
//   A = (cx - ny*hw, cy + nx*hw)
//   B = (cx + ny*hw, cy - nx*hw)
// where (nx,ny) is the normalised clockwise tangent at that oval position.

export const TRACK_01 = {
  name:        'MUTE CITY I',
  textureKey:  'track-surface',
  collisionSrc: null,
  totalLaps:   3,

  // Car spawn — placed at CP0, nose pointing east
  startX:      512,
  startY:      250,
  startHeading: 0,   // radians; 0 = east (+X)

  // Checkpoints — index 0 is the start/finish line.
  // Lap logic skips CP0 on the first pass (nextCp starts at 1).
  checkpoints: [
    // CP0  angle=-90° (top of oval, going east)
    { cx: 512, cy: 250, nx:  1.000, ny:  0.000, hw: 100,
      ax: 512, ay: 350, bx: 512, by: 150 },

    // CP1  angle=-45° (upper-right curve, going SE)
    { cx: 724, cy: 327, nx:  0.753, ny:  0.658, hw: 100,
      ax: 658, ay: 402, bx: 790, by: 252 },

    // CP2  angle=0°   (right side, going south)
    { cx: 812, cy: 512, nx:  0.000, ny:  1.000, hw: 100,
      ax: 712, ay: 512, bx: 912, by: 512 },

    // CP3  angle=45°  (lower-right curve, going SW)
    { cx: 724, cy: 697, nx: -0.753, ny:  0.658, hw: 100,
      ax: 658, ay: 622, bx: 790, by: 772 },

    // CP4  angle=90°  (bottom, going west)
    { cx: 512, cy: 774, nx: -1.000, ny:  0.000, hw: 100,
      ax: 512, ay: 674, bx: 512, by: 874 },

    // CP5  angle=135° (lower-left curve, going NW)
    { cx: 300, cy: 697, nx: -0.753, ny: -0.658, hw: 100,
      ax: 366, ay: 622, bx: 234, by: 772 },

    // CP6  angle=180° (left side, going north)
    { cx: 212, cy: 512, nx:  0.000, ny: -1.000, hw: 100,
      ax: 312, ay: 512, bx: 112, by: 512 },

    // CP7  angle=-135° (upper-left curve, going NE)
    { cx: 300, cy: 327, nx:  0.753, ny: -0.658, hw: 100,
      ax: 366, ay: 402, bx: 234, by: 252 },
  ],
};
