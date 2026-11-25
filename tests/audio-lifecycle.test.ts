import { describe, it, expect, vi } from "vitest";
import { SoundEngine } from "../src/audio";
import { freshState } from "../src/model";
describe("audio lifecycle", () => {
  it("queues suspension even when an earlier resume is still pending", () => {
    const calls: string[] = [];
    class Context {
      state = "suspended";
      resume() {
        calls.push("resume");
        return new Promise<void>(() => {});
      }
      suspend() {
        calls.push("suspend");
        return Promise.resolve();
      }
      close() {
        return Promise.resolve();
      }
    }
    vi.stubGlobal("AudioContext", Context);
    try {
      const engine = new SoundEngine();
      engine.configure({ ...freshState().settings, effectsSound: true });
      engine.unlock();
      engine.stop();
      expect(calls).toEqual(["resume", "suspend"]);
      engine.unlock();
      expect(calls).toEqual(["resume", "suspend", "resume"]);
      engine.dispose();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
