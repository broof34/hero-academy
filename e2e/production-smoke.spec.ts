import { test, expect } from "@playwright/test";

const key = "hero-academy:v1";
const saved = {
  version: 1,
  stars: 7,
  totalStars: 17,
  tickets: 1,
  completed: ["previous-mission"],
  stats: { math: { attempts: 4, correct: 3 } },
  settings: { reducedMotion: true, sound: false },
};

for (const existing of [false, true]) {
  test(`production visibly renders and answers a question (${existing ? "existing V1 save" : "fresh session"})`, async ({ page }) => {
    const errors: string[] = [];
    const failed: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("requestfailed", (request) => failed.push(request.url()));
    page.on("response", (response) => {
      if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
    });
    if (existing) await page.addInitScript(({ key, saved }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(saved));
    }, { key, saved });
    const response = await page.goto("./");
    expect(response?.ok()).toBe(true);
    // A successful document response is insufficient: the real app must run.
    expect(await response!.text()).not.toContain('src="/src/main.tsx"');
    if (process.env.HERO_EXPECTED_SHA) {
      await expect(page.locator('meta[name="hero-build"]')).toHaveAttribute("content", process.env.HERO_EXPECTED_SHA);
    }
    await expect(page.getByRole("heading", { name: "YOUR WORLD. YOUR POWER." })).toBeVisible();
    await expect(page.getByRole("button", { name: "CONTINUE LEARNING" })).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    for (const name of ["Home", "Learn", "Arcade", "Rewards", "Grown-ups"]) {
      await expect(nav.getByRole("button", { name, exact: true })).toBeVisible();
    }
    for (const [name, heading] of [["Rewards", "Your rewards."], ["Arcade", "The arcade is yours."]]) {
      await nav.getByRole("button", { name, exact: true }).click();
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    }
    await nav.getByRole("button", { name: "Home", exact: true }).click();
    await page.getByRole("button", { name: "Start Math mission" }).click();
    await page.getByLabel("Choose a skill").selectOption("addition");
    await page.getByRole("button", { name: "Let’s go" }).click();
    const numbers = (await page.getByTestId("equation").innerText()).match(/\d+/g)!.map(Number);
    await page.getByRole("group", { name: "Answer choices" }).getByRole("button", { name: String(numbers[0] + numbers[1]), exact: true }).click();
    await expect(page.getByTestId("star-balance")).toHaveText(String(existing ? 8 : 1));
    await page.reload();
    await expect(page.getByRole("heading", { name: "YOUR WORLD. YOUR POWER." })).toBeVisible();
    const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key);
    expect(state.stars).toBe(existing ? 8 : 1);
    if (existing) {
      expect(state.completed).toContain("previous-mission");
      expect(state.tickets).toBe(1);
      expect(state.stats.math.correct).toBe(4);
    }
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
  });
}

test("a missing production module shows recovery and exports the untouched save", async ({ page }) => {
  const raw = JSON.stringify(saved);
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key, raw });
  await page.route("**/assets/index-*.js", (route) => route.abort());
  // Also exercise this case in the development suite.
  await page.route("**/src/main.tsx", (route) => route.abort());
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Hero Academy could not start" })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download saved progress" }).click();
  const stream = await (await download).createReadStream();
  const chunks = [];
  for await (const chunk of stream!) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString()).toBe(raw);
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(raw);
  await page.unrouteAll();
  await page.getByRole("button", { name: "Reload Hero Academy" }).click();
  await expect(page.getByRole("heading", { name: "YOUR WORLD. YOUR POWER." })).toBeVisible();
  await expect(page.getByTestId("star-balance")).toHaveText("7");
});

test("an application render failure shows recovery without resetting progress", async ({ page }) => {
  await page.addInitScript(({ key, saved }) => {
    localStorage.setItem(key, JSON.stringify(saved));
    window.matchMedia = () => { throw new Error("Simulated browser API failure"); };
  }, { key, saved });
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Hero Academy could not start" })).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).stars, key)).toBe(7);
});

test("unreadable saved data renders recovery without overwriting the original", async ({ page }) => {
  const raw = '{"version":1,"stars":7,broken';
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key, raw });
  await page.goto("./");
  await expect(page.getByRole("button", { name: "Export original save" })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(raw);
});

test("unavailable storage renders explicit saved-progress recovery", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException("Storage blocked", "SecurityError"); };
  });
  await page.goto("./");
  await expect(page.getByRole("button", { name: "Export original save" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your saved progress needs a check." })).toBeVisible();
});
