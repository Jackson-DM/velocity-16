// Track definition — texture reference, collision bitmask path, and waypoints.
// Phase 1: texture is procedurally generated in main.js.

export const TRACK_01 = {
  name: 'MUTE CITY I',
  textureKey: 'track-surface',   // resolved by renderer
  collisionSrc: null,            // Phase 2: path to track-collision.png
  waypoints: [],                 // Phase 2: array of { x, y } world coords
};
