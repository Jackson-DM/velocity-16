// Frame time sampler. Warns to console if any frame exceeds 16.67ms (60fps budget).

const BUDGET_MS = 1000 / 60;

let lastTime = 0;
let frameCount = 0;
let slowFrames = 0;

export function perfStart() {
  lastTime = performance.now();
}

export function perfEnd() {
  const dt = performance.now() - lastTime;
  frameCount++;
  if (dt > BUDGET_MS) {
    slowFrames++;
    if (slowFrames <= 5 || slowFrames % 60 === 0) {
      console.warn(`[PERF] Frame ${frameCount}: ${dt.toFixed(2)}ms (budget: ${BUDGET_MS.toFixed(2)}ms)`);
    }
  }
  return dt;
}

export function getPerfStats() {
  return { frameCount, slowFrames };
}
