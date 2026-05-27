export function angleDelta(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function getTrackCoord(track, x, y) {
  const { cx, cy, a, b } = track.bounds;
  const dx = x - cx;
  const dy = y - cy;

  return {
    angle: Math.atan2(dy / b, dx / a),
    d: Math.sqrt((dx / a) * (dx / a) + (dy / b) * (dy / b)),
  };
}

export function pointFromTrackCoord(track, angle, d) {
  const { cx, cy, a, b } = track.bounds;
  return {
    x: cx + Math.cos(angle) * a * d,
    y: cy + Math.sin(angle) * b * d,
  };
}

export function isPointInTrackZone(track, zone, x, y) {
  const coord = getTrackCoord(track, x, y);
  return isTrackCoordInZone(coord.angle, coord.d, zone);
}

export function isTrackCoordInZone(angle, d, zone) {
  const radialHit = d >= zone.dMin && d <= zone.dMax;
  const angleHit = Math.abs(angleDelta(angle, zone.angle)) <= zone.angleWidth;
  return radialHit && angleHit;
}

export function findTrackZoneForCoord(track, angle, d, type = null) {
  if (!track.zones) return null;
  return track.zones.find((zone) => {
    if (type && zone.type !== type) return false;
    return isTrackCoordInZone(angle, d, zone);
  }) ?? null;
}

export function findTrackZoneNearCoord(track, angle, d, type = null, angleMargin = 0, dMargin = 0) {
  if (!track.zones) return null;
  return track.zones.find((zone) => {
    if (type && zone.type !== type) return false;
    const radialHit = d >= zone.dMin - dMargin && d <= zone.dMax + dMargin;
    const angleHit = Math.abs(angleDelta(angle, zone.angle)) <= zone.angleWidth + angleMargin;
    return radialHit && angleHit;
  }) ?? null;
}

export function findTrackZoneAtPoint(track, x, y, type = null) {
  if (!track.zones) return null;
  return track.zones.find((zone) => {
    if (type && zone.type !== type) return false;
    return isPointInTrackZone(track, zone, x, y);
  }) ?? null;
}
