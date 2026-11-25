import { it, expect } from "vitest";
import { createFixedClock } from "../vendor/space-clock.js";
it("keeps bullets and enemies equally fast at 30, 60 and 120 Hz", () => {
  for (const hz of [30, 60, 120]) {
    let frames = 0,
      bulletX = 0;
    const clock = createFixedClock(() => {
      frames++;
      bulletX += 20;
    });
    for (let i = 0; i < hz; i++) clock.advance(1 / hz);
    expect(frames).toBe(60);
    expect(bulletX).toBe(1200);
  }
});
it("does not run simulation at zero elapsed time or repay a background-tab backlog", () => {
  let frames = 0;
  const clock = createFixedClock(() => frames++);
  clock.advance(0);
  expect(frames).toBe(0);
  clock.advance(60);
  expect(frames).toBe(6);
});
