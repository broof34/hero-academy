import { test, expect, type Page } from "@playwright/test";
async function speechPlatform(page: Page) {
  await page.addInitScript(() => {
    const log: { text: string; rate: number; volume: number }[] = [];
    Object.assign(window, { __spoken: log, __cancels: 0 });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: class {
        text: string;
        rate = 1;
        volume = 1;
        voice = null;
        onend: null | (() => void) = null;
        onerror = null;
        constructor(text: string) {
          this.text = text;
        }
      },
    });
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        getVoices: () => [
          { name: "Local English", lang: "en-US", localService: true },
          { name: "Remote", lang: "en-US", localService: false },
        ],
        cancel: () => {
          (window as unknown as { __cancels: number }).__cancels++;
        },
        speak: (u: {
          text: string;
          rate: number;
          volume: number;
          onend?: () => void;
        }) => {
          log.push({ text: u.text, rate: u.rate, volume: u.volume });
          u.onend?.();
        },
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  });
}
test("independent audio preferences persist and spoken math respects rate and volume", async ({
  page,
}) => {
  await speechPlatform(page);
  await page.goto("./");
  await page
    .getByRole("button", { name: "Audio settings", exact: true })
    .click();
  await page.getByLabel("Spoken instructions", { exact: true }).check();
  await page.getByLabel("Sound effects", { exact: true }).uncheck();
  await page.getByLabel("Speech speed").focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.getByLabel("Speech volume").focus();
  await page.keyboard.press("Home");
  for (let i = 0; i < 8; i++) await page.keyboard.press("ArrowRight");
  await page.getByLabel("Read instructions automatically").check();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Start Math mission" }).click();
  await page.getByLabel("Choose a skill").selectOption("addition");
  await page.getByRole("button", { name: "Let’s go" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { __spoken: { text: string }[] }).__spoken.at(
            -1,
          )?.text,
      ),
    )
    .toMatch(/plus/);
  const spoken = await page.evaluate(() =>
    (
      window as unknown as { __spoken: { rate: number; volume: number }[] }
    ).__spoken.at(-1),
  );
  expect(spoken?.rate).toBe(0.7);
  expect(spoken?.volume).toBe(0.4);
  const settings = await page.evaluate(
    () => JSON.parse(localStorage.getItem("hero-academy:v1")!).settings,
  );
  expect(settings.effectsSound).toBe(false);
  expect(settings.sound).toBe(true);
  const before = await page.evaluate(
    () => (window as unknown as { __cancels: number }).__cancels,
  );
  await page.getByRole("button", { name: "Home", exact: true }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { __cancels: number }).__cancels,
    ),
  ).toBeGreaterThan(before);
});
test("varied comic graphics and fire/electric milestones preserve five earned stars", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Start Math mission" }).click();
  await page.getByLabel("Choose a skill").selectOption("addition");
  await page.getByRole("button", { name: "Let’s go" }).click();
  const seen: string[] = [];
  for (let i = 0; i < 5; i++) {
    const n = (await page.getByTestId("equation").innerText())
      .match(/\d+/g)!
      .map(Number);
    await page
      .getByRole("group", { name: "Answer choices" })
      .getByRole("button", { name: String(n[0] + n[1]), exact: true })
      .click();
    await expect(page.locator(".comic-burst")).toBeVisible();
    seen.push(
      (await page.locator(".comic-burst").getAttribute("data-label")) ?? "",
    );
    if (i === 2) await expect(page.locator(".combo-badge")).toContainText("3");
    if (i === 4)
      await expect(page.locator(".effect-layer")).toHaveAttribute(
        "data-tier",
        "electric",
      );
    if (i < 4) {
      await page.getByRole("button", { name: "Next question" }).click();
      await expect(page.locator(".effect-layer")).toHaveCount(0);
    }
  }
  expect(new Set(seen).size).toBeGreaterThan(2);
  await expect(page.getByTestId("star-balance")).toHaveText("5");
});

