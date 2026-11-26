import { it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { games } from "../src/games";
import {
  freshState,
  hydrate,
  startSession,
  remainingSeconds,
} from "../src/model";
it("registers upgraded games under the legacy identifiers", () => {
  expect(Object.keys(games)).toEqual(["racer", "space", "rooftop", "smash", "flight", "merge", "moto"]);
  expect(games.racer).toMatchObject({
    title: "Super Kart 3D",
    path: "games/kart/index.html",
  });
  expect(games.space).toMatchObject({
    title: "Galactic Patrol",
    path: "games/galactic/index.html",
  });
  for (const game of Object.values(games))
    expect(game).toEqual(
      expect.objectContaining({
        preview: expect.any(String),
        controls: expect.any(Array),
        touch: expect.any(String),
      }),
    );
});
it("preserves complete V1 saves including either active game deadline", () => {
  for (const game of ["space", "racer"] as const) {
    const legacy = {
      ...freshState(),
      stars: 17,
      totalStars: 42,
      tickets: 2,
      settings: { ...freshState().settings, starCost: 8, focusMinutes: 12 },
      stats: { ...freshState().stats, math: { attempts: 9, correct: 7 } },
      custom: [
        {
          id: "mine",
          subject: "spelling" as const,
          prompt: "Write cat",
          answer: "cat",
        },
      ],
      session: { game, endsAt: 181000 },
    };
    const loaded = hydrate(JSON.parse(JSON.stringify(legacy)));
    expect(loaded).toEqual(legacy);
    expect(remainingSeconds(loaded.session, 151000)).toBe(30);
    expect(startSession(loaded, game, 2000).tickets).toBe(2);
  }
});
it("restores new paid games without spending again", () => {
  for (const game of ["rooftop", "smash", "flight", "merge", "moto"] as const) {
    const state = startSession({ ...freshState(), tickets: 3 }, game, 1000);
    const restored = hydrate(JSON.parse(JSON.stringify(state)));
    expect(restored.session).toEqual({ game, endsAt: 181000 });
    expect(restored.tickets).toBe(2);
    expect(startSession(restored, game, 2000)).toBe(restored);
  }
});

it("ships local preview and game entry files for all registered games", () => {
  for (const game of Object.values(games)) {
    expect(existsSync("public/" + game.path)).toBe(true);
    expect(existsSync("public/" + game.preview)).toBe(true);
    const html = readFileSync("public/" + game.path, "utf8");
    expect(html).not.toMatch(/src=["']https?:/);
    expect(html).toContain("Content-Security-Policy");
  }
});
