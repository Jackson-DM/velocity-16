// Track definitions share one contract:
// - startX/startY/startHeading spawn the player.
// - checkpoints are ordered clockwise; index 0 is start/finish.
// - bounds describes the analytical oval used by collision and texture passes.

const DEFAULT_ANGLES = [
  -Math.PI / 2,
  -Math.PI / 4,
   0,
   Math.PI / 4,
   Math.PI / 2,
   3 * Math.PI / 4,
   Math.PI,
  -3 * Math.PI / 4,
];

function makeCheckpoint(bounds, angle, hw) {
  const { cx, cy, a, b } = bounds;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const px = cx + a * c;
  const py = cy + b * s;

  // Clockwise tangent for increasing ellipse angle.
  const tx = -a * s;
  const ty =  b * c;
  const len = Math.sqrt(tx * tx + ty * ty);
  const nx = tx / len;
  const ny = ty / len;

  return {
    cx: Math.round(px),
    cy: Math.round(py),
    nx: Number(nx.toFixed(3)),
    ny: Number(ny.toFixed(3)),
    hw,
    ax: Math.round(px - ny * hw),
    ay: Math.round(py + nx * hw),
    bx: Math.round(px + ny * hw),
    by: Math.round(py - nx * hw),
  };
}

function createOvalTrack({
  name,
  textureKey,
  totalLaps,
  bounds,
  checkpointHalfWidth,
  zones = [],
}) {
  return {
    name,
    textureKey,
    collisionSrc: 'analytical-oval',
    totalLaps,
    bounds,
    startX: bounds.cx,
    startY: bounds.cy - bounds.b,
    startHeading: 0,
    checkpoints: DEFAULT_ANGLES.map((angle) => makeCheckpoint(bounds, angle, checkpointHalfWidth)),
    zones,
  };
}

export const TRACK_TEST = createOvalTrack({
  name: 'FEEL LAB 02',
  textureKey: 'feel-lab-surface',
  totalLaps: 3,
  checkpointHalfWidth: 180,
  bounds: {
    cx: 1024,
    cy: 1024,
    a: 760,
    b: 500,
    dInner: 0.72,
    dOuter: 1.16,
    edgeWidth: 0.012,
  },
  zones: [
    {
      id: 'boost-exit-north',
      type: 'boost',
      angle: -0.84,
      angleWidth: 0.065,
      dMin: 0.86,
      dMax: 0.99,
      impulse: 260,
    },
    {
      id: 'boost-east-straight',
      type: 'boost',
      angle: 0.20,
      angleWidth: 0.06,
      dMin: 0.84,
      dMax: 1.00,
      impulse: 235,
    },
    {
      id: 'boost-risky-inner',
      type: 'boost',
      angle: 2.52,
      angleWidth: 0.055,
      dMin: 0.74,
      dMax: 0.82,
      impulse: 295,
    },
    {
      id: 'recharge-pit-south',
      type: 'recharge',
      angle: 1.88,
      angleWidth: 0.12,
      dMin: 1.07,
      dMax: 1.145,
      amount: 0.02,
    },
    {
      id: 'hazard-outer-west',
      type: 'hazard',
      angle: 3.08,
      angleWidth: 0.075,
      dMin: 1.035,
      dMax: 1.13,
      damage: 0.08,
    },
    {
      id: 'hazard-mid-southeast',
      type: 'hazard',
      angle: 0.95,
      angleWidth: 0.065,
      dMin: 0.88,
      dMax: 1.02,
      damage: 0.07,
    },
    {
      id: 'hazard-gate-north-left',
      type: 'hazard',
      angle: -1.92,
      angleWidth: 0.045,
      dMin: 0.86,
      dMax: 0.96,
      damage: 0.06,
    },
    {
      id: 'hazard-gate-north-right',
      type: 'hazard',
      angle: -1.62,
      angleWidth: 0.045,
      dMin: 0.96,
      dMax: 1.08,
      damage: 0.06,
    },
  ],
});

export const TRACK_01 = createOvalTrack({
  name: 'MUTE CITY I',
  textureKey: 'track-surface',
  totalLaps: 3,
  checkpointHalfWidth: 100,
  bounds: {
    cx: 512,
    cy: 512,
    a: 300,
    b: 262,
    dInner: 0.65,
    dOuter: 1.35,
    edgeWidth: 0.035,
  },
});

export const TRACKS = {
  test: TRACK_TEST,
  official: TRACK_01,
};

export function getTrackByMode(trackMode) {
  return TRACKS[trackMode] || TRACK_TEST;
}