test("automatic spelling help never speaks a hidden target or sentence", async ({
  page,
}) => {
  await speechPlatform(page);
  await page.goto("./");
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("hero-academy:v1")!);
    s.settings.sound = true;
    s.settings.autoRead = true;
    localStorage.setItem("hero-academy:v1", JSON.stringify(s));
  });
  await page.reload();
  await page.getByRole("button", { name: "Grown-ups", exact: true }).click();
  const n = (await page.getByTestId("adult-challenge").innerText())
    .match(/\d+/g)!
    .map(Number);
  await page.getByLabel("Grown-up answer").fill(String(n[0] * n[1]));
  await page.getByRole("button", { name: "Unlock settings" }).click();
  await page.getByLabel("Spelling list name").fill("Speech privacy");
  await page.getByLabel("Paste spelling words").fill("balloon,cat");
  await page.getByRole("button", { name: "Create spelling list" }).click();
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Spelling HQ", exact: true }).click();
  await page.getByRole("button", { name: "Start Practice Test" }).click();
  await page.evaluate(() =>
    (window as unknown as { __spoken: unknown[] }).__spoken.splice(0),
  );
  await page
    .getByRole("button", { name: "Hear instructions", exact: true })
    .last()
    .click();
  const target = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("hero-academy:v1")!).weeklySpelling
        .current.items[0].word.text,
  );
  const instructions = await page.evaluate(() =>
    (window as unknown as { __spoken: { text: string }[] }).__spoken
      .map((x) => x.text)
      .join(" "),
  );
  expect(instructions.toLowerCase()).not.toContain(target.toLowerCase());
  await page.getByRole("button", { name: "Hear word", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { __spoken: { text: string }[] }).__spoken.at(
            -1,
          )?.text,
      ),
    )
    .toBe(target);
  await page.getByLabel("Your spelling").fill(target);
  await page.getByRole("button", { name: "Save test answer" }).click();
  await expect(page.getByTestId("star-balance")).toHaveText("0");
  await expect(page.locator(".effect-layer")).toHaveCount(0);
});

test("kart music and effects use separate persisted mixer channels", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("hero-academy:v1")!);
    s.tickets = 1;
    s.settings.effectsSound = false;
    s.settings.musicSound = true;
    s.settings.musicVolume = 0.3;
    localStorage.setItem("hero-academy:v1", JSON.stringify(s));
  });
  await page.reload();
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Play Super Kart 3D" }).click();
  await page.getByRole("button", { name: "Launch game · 1 ticket" }).click();
  await expect
    .poll(async () => {
      const f = page.frames().find((f) => f.url().includes("/games/kart/"));
      return f?.evaluate(() => {
        const a = (
          window as unknown as {
            __sk3d: { audio: { _effectsVolume: number; _musicVolume: number } };
          }
        ).__sk3d?.audio;
        return a ? { effects: a._effectsVolume, music: a._musicVolume } : null;
      });
    })
    .toEqual({ effects: 0, music: 0.3 });
});

test("saving learning settings keeps independently saved audio changes", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Grown-ups", exact: true }).click();
  const n = (await page.getByTestId("adult-challenge").innerText())
    .match(/\d+/g)!
    .map(Number);
  await page.getByLabel("Grown-up answer").fill(String(n[0] * n[1]));
  await page.getByRole("button", { name: "Unlock settings" }).click();
  await page.getByLabel("Stars per ticket").fill("8");
  await page
    .getByRole("button", { name: "Audio settings", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Spoken instructions", { exact: true })
    .check();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await page.reload();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("hero-academy:v1")!).settings.sound,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("hero-academy:v1")!).settings.starCost,
    ),
  ).toBe(8);
});

test("auto narration stays silent behind the mixer while explicit voice preview works", async ({
  page,
}) => {
  await speechPlatform(page);
  await page.goto("./");
  await page
    .getByRole("button", { name: "Audio settings", exact: true })
    .click();
  await page.getByLabel("Spoken instructions", { exact: true }).check();
  await page.getByLabel("Read instructions automatically").check();
  await page.waitForTimeout(300);
  expect(
    await page.evaluate(
      () => (window as unknown as { __spoken: unknown[] }).__spoken.length,
    ),
  ).toBe(0);
  await page
    .getByRole("button", { name: "Preview voice", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => (window as unknown as { __spoken: unknown[] }).__spoken.length,
    ),
  ).toBe(1);
});

test("touch controls reach the mixer and complete an answer without overflow", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(test.info().project.use.baseURL!);
  await page.getByRole("button", { name: "Audio settings", exact: true }).tap();
  await expect(
    page.getByRole("button", { name: "Done", exact: true }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Done", exact: true }).tap();
  await page.getByRole("button", { name: "Start Math mission" }).tap();
  await page.getByLabel("Choose a skill").selectOption("addition");
  await page.getByRole("button", { name: "Let’s go" }).tap();
  const n = (await page.getByTestId("equation").innerText())
    .match(/\d+/g)!
    .map(Number);
  await page
    .getByRole("group", { name: "Answer choices" })
    .getByRole("button", { name: String(n[0] + n[1]), exact: true })
    .tap();
  await expect(page.getByTestId("star-balance")).toHaveText("1");
  await page.getByRole("button", { name: "Next question" }).tap();
  await expect(page.locator(".effect-layer")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});
