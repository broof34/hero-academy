import { describe, it, expect } from "vitest";
import {
  freshState,
  hydrate,
  submitAnswer,
  redeemTicket,
  startSession,
  remainingSeconds,
  updateSettings,
  grantStars,
} from "../src/model";
const question = { id: "one", subject: "math" as const, answer: "5" };
describe("learning rewards", () => {
  it("keeps earned stars on mistakes, rewards retries, and prevents double rewards", () => {
    let state = grantStars(freshState(), 4);
    state = submitAnswer(state, question, "4");
    expect(state.stars).toBe(4);
    expect(state.stats.math.attempts).toBe(1);
    state = submitAnswer(state, question, " 5 ");
    expect(state.stars).toBe(5);
    expect(state.stats.math.correct).toBe(1);
    expect(submitAnswer(state, question, "5").stars).toBe(5);
  });
  it("never grants a ticket without enough stars", () => {
    expect(redeemTicket(freshState()).tickets).toBe(0);
    const state = redeemTicket(grantStars(freshState(), 10));
    expect(state.tickets).toBe(1);
    expect(state.stars).toBe(0);
  });
  it("requires a ticket and gives a fixed wall-clock deadline", () => {
    expect(startSession(freshState(), "space", 1000).session).toBeNull();
    const state = startSession(
      redeemTicket(grantStars(freshState(), 10)),
      "space",
      1000,
    );
    expect(state.tickets).toBe(0);
    expect(state.session?.endsAt).toBe(181000);
    expect(remainingSeconds(state.session, 151001)).toBe(30);
    expect(remainingSeconds(state.session, 500000)).toBe(0);
    expect(startSession(state, "racer", 2000)).toEqual(state);
  });
  it("normalizes spelling but rejects empty answers", () => {
    const q = { id: "two", subject: "spelling" as const, answer: "Cat" };
    expect(submitAnswer(freshState(), q, " CAT ").stars).toBe(1);
    expect(submitAnswer(freshState(), q, "").stats.spelling.attempts).toBe(0);
  });
});
describe("persistence and settings", () => {
  it("loads old saves with safe defaults and keeps progress", () => {
    const state = hydrate({ version: 1, stars: 7, totalStars: 9 });
    expect(state.stars).toBe(7);
    expect(state.settings.gameMinutes).toBe(3);
    expect(state.stats.reading.correct).toBe(0);
  });
  it("rejects broken and future saves rather than silently clearing them", () => {
    expect(() => hydrate({ version: 99, stars: 8 })).toThrow();
    expect(() => hydrate({ version: 1, stars: -2 })).toThrow();
  });
  it("bounds adult settings and keeps at least one subject selected", () => {
    const state = updateSettings(freshState(), {
      gameMinutes: -5,
      starCost: 0,
      focusMinutes: 999,
      subjects: [],
    });
    expect(state.settings.gameMinutes).toBe(1);
    expect(state.settings.starCost).toBe(1);
    expect(state.settings.focusMinutes).toBe(60);
    expect(state.settings.subjects).toEqual(["math"]);
  });
});
