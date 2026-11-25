import { describe, expect, it } from "vitest";
import { feedbackFor, advanceStreak } from "../src/feedback";
import { freshState, hydrate, updateSettings } from "../src/model";
describe("presentation-only feedback", () => {
  it("varies ordinary impacts and distinguishes 3, 5 and 10 without changing rewards", () => {
    expect(feedbackFor(1, 0).label).toBe("POW!");
    expect(feedbackFor(2, 1).label).toBe("ZAP!");
    expect(feedbackFor(3, 2).tier).toBe("fire");
    expect(feedbackFor(5, 3).tier).toBe("electric");
    expect(feedbackFor(10, 4).tier).toBe("legendary");
    expect(advanceStreak(4, false)).toBe(0);
    expect(advanceStreak(9, true)).toBe(10);
    expect(advanceStreak(4, true, false)).toBe(0);
  });
});
describe("audio preference compatibility", () => {
  it("migrates the old sound switch without losing progress or turning on auto speech", () => {
    const s = hydrate({
      version: 1,
      stars: 17,
      totalStars: 21,
      tickets: 2,
      settings: { sound: true },
    });
    expect(s.settings.sound).toBe(true);
    expect(s.settings.effectsSound).toBe(true);
    expect(s.settings.autoRead).toBe(false);
    expect(s.stars).toBe(17);
    expect(s.tickets).toBe(2);
  });
  it("keeps channel mutes independent and bounds fractional volume/rate", () => {
    const s = updateSettings(freshState(), {
      sound: true,
      effectsSound: false,
      effectsVolume: 8,
      speechVolume: -2,
      speechRate: 9,
    });
    expect(s.settings.sound).toBe(true);
    expect(s.settings.effectsSound).toBe(false);
    expect(s.settings.effectsVolume).toBe(1);
    expect(s.settings.speechVolume).toBe(0);
    expect(s.settings.speechRate).toBe(1.2);
    expect(
      updateSettings(s, { effectsVolume: 0.35 }).settings.effectsVolume,
    ).toBe(0.35);
  });
});
