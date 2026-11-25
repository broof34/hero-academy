import { test, expect } from "@playwright/test";
const legacy = {
  version: 1,
  stars: 17,
  totalStars: 42,
  tickets: 2,
  settings: { starCost: 8, focusMinutes: 12 },
};
test("launch briefing keeps a V1 balance intact until a game is launched", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate(
    (v) => localStorage.setItem("hero-academy:v1", JSON.stringify(v)),
    legacy,
  );
  await page.reload();
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Play Super Kart 3D" }).click();
  await expect(
    page.getByRole("heading", { name: "Super Kart 3D", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Before you race")).toBeVisible();
  await expect(page.getByText("Hold to drift")).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("hero-academy:v1")!).tickets,
    ),
  ).toBe(2);
  await page.getByRole("button", { name: "Back to arcade" }).click();
  await expect(page.getByTestId("star-balance")).toHaveText("17");
});
type KartDebug = {
  getState: () => string;
  playerKart: () => {
    state: { speed: number; heading: number; progress01: number };
  };
  aiControllerCount: number;
  loop: { elapsed: number; running: boolean };
  audio: { _muted: boolean };
};
test("3D racing actually drives; pause, fallback and reload preserve one deadline", async ({
  page,
  baseURL,
}) => {
  const errors: string[] = [],
    badAssets: string[] = [],
    external: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) badAssets.push(r.url());
  });
  page.on("request", (r) => {
    if (
      !r.url().startsWith(new URL(baseURL!).origin + "/") &&
      !r.url().startsWith("data:")
    )
      external.push(r.url());
  });
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("./");
  await page.evaluate(
    (v) => localStorage.setItem("hero-academy:v1", JSON.stringify(v)),
    legacy,
  );
  await page.reload();
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Play Super Kart 3D" }).click();
  await page.getByRole("button", { name: "Launch game · 1 ticket" }).click();
  const frame = page.frameLocator('iframe[title="Super Kart 3D"]');
  await expect(frame.getByRole("button", { name: /Start Race/ })).toBeVisible({
    timeout: 30000,
  });
  await page.waitForTimeout(650);
  await frame.getByRole("button", { name: /Start Race/ }).click();
  const getFrame = () =>
    page.frames().find((f) => f.url().includes("/games/kart/"))!;
  await expect
    .poll(
      () =>
        getFrame().evaluate(() =>
          (window as unknown as { __sk3d: KartDebug }).__sk3d?.getState(),
        ),
      { timeout: 45000 },
    )
    .toBe("race");
  expect(
    await getFrame().evaluate(
      () =>
        (window as unknown as { __sk3d: KartDebug }).__sk3d.aiControllerCount,
    ),
  ).toBe(5);
  await frame
    .locator("canvas")
    .first()
    .click({ position: { x: 300, y: 250 } });
  await page.keyboard.down("ArrowUp");
  await expect
    .poll(
      () =>
        getFrame().evaluate(
          () =>
            (window as unknown as { __sk3d: KartDebug }).__sk3d.playerKart()
              .state.speed,
        ),
      { timeout: 10000 },
    )
    .toBeGreaterThan(3);
  await page.keyboard.up("ArrowUp");
  await page.getByRole("button", { name: "Pause game", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume game", exact: true }).first(),
  ).toBeVisible();
  expect(
    await getFrame().evaluate(
      () => (window as unknown as { __sk3d: KartDebug }).__sk3d.loop.running,
    ),
  ).toBe(false);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hero-academy:v1")!),
  );
  expect(stored.tickets).toBe(1);
  expect(stored.stars).toBe(17);
  await page.getByRole("button", { name: "Expand game", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Exit expanded view" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to 2D" }).click();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("hero-academy:v1")!).session.endsAt,
    ),
  ).toBe(stored.session.endsAt);
  await expect(frame.getByRole("button", { name: "Accelerate" })).toBeVisible({
    timeout: 10000,
  });
  await page.clock.install();
  await page.clock.fastForward(181000);
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("hero-academy:v1")!).tickets,
    ),
  ).toBe(1);
  await page.reload();
  await expect(page.getByTestId("star-balance")).toHaveText("17");
  await expect(
    page.getByRole("button", { name: "Start Reading mission" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(badAssets).toEqual([]);
  expect(external).toEqual([]);
});
test("space action moves, fires and pauses inside the Academy", async ({
  page,
}) => {
  const errors: string[] = [],
    badAssets: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) badAssets.push(r.url());
  });
  await page.goto("./");
  await page.evaluate(
    (v) => localStorage.setItem("hero-academy:v1", JSON.stringify(v)),
    legacy,
  );
  await page.reload();
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Play Galactic Patrol" }).click();
  await page.getByRole("button", { name: "Launch game · 1 ticket" }).click();
  const frame = page.frameLocator('iframe[title="Galactic Patrol"]');
  await frame.getByRole("button", { name: "Launch patrol" }).waitFor();
  await page.waitForTimeout(650);
  await frame.getByRole("button", { name: "Launch patrol" }).click();
  await expect(frame.getByTestId("game-status")).toContainText("Playing");
  const actual = () =>
    page.frames().find((f) => f.url().includes("/games/galactic/"))!;
  type Patrol = {
    Game: { levelStarted: boolean };
    InPlay: { playerBullets: unknown[]; enemies: unknown[] };
    Character: { ship: { player: { pos: { y: number } } } };
  };
  await expect
    .poll(() =>
      actual().evaluate(
        () =>
          (window as unknown as { __patrol: Patrol }).__patrol.InPlay.enemies
            .length,
      ),
    )
    .toBeGreaterThan(0);
  const before = await actual().evaluate(
    () =>
      (window as unknown as { __patrol: Patrol }).__patrol.Character.ship.player
        .pos.y,
  );
  await frame.getByRole("button", { name: "Fly up" }).hover();
  await page.mouse.down();
  await expect
    .poll(() =>
      actual().evaluate(
        () =>
          (window as unknown as { __patrol: Patrol }).__patrol.Character.ship
            .player.pos.y,
      ),
    )
    .toBeLessThan(before);
  await page.mouse.up();
  await expect
    .poll(() =>
      actual().evaluate(
        () =>
          (window as unknown as { __patrol: Patrol }).__patrol.InPlay
            .playerBullets.length,
      ),
    )
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Pause game" }).click();
  await expect(page.getByText("Take a breath, hero.")).toBeVisible();
  await page.getByRole("button", { name: "Return to learning" }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Start Math mission" }).click();
  await expect(page.getByLabel("Choose a skill")).toBeVisible();
  expect(errors).toEqual([]);
  expect(badAssets).toEqual([]);
});
test("space audio recovers after host mute and pause", async ({ page }) => {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    window.AudioContext = class extends Native {
      constructor() {
        super();
        (window as unknown as { __testAudio: AudioContext }).__testAudio = this;
      }
    };
  });
  await page.goto("./");
  await page.evaluate(
    (v) => localStorage.setItem("hero-academy:v1", JSON.stringify(v)),
    legacy,
  );
  await page.reload();
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Play Galactic Patrol" }).click();
  await page.getByRole("button", { name: "Launch game · 1 ticket" }).click();
  await page.getByRole("button", { name: "Unmute game" }).click();
  const frame = page.frameLocator("iframe");
  await frame.getByRole("button", { name: "Launch patrol" }).waitFor();
  await page.waitForTimeout(650);
  await frame.getByRole("button", { name: "Launch patrol" }).click();
  const audioState = () =>
    page
      .frames()
      .find((f) => f.url().includes("/games/galactic/"))!
      .evaluate(
        () =>
          (window as unknown as { __testAudio: AudioContext }).__testAudio
            ?.state,
      );
  await expect.poll(audioState).toBe("running");
  await page.getByRole("button", { name: "Mute game", exact: true }).click();
  await expect.poll(audioState).toBe("suspended");
  await page.getByRole("button", { name: "Unmute game" }).click();
  await expect.poll(audioState).toBe("running");
  await page.getByRole("button", { name: "Pause game" }).click();
  await expect.poll(audioState).toBe("suspended");
  await page
    .getByRole("button", { name: "Resume game", exact: true })
    .first()
    .click();
  await expect.poll(audioState).toBe("running");
});
test("an active V1 session reloads without extending time or spending another ticket", async ({
  page,
}) => {
  await page.goto("./");
  const deadline = Date.now() + 60000;
  await page.evaluate(
    (v) =>
      localStorage.setItem(
        "hero-academy:v1",
        JSON.stringify({
          ...v.legacy,
          session: { game: "space", endsAt: v.deadline },
        }),
      ),
    { legacy, deadline },
  );
  await page.reload();
  await expect(page.locator('iframe[title="Galactic Patrol"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('iframe[title="Galactic Patrol"]')).toBeVisible();
  const save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hero-academy:v1")!),
  );
  expect(save.session.endsAt).toBe(deadline);
  expect(save.tickets).toBe(2);
  expect(save.stars).toBe(17);
  await page.clock.install();
  await page.clock.fastForward(61000);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Start Math mission" }),
  ).toBeVisible();
});
