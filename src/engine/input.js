// Keyboard polling. No event queue — state is sampled each frame for zero latency.

const keys = new Set();

window.addEventListener('keydown', (e) => {
  keys.add(e.code);
  // Prevent arrow keys from scrolling the page
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => keys.delete(e.code));

// Returns the current input state. Call once per frame in main.js.
export function getInput() {
  return {
    left:  keys.has('ArrowLeft')  || keys.has('KeyA'),
    right: keys.has('ArrowRight') || keys.has('KeyD'),
    up:    keys.has('ArrowUp')    || keys.has('KeyW'),
    down:  keys.has('ArrowDown')  || keys.has('KeyS'),
    boost: keys.has('Space'),
  };
}
