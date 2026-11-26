import { expect, test, type Page } from "@playwright/test";

const appKey = "hero-academy:v1";
const motoKey = "hero-academy:moto-rush:v1";
type Moto = {
  G: { state: string; elapsed: number; levelIdx: number; menuSelection: number; bike: { x: number } };
  goldenManifest: { levelCount: number };
  runtimeSnapshot: () => { audio: { gain: number; context: string } };
  uiSnapshot: () => { buttons: Array<{ id: string; x: number; y: number; w: number; h: number }> };
  input: {
    inspect: () => { sources: { pointer: { gas: boolean; leanFwd: boolean } } };
    getConfig: () => { pointerSurface: { zones: Array<{ command: string; x: number; y: number }> } };
  };
};

async function launch(page: Page) {
  await page.addInitScript((key) => {
    if (top !== self || localStorage.getItem(key)) return;
    localStorage.setItem(key, JSON.stringify({
      version: 1, stars: 23, totalStars: 48, tickets: 2,
      settings: { gameMinutes: 1, effectsSound: true, effectsVolume: .45 },
    }));
  }, appKey);
  await page.goto("./");
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Play Moto Rush X3" }).click();
  await expect.poll(() => page.getByRole("img", { name: "Moto Rush X3 actual gameplay" })
    .evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("button", { name: /Launch game/ }).click();
  await expect(page.getByText(/Controls stay inside your game/)).toBeVisible();
  const frame = () => page.frames().find((frame) => frame.url().includes("/games/moto/"))!;
  expect(await frame().evaluate(() => (window as unknown as { __moto: Moto }).__moto.goldenManifest.levelCount)).toBe(16);
  return frame;
}

function academySave(page: Page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), appKey);
}

test("Moto Rush completes a course, keeps progression, and preserves the paid deadline", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", response => { if (response.status() >= 400) errors.push(response.url()); });
  page.on("request", request => {
    if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(test.info().project.use.baseURL!).origin)
      errors.push(request.url());
  });
  const frame = await launch(page);
  const paid = await academySave(page);
  expect(paid).toMatchObject({ stars: 23, tickets: 1, session: { game: "moto" } });

  const ride = () => frame().evaluate(() => {
    // All state is observed from the existing public runtime. Play uses real key input.
    const { G, runtimeSnapshot } = (window as unknown as { __moto: Moto }).__moto;
    return { state: G.state, elapsed: G.elapsed, level: G.levelIdx, x: G.bike?.x, audio: runtimeSnapshot().audio };
  });
  const course = await frame().evaluate(() => (window as unknown as { __moto: Moto }).__moto.uiSnapshot()
    .buttons.find(button => button.id === "lvl0")!);
  await frame().locator("canvas").click({ position: { x: course.x + course.w / 2, y: course.y + course.h / 2 } });
  await page.keyboard.down("ArrowUp");
  await expect.poll(async () => (await ride()).x).toBeGreaterThan(250);
  await page.keyboard.up("ArrowUp");
  await expect.poll(async () => (await ride()).audio.context).toBe("running");
  await expect.poll(async () => (await ride()).audio.gain).toBeCloseTo(.405);
  await page.keyboard.press("KeyM");
  await expect(page.getByRole("button", { name: "Unmute game", exact: true })).toBeVisible();
  await expect.poll(async () => (await ride()).audio.gain).toBe(0);
  await page.getByRole("button", { name: "Unmute game" }).click();
  await expect.poll(async () => (await ride()).audio.gain).toBeCloseTo(.405);
  await page.getByRole("button", { name: "Pause game", exact: true }).click();
  await expect.poll(async () => (await ride()).audio.gain).toBe(0);
  const pausedAt = (await ride()).elapsed;
  const timer = page.getByLabel("Game time remaining");
  const timeBefore = await timer.innerText();
  await expect(timer).not.toHaveText(timeBefore);
  expect((await ride()).elapsed).toBe(pausedAt);
  await page.getByRole("button", { name: "Resume game", exact: true }).last().click();
  await expect.poll(async () => (await ride()).audio.gain).toBeCloseTo(.405);
  await frame().locator("canvas").focus();
  await page.keyboard.press("KeyR");
  await expect.poll(async () => (await ride()).x).toBeLessThan(250);
  expect((await academySave(page)).session).toEqual(paid.session);

  await page.keyboard.down("ArrowUp");
  await expect.poll(async () => (await ride()).state, { timeout: 18000 }).toBe("finished");
  await page.keyboard.up("ArrowUp");
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "{}"), motoKey))
    .toMatchObject({ unlocked: 2, best: { 0: expect.any(Number) }, replays: { 0: expect.any(String) } });

  await page.reload();
  await expect(page.getByText(/Controls stay inside your game/)).toBeVisible();
  expect(await academySave(page)).toMatchObject({ session: paid.session, tickets: 1, stars: 23 });
  await frame().locator("canvas").focus();
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => frame().evaluate(() => (window as unknown as { __moto: Moto }).__moto.G.menuSelection)).toBe(0);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await ride()).level).toBe(1);
  await page.clock.install();
  await page.clock.fastForward(65000);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect.poll(() => academySave(page)).toMatchObject({ session: null, tickets: 1, stars: 23 });
  await page.clock.resume();
  await page.getByRole("button", { name: "Grown-ups", exact: true }).click();
  const challenge = (await page.getByTestId("adult-challenge").innerText()).match(/\d+/g)!.map(Number);
  await page.getByLabel("Grown-up answer").fill(String(challenge[0] * challenge[1]));
  await page.getByRole("button", { name: "Unlock settings" }).click();
  await page.getByRole("button", { name: "Reset progress", exact: true }).click();
  await page.getByRole("button", { name: "Yes, reset everything", exact: true }).click();
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), motoKey)).toBeNull();
  expect(errors).toEqual([]);
});

