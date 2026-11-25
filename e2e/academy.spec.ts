import { test, expect, Page } from "@playwright/test";
let browserErrors: string[] = [];
test.beforeEach(async ({ page }) => {
  browserErrors = [];
  page.on("pageerror", (e) => browserErrors.push(e.message));
});
test.afterEach(() => expect(browserErrors).toEqual([]));
async function adult(page: Page) {
  await page
    .getByRole("button", { name: "Grown-up zone" })
    .filter({ visible: true })
    .click();
  const text = await page.getByTestId("adult-challenge").innerText();
  const nums = text.match(/\d+/g)!.map(Number);
  await page.getByLabel("Grown-up answer").fill(String(nums[0] * nums[1]));
  await page.getByRole("button", { name: "Unlock settings" }).click();
}
test("learning, retries, persistence, tickets and a real timed game", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Start Math mission" }).click();
  await page.getByLabel("Choose a skill").selectOption("addition");
  await page.getByRole("button", { name: "Let’s go" }).click();
  for (let i = 0; i < 5; i++) {
    const text = await page.getByTestId("equation").innerText();
    const nums = text.match(/\d+/g)!.map(Number);
    const answer = String(nums[0] + nums[1]);
    if (i === 0) {
      const choices = page
        .getByRole("group", { name: "Answer choices" })
        .getByRole("button");
      for (const b of await choices.all())
        if ((await b.innerText()) !== answer) {
          await b.click();
          break;
        }
      await expect(page.getByText("Good effort! Try again.")).toBeVisible();
    }
    await page
      .getByRole("group", { name: "Answer choices" })
      .getByRole("button", { name: answer, exact: true })
      .click();
    await expect(page.getByText("You did it! +1 star")).toBeVisible();
    await page
      .getByRole("button", {
        name: i === 4 ? "Finish mission" : "Next question",
      })
      .click();
  }
  await expect(page.getByText("Mission complete!")).toBeVisible();
  await page.getByRole("button", { name: "Back to base" }).click();
  await page.reload();
  await expect(page.getByTestId("star-balance")).toHaveText("5");
  await adult(page);
  await page.getByLabel("Stars per ticket").fill("5");
  await page.getByRole("button", { name: "Save settings" }).click();
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Get a game ticket" }).click();
  await expect(page.getByTestId("star-balance")).toHaveText("0");
  await page.getByRole("button", { name: "Play Galactic Patrol" }).click();
  await page.getByRole("button", { name: "Launch game · 1 ticket" }).click();
  const frame = page.frameLocator('iframe[title="Galactic Patrol"]');
  await expect(frame.locator("canvas").first()).toBeVisible({ timeout: 30000 });
  // Chrome suppresses pointer events briefly after a cross-origin iframe moves.
  await page.waitForTimeout(650);
  await frame.getByRole("button", { name: "Launch patrol" }).click();
  await expect(frame.getByTestId("game-status")).toContainText("Playing");
  await page.clock.install();
  await page.clock.fastForward(151000);
  await expect(page.getByText(/\d+ seconds left/)).toBeVisible();
  await page.clock.fastForward(30000);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByText("Nice playing, hero!")).toBeVisible();
});
test("homework requires adult approval; custom questions and export work", async ({
  page,
}) => {
  await page.goto("./");
  await adult(page);
  await page.getByLabel("Focus minutes").fill("1");
  await page.getByLabel("Question").fill("What is 1 plus 1?");
  await page.getByLabel("Correct answer").fill("2");
  await page.getByRole("button", { name: "Add question" }).click();
  await page.getByRole("button", { name: "Save settings" }).click();
  await page.getByRole("button", { name: "Homework", exact: true }).click();
  await page.clock.install();
  await page.getByRole("button", { name: "Start focus time" }).click();
  await page.clock.fastForward(61000);
  await expect(
    page.getByText("Ask a grown-up to check your effort."),
  ).toBeVisible();
  await expect(page.getByTestId("star-balance")).toHaveText("0");
  await page.getByRole("button", { name: "Confirm effort · +3 stars" }).click();
  const text = await page.getByTestId("adult-challenge").innerText();
  const n = text.match(/\d+/g)!.map(Number);
  await page.getByLabel("Grown-up answer").fill(String(n[0] * n[1]));
  await page
    .getByRole("button", { name: "Confirm effort", exact: true })
    .click();
  await expect(page.getByTestId("star-balance")).toHaveText("3");
  await adult(page);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress" }).click();
  expect((await download).suggestedFilename()).toBe(
    "hero-academy-progress.json",
  );
});
test("racing adapter runs on tablet and progress stays local", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("./");
  await adult(page);
  await page.getByRole("button", { name: "Grant a ticket" }).click();
  await page.getByRole("button", { name: "Save settings" }).click();
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Play Super Kart 3D" }).click();
  await page.getByRole("button", { name: "Launch game · 1 ticket" }).click();
  const frame = page.frameLocator('iframe[title="Super Kart 3D"]');
  await expect(frame.locator("canvas").first()).toBeVisible({ timeout: 30000 });
  // Chrome suppresses pointer events briefly after a cross-origin iframe moves.
  await page.waitForTimeout(650);
  await frame.getByRole("button", { name: /Start Race/ }).click();
  await expect
    .poll(
      async () =>
        page
          .frames()
          .find((f) => f.url().includes("/games/kart/"))
          ?.evaluate(() =>
            (
              window as unknown as { __sk3d: { getState: () => string } }
            ).__sk3d?.getState(),
          ),
      { timeout: 45000 },
    )
    .toBe("race");
  await expect(frame.getByRole("button", { name: "Steer left" })).toBeVisible();
  await frame.getByRole("button", { name: "Steer left" }).hover();
  await page.mouse.down();
  await page.mouse.up();
  await page.getByRole("button", { name: "Finish playing" }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("broken saves remain untouched and expired sessions cannot restart on reload", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate(() =>
    localStorage.setItem("hero-academy:v1", '{"version":99,"stars":19}'),
  );
  await page.reload();
  await expect(
    page.getByText("Your saved progress needs a check."),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("hero-academy:v1")),
  ).toBe('{"version":99,"stars":19}');
  await page.evaluate(() =>
    localStorage.setItem(
      "hero-academy:v1",
      JSON.stringify({
        version: 1,
        stars: 7,
        tickets: 0,
        session: { game: "space", endsAt: Date.now() - 1000 },
      }),
    ),
  );
  await page.reload();
  await expect(page.getByTestId("star-balance")).toHaveText("7");
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByText("Nice playing, hero!")).toBeVisible();
});
test("small screens have accessible grown-up settings and no overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await adult(page);
  await page.getByLabel("Stars per ticket").fill("8");
  await page.getByRole("button", { name: "Save settings" }).click();
  await page.reload();
  await expect(page.getByText("/ 8 stars", { exact: true })).toBeVisible();
});
test("custom questions grade real input and spelling tiles build words", async ({
  page,
}) => {
  await page.goto("./");
  await adult(page);
  await page.getByLabel("Question").fill("Write the word cat.");
  await page.getByLabel("Correct answer").fill("cat");
  await page.getByRole("button", { name: "Add question" }).click();
  await page.getByRole("button", { name: "Save settings" }).click();
  await page.getByRole("button", { name: "Start Math mission" }).click();
  await page.getByLabel("Choose a skill").selectOption("custom");
  await page.getByRole("button", { name: "Let’s go" }).click();
  await page.getByLabel("Your answer").fill(" CAT ");
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText("You did it! +1 star")).toBeVisible();
  await page.getByRole("button", { name: "Save & leave" }).click();
  await page.getByRole("button", { name: "Start Spelling mission" }).click();
  await page.getByLabel("Choose a skill").selectOption("tiles");
  await page.getByRole("button", { name: "Let’s go" }).click();
  await page.getByRole("button", { name: "I need a hint" }).click();
  const hint = await page.locator(".hint").innerText();
  const word = hint.match(/The word is (\w+)/)![1];
  for (const c of word)
    await page
      .getByRole("group", { name: "Letter tiles" })
      .getByRole("button", { name: c, exact: true })
      .click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByTestId("star-balance")).toHaveText("2");
});
