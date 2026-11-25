// Original Academy adapter: upstream view methods update as they draw.
// Run them at a fixed 60 Hz, independent of the display's refresh rate.
export function createFixedClock(update) {
  const step = 1 / 60;
  let accumulator = 0;
  return {
    advance(elapsed) {
      accumulator += Math.max(
        0,
        Math.min(Number.isFinite(elapsed) ? elapsed : 0, 0.1),
      );
      while (accumulator + 1e-9 >= step) {
        update(step);
        accumulator -= step;
      }
    },
  };
}