for (const [width, height, expanded] of [[390, 844, false], [768, 1024, false], [320, 568, true], [667, 375, true]] as const) {
  test.describe(`Moto Rush at ${width}px`, () => {
    test.use({ viewport: { width, height }, hasTouch: true, reducedMotion: "reduce" });

    test("starts by touch and accepts simultaneous throttle and lean", async ({ page }) => {
      const frame = await launch(page);
      const canvas = frame().locator("canvas");
      if (expanded) {
        await page.getByRole("button", { name: "Expand game" }).click();
        await expect.poll(() => page.locator(".game-viewport").evaluate((viewport) =>
          viewport.querySelector("iframe")!.clientHeight <= viewport.clientHeight,
        )).toBe(true);
      }
      const course = await frame().evaluate(() => (window as unknown as { __moto: Moto }).__moto.uiSnapshot()
        .buttons.find(button => button.id === "lvl0")!);
      await canvas.tap({ position: { x: course.x + course.w / 2, y: course.y + course.h / 2 } });
      await frame().waitForFunction(() => (window as unknown as { __moto: Moto }).__moto.G.state === "playing");
      await canvas.scrollIntoViewIfNeeded();
      const bounds = (await canvas.boundingBox())!;
      const zones = await frame().evaluate(() => (window as unknown as { __moto: Moto })
        .__moto.input.getConfig().pointerSurface.zones);
      const touches = ["gas", "leanFwd"].map((command, id) => {
        const zone = zones.find(zone => zone.command === command)!;
        return { id, x: bounds.x + zone.x, y: bounds.y + zone.y };
      });

      for (const touch of touches) {
        expect(touch.y).toBeGreaterThan(0);
        expect(touch.y).toBeLessThan(height);
      }
      const cdp = await page.context().newCDPSession(page);
      try {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: touches });
        await expect.poll(() => frame().evaluate(() => (window as unknown as { __moto: Moto })
          .__moto.input.inspect().sources.pointer)).toMatchObject({ gas: true, leanFwd: true });
        await frame().waitForFunction(() => (window as unknown as { __moto: Moto }).__moto.G.bike.x > 150);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      } finally {
        await cdp.detach();
      }

      await page.getByRole("button", { name: "Finish playing" }).click();
      await expect(page.locator("iframe")).toHaveCount(0);
      await expect.poll(() => academySave(page)).toMatchObject({ session: null, tickets: 1, stars: 23 });
    });
  });
}
