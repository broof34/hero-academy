import { test, expect } from "@playwright/test";

test("five destinations reach learning, homework and a safeguarded reward exchange", async ({
  page,
}) => {
  await page.goto("./");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  for (const name of ["Home", "Learn", "Arcade", "Rewards", "Grown-ups"])
    await expect(nav.getByRole("button", { name, exact: true })).toBeVisible();
  await nav.getByRole("button", { name: "Rewards", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your rewards." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Get a game ticket" }),
  ).toBeDisabled();
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("hero-academy:v1")!);
    s.stars = 10;
    s.totalStars = 10;
    localStorage.setItem("hero-academy:v1", JSON.stringify(s));
  });
  await page.reload();
  await nav.getByRole("button", { name: "Rewards", exact: true }).click();
  await page.getByRole("button", { name: "Get a game ticket" }).click();
  await expect(page.getByTestId("star-balance")).toHaveText("0");
  await expect(
    page.getByRole("button", { name: "Get a game ticket" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("hero-academy:v1")!).tickets,
    ),
  ).toBe(1);
  await nav.getByRole("button", { name: "Learn", exact: true }).click();
  await page.getByRole("button", { name: "Homework", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start focus time" }),
  ).toBeVisible();
});

test("disabled subjects stay hidden and keyboard navigation focuses new content", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("hero-academy:v1")!);
    s.settings.subjects = ["math"];
    localStorage.setItem("hero-academy:v1", JSON.stringify(s));
  });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Start Reading mission" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start Math mission" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start Reading mission" }),
  ).toHaveCount(0);
  await expect(page.locator("#main-content")).toBeFocused();
});

test("OS and saved reduced motion suppress flying rewards while keeping feedback and stars", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  for (const os of [true, false]) {
    if (!os) {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.evaluate(() => {
        const s = JSON.parse(localStorage.getItem("hero-academy:v1")!);
        s.settings.reducedMotion = true;
        localStorage.setItem("hero-academy:v1", JSON.stringify(s));
      });
      await page.reload();
    }
    await page.getByRole("button", { name: "Start Math mission" }).click();
    await page.getByLabel("Choose a skill").selectOption("addition");
    await page.getByRole("button", { name: "Let’s go" }).click();
    const numbers = (await page.getByTestId("equation").innerText())
      .match(/\d+/g)!
      .map(Number);
    await page
      .getByRole("group", { name: "Answer choices" })
      .getByRole("button", {
        name: String(numbers[0] + numbers[1]),
        exact: true,
      })
      .click();
    await expect(page.getByText("You did it! +1 star")).toBeVisible();
    await expect(page.getByTestId("star-balance")).toHaveText(os ? "1" : "2");
    await expect(page.locator(".fx-flight, .fx-confetti")).toHaveCount(0);
    await page.getByRole("button", { name: "Home", exact: true }).click();
  }
});

test("finite celebrations follow correct answers and sound responds to the mute setting", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const NativeAudioContext = window.AudioContext;
    const contexts: AudioContext[] = [];
    Object.assign(window, { __academyTestAudio: contexts });
    window.AudioContext = class extends NativeAudioContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        contexts.push(this);
      }
    };
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Turn sound on" }).click();
  await page.getByRole("button", { name: "Start Math mission" }).click();
  await page.getByLabel("Choose a skill").selectOption("addition");
  await page.getByRole("button", { name: "Let’s go" }).click();
  for (let i = 0; i < 3; i++) {
    const n = (await page.getByTestId("equation").innerText())
      .match(/\d+/g)!
      .map(Number);
    await page
      .getByRole("group", { name: "Answer choices" })
      .getByRole("button", { name: String(n[0] + n[1]), exact: true })
      .click();
    await expect(page.locator(".comic-burst")).toHaveAttribute("data-label", i === 2 ? "ON FIRE!" : i === 0 ? "POW!" : "ZAP!");
    if (i < 2)
      await page.getByRole("button", { name: "Next question" }).click();
  }
  await expect(page.getByTestId("star-balance")).toHaveText("3");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { __academyTestAudio: AudioContext[] })
            .__academyTestAudio[0]?.state,
      ),
    )
    .toBe("running");
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { __academyTestAudio: AudioContext[] })
            .__academyTestAudio[0]?.state,
      ),
    )
    .toBe("suspended");
  await expect(page.locator(".effect-layer")).toHaveCount(0, { timeout: 2500 });
});

