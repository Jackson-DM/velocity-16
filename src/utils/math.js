// Zero-dependency math kit used by every module.

export const lerp = (a, b, t) => a + (b - a) * t;

export const clamp = (v, min, max) => v < min ? min : v > max ? max : v;

// Wrap angle into [-PI, PI]
export const wrapAngle = (a) => {
  while (a >  Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
};

// Faster than Math.floor for positive numbers
export const fastFloor = (v) => v | 0;
