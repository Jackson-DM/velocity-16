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
  signs = [],
  theme = null,
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
    signs,
    theme,
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
  name: 'AURORA CAUSEWAY',
  textureKey: 'aurora-causeway-surface',
  totalLaps: 3,
  checkpointHalfWidth: 150,
  bounds: {
    cx: 1024,
    cy: 1024,
    a: 820,
    b: 470,
    dInner: 0.78,
    dOuter: 1.12,
    edgeWidth: 0.014,
  },
  zones: [
    {
      id: 'launch-crown-boost',
      type: 'boost',
      angle: -1.22,
      angleWidth: 0.06,
      dMin: 0.91,
      dMax: 1.02,
      impulse: 235,
    },
    {
      id: 'storm-cut-outer',
      type: 'hazard',
      angle: 0.56,
      angleWidth: 0.055,
      dMin: 0.955,
      dMax: 1.105,
      damage: 0.06,
    },
    {
      id: 'storm-cut-inner',
      type: 'hazard',
      angle: 0.79,
      angleWidth: 0.055,
      dMin: 0.795,
      dMax: 0.925,
      damage: 0.06,
    },
    {
      id: 'mercy-rail-recharge',
      type: 'recharge',
      angle: 1.72,
      angleWidth: 0.16,
      dMin: 1.035,
      dMax: 1.105,
      amount: 0.022,
    },
    {
      id: 'needle-gate-pressure',
      type: 'hazard',
      angle: 2.92,
      angleWidth: 0.05,
      dMin: 0.91,
      dMax: 0.985,
      damage: 0.055,
    },
    {
      id: 'needle-gate-boost',
      type: 'boost',
      angle: -2.85,
      angleWidth: 0.05,
      dMin: 0.795,
      dMax: 0.875,
      impulse: 285,
    },
  ],
  signs: [
    { id: 'launch-crown-warning', type: 'boost', angle: -1.39, d: 1.145, side: 'outer' },
    { id: 'storm-cut-outer-warning', type: 'hazard', angle: 0.34, d: 1.145, side: 'outer' },
    { id: 'storm-cut-inner-warning', type: 'hazard', angle: 0.62, d: 0.755, side: 'inner' },
    { id: 'mercy-rail-warning', type: 'recharge', angle: 1.47, d: 1.145, side: 'outer' },
    { id: 'needle-gate-warning', type: 'hazard', angle: 2.72, d: 1.145, side: 'outer' },
    { id: 'needle-boost-warning', type: 'boost', angle: -3.04, d: 0.755, side: 'inner' },
  ],
  theme: {
    id: 'aurora-causeway',
    roadBase: '#071126',
    roadAlt: '#0B1732',
    roadPanel: '#13264A',
    lane: '#FFE7A3',
    startLine: '#F2FCFF',
    outerEdge: '#00D9FF',
    innerEdge: '#FF9D1A',
    centerGuide: '#FFE7A3',
    outerPosts: '#C9FAFF',
    innerPosts: '#FFD07A',
    voidOuter: '#020915',
    voidOuterAccent: '#07304A',
    voidInner: '#080B1D',
    cityLightCool: '#21C7FF',
    cityLightWarm: '#FFB547',
    boostA: '#00E9FF',
    boostB: '#FFD64A',
    hazardA: '#FF3D24',
    hazardB: '#8F102A',
    rechargeA: '#B9FF63',
    rechargeB: '#E8FFF1',
    skyTop: '#030822',
    skyBottom: '#243B77',
    horizon: '#28D7FF',
    auroraA: '#35F0D0',
    auroraB: '#7D5CFF',
    skyline: '#071027',
    skylineLight: '#34CFFF',
    storm: '#5360A8',
    pylonAngles: [-1.44, -0.20, 1.14, 2.42, -2.18],
  },
});

export const TRACKS = {
  test: TRACK_TEST,
  official: TRACK_01,
};

export function getTrackByMode(trackMode) {
  return TRACKS[trackMode] || TRACK_TEST;
}