test("narrow navigation keeps all five destinations visible and no content overflows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  for (const name of ["Home", "Learn", "Arcade", "Rewards", "Grown-ups"])
    await expect(
      nav.getByRole("button", { name, exact: true }),
    ).toBeInViewport();
  for (const name of ["Home", "Learn", "Arcade", "Rewards"]) {
    await nav.getByRole("button", { name, exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("Home resume returns directly to saved weekly practice", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Grown-ups", exact: true }).click();
  const n = (await page.getByTestId("adult-challenge").innerText())
    .match(/\d+/g)!
    .map(Number);
  await page.getByLabel("Grown-up answer").fill(String(n[0] * n[1]));
  await page.getByRole("button", { name: "Unlock settings" }).click();
  await page.getByLabel("Spelling list name").fill("Resume check");
  await page.getByLabel("Paste spelling words").fill("cat,dog");
  await page.getByRole("button", { name: "Create spelling list" }).click();
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Spelling HQ", exact: true }).click();
  await page.getByRole("button", { name: "Start Word Builder" }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: /RESUME.*LEARNING/i }).click();
  await expect(
    page.getByRole("heading", { name: "Build the secret code." }),
  ).toBeVisible();
  await expect(page.getByRole("group", { name: "Word tiles" })).toBeVisible();
  await expect(page.locator("#main-content")).toBeFocused();
  await expect(page.getByLabel("Your spelling")).toBeEnabled();
});

test("dismissing the grown-up dialog returns keyboard focus to its opener", async ({
  page,
}) => {
  await page.goto("./");
  const opener = page.getByRole("button", { name: "Grown-ups", exact: true });
  await opener.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await opener.click();
  await page.getByRole("button", { name: "Close grown-up check" }).click();
  await expect(opener).toBeFocused();
});

test("restored game session exposes only game controls and receives main focus", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("hero-academy:v1")!);
    s.session = { game: "space", endsAt: Date.now() + 60000 };
    localStorage.setItem("hero-academy:v1", JSON.stringify(s));
  });
  await page.reload();
  await expect(page.locator(".game-header")).toBeHidden();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
  await expect(page.locator("#main-content")).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Finish playing" }),
  ).toBeVisible();
});

test("final test answer reveals the completed report together with its reward", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Grown-ups", exact: true }).click();
  const n = (await page.getByTestId("adult-challenge").innerText())
    .match(/\d+/g)!
    .map(Number);
  await page.getByLabel("Grown-up answer").fill(String(n[0] * n[1]));
  await page.getByRole("button", { name: "Unlock settings" }).click();
  await page.getByLabel("Spelling list name").fill("One word test");
  await page.getByLabel("Paste spelling words").fill("cat");
  await page.getByRole("button", { name: "Create spelling list" }).click();
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Spelling HQ", exact: true }).click();
  await page.getByRole("button", { name: "Start Practice Test" }).click();
  await expect(page.getByTestId("star-balance")).toHaveText("0");
  await expect(page.locator(".effect-layer")).toHaveCount(0);
  await page.getByLabel("Your spelling").fill("cat");
  await page.getByRole("button", { name: "Save test answer" }).click();
  await expect(
    page.getByRole("heading", { name: "Practice test complete!" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Answer saved." }),
  ).toHaveCount(0);
  await expect(page.getByTestId("star-balance")).toHaveText("3");
});

test("long saved spelling list names stay inside a narrow adult dashboard and HQ", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./");
  await page.getByRole("button", { name: "Grown-ups", exact: true }).click();
  const n = (await page.getByTestId("adult-challenge").innerText())
    .match(/\d+/g)!
    .map(Number);
  await page.getByLabel("Grown-up answer").fill(String(n[0] * n[1]));
  await page.getByRole("button", { name: "Unlock settings" }).click();
  await page.getByLabel("Spelling list name").fill("W".repeat(80));
  await page.getByLabel("Paste spelling words").fill("cat");
  await page.getByRole("button", { name: "Create spelling list" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Spelling HQ", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
