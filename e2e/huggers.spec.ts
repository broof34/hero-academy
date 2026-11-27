import { expect, test, type Frame, type Page } from "@playwright/test";

const storageKey = "hero-academy:v1";
function saved(page: Page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
}

function waitForGame(frame: Frame, condition: string) {
  // Playwright's direct evaluation observes engine state without changing its CSP.
  return expect.poll(() => frame.evaluate(condition), { timeout: 10000, message: condition }).toBeTruthy();
}

async function prepareJump(frame: Frame) {
  // Procedural starts can put a ledge or a ceiling next to the player.
  await frame.evaluate(`(() => {
    const player = players[0];
    const floor = player.pos.int();
    for (let x = -3; x <= 8; x++)
      for (let y = -1; y <= 5; y++)
        setTileCollisionData(floor.add(vec2(x, y)), y === -1 ? tileType_dirt : tileType_empty);
    player.pos = floor.add(vec2(.5, 1));
    player.velocity = vec2();
    window.highestY = player.pos.y;
    const observeJump = () => {
      window.highestY = Math.max(window.highestY, player.pos.y);
      if (players[0] === player) requestAnimationFrame(observeJump);
    };
    requestAnimationFrame(observeJump);
  })()`);
  await waitForGame(frame, "players[0].groundObject");
}

