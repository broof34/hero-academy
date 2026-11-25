import { readFile } from "node:fs/promises";
import { test, expect, Page } from "@playwright/test";
let errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
});
test.afterEach(() => expect(errors).toEqual([]));
async function adult(page: Page) {
  await page
    .getByRole("button", { name: "Grown-ups" })
    .filter({ visible: true })
    .click();
  const n = (await page.getByTestId("adult-challenge").innerText())
    .match(/\d+/g)!
    .map(Number);
  await page.getByLabel("Grown-up answer").fill(String(n[0] * n[1]));
  await page.getByRole("button", { name: "Unlock settings" }).click();
}
async function makeList(page: Page, words = "Balloon, balloon\na\ncat") {
  await page.goto("./");
  await adult(page);
  await page.getByLabel("Spelling list name").fill("Friday secret codes");
  await page.getByLabel("Paste spelling words").fill(words);
  await page.getByLabel("Spelling test date").fill("2026-11-27");
  await page.getByRole("button", { name: "Create spelling list" }).click();
  await expect(page.getByText("Spelling list saved.")).toBeVisible();
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Spelling HQ", exact: true }).click();
}
test("parents create normalized lists and the builder handles repeated letters and reload", async ({
  page,
}) => {
  await makeList(page, "balloon");
  await expect(
    page.getByRole("heading", { name: "Friday secret codes" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start Word Builder" }).click();
  const tiles = page.getByRole("group", { name: "Word tiles" });
  for (const c of "balloon")
    await tiles
      .locator("button:not(:disabled)")
      .filter({ hasText: new RegExp(`^${c}$`) })
      .first()
      .click();
  await page
    .getByRole("button", { name: "Check spelling", exact: true })
    .click();
  await expect(page.getByText("Code cracked!")).toBeVisible();
  await page.getByRole("button", { name: "See session results" }).click();
  await expect(page.getByText("Training complete!")).toBeVisible();
  await expect(page.getByTestId("star-balance")).toHaveText("2");
  await page.reload();
  await page.getByRole("button", { name: "Spelling HQ", exact: true }).click();
  await page.locator(".weekly-words > summary").click();
  await expect(
    page.getByText("balloon", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByTestId("star-balance")).toHaveText("2");
});
test("independent tests hide targets and corrections until the final results", async ({
  page,
}) => {
  await makeList(page, "balloon,elephant");
  await page.getByRole("button", { name: "Start Practice Test" }).click();
  const target = await page.evaluate(() => {
    const d = JSON.parse(
      localStorage.getItem("hero-academy:v1")!,
    ).weeklySpelling;
    return d.current.items[0].word.text;
  });
  await expect(page.locator("main")).not.toContainText(target);
  await expect(page.locator(".effect-layer")).toHaveCount(0);
  const input = page.getByLabel("Your spelling");
  await expect(input).toHaveAttribute("autocomplete", "off");
  await expect(input).toHaveAttribute("spellcheck", "false");
  await input.fill("wrong");
  await page.getByRole("button", { name: "Save test answer" }).click();
  await expect(page.locator("main")).not.toContainText(target);
  await expect(page.locator(".effect-layer")).toHaveCount(0);
  await page.getByRole("button", { name: "Next word" }).click();
  const second = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("hero-academy:v1")!).weeklySpelling
        .current.items[1].word.text,
  );
  await expect(page.locator("main")).not.toContainText(second);
  await expect(page.locator(".effect-layer")).toHaveCount(0);
  await input.fill(second);
  await page.getByRole("button", { name: "Save test answer" }).click();
  await expect(
    page.getByRole("heading", { name: "Practice test complete!" }),
  ).toBeVisible();
  await expect(page.getByText("1 of 2 correct", { exact: true })).toBeVisible();
  await expect(page.getByText(target, { exact: true }).first()).toBeVisible();
  await expect(page.getByTestId("star-balance")).toHaveText("3");
  await page.getByRole("button", { name: "Back to Spelling HQ" }).click();
  await page.getByRole("button", { name: "Start Tricky Word Review" }).click();
  await expect(
    page.getByRole("heading", { name: "Secret transmission", exact: true }),
  ).toBeVisible();
});
test("study and spelling modes use a one-letter school word on a tablet", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await makeList(page, "a");
  for (const mode of [
    "Flashcards",
    "Missing Letters",
    "Look, Cover, Spell, Check",
    "Listen and Spell",
    "Mixed Training",
  ]) {
    await page
      .getByRole("button", { name: "Start " + mode, exact: true })
      .click();
    if (mode === "Flashcards") {
      await expect(page.getByText("a", { exact: true }).first()).toBeVisible();
      await page
        .getByRole("button", { name: "I’ve studied this word" })
        .click();
    } else if (mode === "Look, Cover, Spell, Check") {
      await page.getByRole("button", { name: "Cover the word" }).click();
      await page.getByLabel("Your spelling").fill("a");
      await page
        .getByRole("button", { name: "Check spelling", exact: true })
        .click();
    } else if (mode === "Mixed Training") {
      const study = page.getByRole("button", {
        name: "I’ve studied this word",
      });
      if (await study.isVisible()) await study.click();
      else {
        await page.getByLabel("Your spelling").fill("a");
        await page
          .getByRole("button", { name: "Check spelling", exact: true })
          .click();
      }
    } else {
      await page.getByLabel("Your spelling").fill("a");
      await page
        .getByRole("button", { name: "Check spelling", exact: true })
        .click();
    }
    await page.getByRole("button", { name: "See session results" }).click();
    await page.getByRole("button", { name: "Back to Spelling HQ" }).click();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("adult list editing, sentences, archive/reuse and transfer leave existing stars intact", async ({
  page,
}) => {
  await makeList(page, "dog");
  await adult(page);
  await page.getByRole("button", { name: "Edit words & sentences" }).click();
  await page.getByLabel("Word 1", { exact: true }).fill("school");
  await page.getByLabel("Sentence for word 1").fill("We walk to school.");
  await page.getByRole("button", { name: "Add word", exact: true }).click();
  await page.getByLabel("Word 2", { exact: true }).fill("little");
  await page.getByRole("button", { name: "Save list changes" }).click();
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export list", exact: true }).click();
  const download = await event;
  expect(download.suggestedFilename()).toBe("hero-academy-spelling-list.json");
  const exported = await readFile((await download.path())!, "utf8");
  expect(JSON.parse(exported).words).toEqual([
    { text: "school", sentence: "We walk to school." },
    { text: "little", sentence: "" },
  ]);
  await page.getByRole("button", { name: "Archive list", exact: true }).click();
  await page.getByRole("button", { name: "Reuse list", exact: true }).click();
  await page.getByRole("button", { name: "Archive list", exact: true }).click();
  await page.getByLabel("Import spelling list").setInputFiles({
    name: "codes.json",
    mimeType: "application/json",
    buffer: Buffer.from(exported),
  });
  await expect(
    page.getByText("Spelling list imported and made active."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Spelling HQ", exact: true }).click();
  await page.locator(".weekly-words > summary").click();
  await expect(page.getByText("school", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("little", { exact: true }).first()).toBeVisible();
  await expect(page.getByTestId("star-balance")).toHaveText("0");
});
test("speech-unavailable adult help stays assisted across a reload", async ({
  page,
}) => {
  await makeList(page, "balloon");
  await page.getByRole("button", { name: "Start Listen and Spell" }).click();
  await expect(page.locator("main")).not.toContainText("balloon");
  await page.getByRole("button", { name: "Hear word", exact: true }).click();
  await expect(
    page.getByText("Turn on spoken instructions in the grown-up zone.", {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Ask a grown-up to read", exact: true })
    .click();
  const n = (await page.getByTestId("adult-challenge").innerText())
    .match(/\d+/g)!
    .map(Number);
  await page.getByLabel("Grown-up answer").fill(String(n[0] * n[1]));
  await page
    .getByRole("button", { name: "Open reading card", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByText("balloon", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hide card & continue" }).click();
  await expect(page.locator("main")).not.toContainText("balloon");
  await page.reload();
  await page.getByRole("button", { name: "Spelling HQ", exact: true }).click();
  await page.getByRole("button", { name: "Resume spelling mission" }).click();
  await expect(
    page.getByText(
      "Adult-assisted turn · learning credit, not independent mastery",
    ),
  ).toBeVisible();
  await page.getByLabel("Your spelling").fill("balloon");
  await page
    .getByRole("button", { name: "Check spelling", exact: true })
    .click();
  const p = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("hero-academy:v1")!).weeklySpelling
        .progress.balloon,
  );
  expect(p.independentHistory).toEqual([]);
  expect(p.assisted.correct).toBe(1);
});
test("cover and missing-letter practice do not expose target words in example sentences", async ({
  page,
}) => {
  await makeList(page, "balloon");
  await adult(page);
  await page.getByRole("button", { name: "Edit words & sentences" }).click();
  await page.getByLabel("Sentence for word 1").fill("The balloon is red.");
  await page.getByRole("button", { name: "Save list changes" }).click();
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Spelling HQ", exact: true }).click();
  await page
    .getByRole("button", { name: "Start Look, Cover, Spell, Check" })
    .click();
  await page.getByRole("button", { name: "Cover the word" }).click();
  await expect(page.locator("main")).not.toContainText("balloon");
  await page.getByLabel("Your spelling").fill("balloon");
  await page
    .getByRole("button", { name: "Check spelling", exact: true })
    .click();
  await page.getByRole("button", { name: "See session results" }).click();
  await page.getByRole("button", { name: "Back to Spelling HQ" }).click();
  await page.getByRole("button", { name: "Start Missing Letters" }).click();
  await expect(page.locator("main")).not.toContainText("balloon");
});

test("correct test answers do not reveal correctness through stars or progress before the end", async ({
  page,
}) => {
  await makeList(page, "cat,dog");
  await page.getByRole("button", { name: "Start Practice Test" }).click();
  const target = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("hero-academy:v1")!).weeklySpelling
        .current.items[0].word.text,
  );
  await page.getByLabel("Your spelling").fill(target);
  await page.getByRole("button", { name: "Save test answer" }).click();
  await expect(page.getByText("Answer saved.", { exact: true })).toBeVisible();
  await expect(page.getByTestId("star-balance")).toHaveText("0");
  await page.reload();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hero-academy:v1")!),
  );
  expect(saved.weeklySpelling.progress).toEqual({});
  expect(saved.stats.spelling.attempts).toBe(0);
  await page.getByRole("button", { name: "Spelling HQ", exact: true }).click();
  await page.getByRole("button", { name: "Resume spelling mission" }).click();
  await page.getByLabel("Your spelling").fill("wrong");
  await page.getByRole("button", { name: "Save test answer" }).click();
  await expect(
    page.getByRole("heading", { name: "Practice test complete!" }),
  ).toBeVisible();
  await expect(page.getByText("1 of 2 correct", { exact: true })).toBeVisible();
  await expect(page.getByTestId("star-balance")).toHaveText("3");
});
