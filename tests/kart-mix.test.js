import { describe, it, expect } from "vitest";
import { AudioManager } from "../vendor/super-kart/src/audio/AudioManager.js";
describe("kart independent music mute", () => {
  it("never raises muted or quiet music during victory ducking", () => {
    const audio = new AudioManager();
    // A real bus-shaped sink verifies the volume the manager sends to its renderer.
    const levels = [];
    audio._music = { setVolume: (v) => levels.push(v) };
    audio.setMusicVolume(0);
    audio.duckMusic(0.55, 0);
    expect(levels.at(-1)).toBe(0);
    audio.setMusicVolume(0.04);
    audio.duckMusic(0.55, 0);
    expect(levels.at(-1)).toBeCloseTo(0.022);
  });
});