async function launch(page: Page) {
  await page.addInitScript((key) => {
    if (top !== self || localStorage.getItem(key)) return;
    localStorage.setItem(key, JSON.stringify({
      version: 1, stars: 23, totalStars: 48, tickets: 2,
      settings: { gameMinutes: 1, effectsSound: true, effectsVolume: .45 },
    }));
  }, storageKey);
  await page.goto("./");
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Play Space Huggers" }).click();
  await expect.poll(() => page.getByRole("img", { name: "Space Huggers actual gameplay" })
    .evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("button", { name: /Launch game/ }).click();
  await expect(page.getByText(/Controls stay inside your game/)).toBeVisible();
  const game = () => page.frames().find((frame) => frame.url().endsWith("/games/space-huggers/index.html"))!;
  await waitForGame(game(), "!academyPaused && players[0]");
  return game;
}

test("Space Huggers plays the original campaign and preserves the paid session", async ({ page, request }) => {
  await page.setViewportSize({ width: 1000, height: 660 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", response => { if (response.status() >= 400) errors.push(response.url()); });
  page.on("request", request => {
    if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(test.info().project.use.baseURL!).origin)
      errors.push(request.url());
  });
  const game = await launch(page);
  const paid = await saved(page);
  expect(paid).toMatchObject({ tickets: 1, stars: 23, session: { game: "huggers" } });

  const source = await request.get("./games/space-huggers/SOURCE.html");
  expect(await source.text()).toContain('href="source.zip"');
  const zip = await request.get("./games/space-huggers/source.zip");
  expect((await zip.body()).subarray(0, 4).toString("hex")).toBe("504b0304");
  expect(await game().evaluate("academyBlood")).toBe(false);

  await game().locator("#playfield canvas").first().focus();
  await prepareJump(game());
  const originalX = await game().evaluate<number>("players[0].pos.x");
  const originalLevel = await game().evaluate<number>("level");
  await page.keyboard.down("KeyD");
  await expect.poll(() => game().evaluate<number>("players[0].pos.x")).toBeGreaterThan(originalX + .5);
  await page.keyboard.up("KeyD");
  await waitForGame(game(), "players[0].groundObject");
  await page.keyboard.down("KeyW");
  await waitForGame(game(), "players[0].velocity.y > .12");
  await page.keyboard.up("KeyW");
  await page.keyboard.down("KeyZ");
  await waitForGame(game(), "engineObjects.some(o => o instanceof Bullet && o.team === team_player)");
  await page.keyboard.up("KeyZ");

  const canvas = (await game().locator("#playfield canvas").first().boundingBox())!;
  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
  await page.mouse.down({ button: "right" });
  await waitForGame(game(), "engineObjects.some(o => o instanceof Grenade)");
  await page.mouse.up({ button: "right" });
  // Place the real thrown grenade next to a deterministic destructible tile.
  await game().evaluate(`(() => {
    const grenade = engineObjects.find(o => o instanceof Grenade);
    const wall = players[0].pos.int().add(vec2(5, 2));
    window.testWall = wall;
    setTileCollisionData(wall, tileType_dirt);
    grenade.pos = wall.add(vec2(-.4,.5));
    grenade.velocity = vec2();
    grenade.gravityScale = 0;
    const enemy = engineObjects.find(o => o instanceof Enemy && !o.destroyed && !o.isDead());
    enemy.pos = wall.add(vec2(2, 1));
    enemy.sawPlayerTimer.unset();
    window.testEnemy = enemy;
  })()`);
  await waitForGame(game(), "window.testEnemy.sawPlayerTimer.isSet()");
  await waitForGame(game(), "getTileCollisionData(window.testWall) === tileType_empty");
  await waitForGame(game(), "!engineObjects.some(o => o instanceof Grenade)");
  expect(await game().evaluate("engineObjects.some(o => o instanceof Enemy)")).toBe(true);

  // Exercise native death and end-of-level rules without relying on procedural placement.
  await game().evaluate("playerLives = 0; players[0].kill()");
  await waitForGame(game(), "players[0].isDead()");
  await page.keyboard.press("KeyR");
  await waitForGame(game(), "!players[0].isDead() && playerLives > 0");
  await game().evaluate("engineCollideObjects.filter(o => o.isCharacter && o.team === team_enemy).forEach(o => o.kill())");
  await waitForGame(game(), "levelEndTimer.isSet()");
  await expect.poll(() => game().evaluate<number>("level"), { timeout: 16000 })
    .toBeGreaterThan(originalLevel);

  await expect.poll(() => game().evaluate("audioContext?.state")).toBe("running");
  await page.getByRole("button", { name: "Mute game", exact: true }).click();
  await expect.poll(() => game().evaluate("academyAudioGain.gain.value")).toBe(0);
  await page.getByRole("button", { name: "Unmute game", exact: true }).click();
  await expect.poll(() => game().evaluate<number>("academyAudioGain.gain.value")).toBeCloseTo(.45);
  await page.getByRole("button", { name: "Pause game", exact: true }).click();
  await waitForGame(game(), "academyPaused && audioContext.state === 'suspended'");
  const pausedAt = await game().evaluate("frame");
  const timer = page.getByLabel("Game time remaining");
  const timeBefore = await timer.innerText();
  await expect(timer).not.toHaveText(timeBefore);
  expect(await game().evaluate("frame")).toBe(pausedAt);
  await page.getByRole("button", { name: "Resume game", exact: true }).last().click();
  await waitForGame(game(), "!academyPaused && audioContext.state === 'running'");

  await page.reload();
  await expect(page.getByText(/Controls stay inside your game/)).toBeVisible();
  expect(await saved(page)).toMatchObject({ session: paid.session, tickets: 1, stars: 23 });
  const remaining = paid.session.endsAt - Date.now();
  await page.clock.install();
  await page.clock.fastForward(Math.max(0, remaining - 20000));
  await expect(page.getByRole("alert")).toContainText("seconds left");
  await page.clock.fastForward(25000);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect.poll(() => saved(page)).toMatchObject({ session: null, tickets: 1, stars: 23 });
  expect(errors).toEqual([]);
});

for (const [width, height] of [[390, 844], [1024, 768], [844, 390]] as const) {
  test.describe(`Space Huggers at ${width} × ${height}`, () => {
    test.use({ viewport: { width, height }, hasTouch: true, reducedMotion: "reduce" });

    test("moves, jumps and fires with simultaneous touches and restarts inside the existing ticket", async ({ page }) => {
      const game = await launch(page);
      const paid = await saved(page);
      await page.getByRole("button", { name: "Expand game" }).click();
      await waitForGame(game(), "academyReducedMotion");
      await prepareJump(game());
      const points = [];
      for (const [id, name] of ["Move right", "Jump", "Fire"].entries()) {
        const button = game().getByRole("button", { name, exact: true });
        await expect(button).toBeInViewport();
        const box = (await button.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        points.push({ id, x: box.x + box.width / 2, y: box.y + box.height / 2 });
      }
      const cdp = await page.context().newCDPSession(page);
      const origin = await game().evaluate<number>("players[0].pos.x");
      const takeoffHeight = await game().evaluate<number>("window.highestY");
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: points });
      await waitForGame(game(), "academyTouchKeys.size === 3");
      await expect.poll(() => game().evaluate<number>("window.highestY")).toBeGreaterThan(takeoffHeight + .22);
      await waitForGame(game(), "engineObjects.some(o => o instanceof Bullet && o.team === team_player)");
      await expect.poll(() => game().evaluate<number>("players[0].pos.x")).toBeGreaterThan(origin + .25);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await waitForGame(game(), "academyTouchKeys.size === 0");
      const seed = await game().evaluate("levelSeed");
      await game().getByRole("button", { name: "Restart", exact: true }).tap();
      await expect.poll(() => game().evaluate("levelSeed")).not.toBe(seed);
      expect(await saved(page)).toMatchObject({ session: paid.session, tickets: 1 });
      await page.getByRole("button", { name: "Finish playing" }).tap();
      await expect(page.locator("iframe")).toHaveCount(0);
      expect(await saved(page)).toMatchObject({ session: null, tickets: 1, stars: 23 });
    });
  });
}

test("grown-ups can hide Space Huggers without changing reward balances", async ({ page }) => {
  await launch(page);
  await page.getByRole("button", { name: "Finish playing" }).click();
  await page.getByRole("button", { name: "Grown-ups", exact: true }).click();
  const factors = (await page.getByTestId("adult-challenge").innerText()).match(/\d+/g)!.map(Number);
  await page.getByLabel("Grown-up answer").fill(String(factors[0] * factors[1]));
  await page.getByRole("button", { name: "Unlock settings" }).click();
  const blood = page.getByRole("checkbox", { name: "Show original blood effects" });
  await expect(blood).not.toBeChecked();
  await blood.check();
  await page.getByRole("button", { name: "Save settings" }).click();
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Play Space Huggers" }).click();
  await page.getByRole("button", { name: /Launch game/ }).click();
  const game = () => page.frames().find((frame) => frame.url().endsWith("/games/space-huggers/index.html"))!;
  await expect.poll(() => game()?.evaluate("academyBlood")).toBe(true);
  await page.getByRole("button", { name: "Finish playing" }).click();

  await page.getByRole("button", { name: "Grown-ups", exact: true }).click();
  const again = (await page.getByTestId("adult-challenge").innerText()).match(/\d+/g)!.map(Number);
  await page.getByLabel("Grown-up answer").fill(String(again[0] * again[1]));
  await page.getByRole("button", { name: "Unlock settings" }).click();
  await page.getByRole("checkbox", { name: "Allow Space Huggers" }).uncheck();
  await page.getByRole("button", { name: "Save settings" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await expect(page.getByRole("button", { name: "Play Space Huggers" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Play Moto Rush/ })).toBeVisible();
  expect(await saved(page)).toMatchObject({ tickets: 0, stars: 23, settings: { spaceHuggersEnabled: false } });
});
