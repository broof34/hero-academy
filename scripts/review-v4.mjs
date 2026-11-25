import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const output = process.env.HERO_REVIEW_DIR || "/tmp/hero-academy-v4-review";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const issues = [];
const reviewUrl =
  process.env.HERO_REVIEW_URL || "http://127.0.0.1:5174/hero-academy/";
for (const [device, width, height] of [
  ["desktop", 1440, 960],
  ["tablet", 768, 1024],
  ["mobile", 390, 844],
]) {
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  page.on("pageerror", (e) => issues.push({ device, error: e.message }));
  page.on("requestfailed", (r) => issues.push({ device, request: r.url() }));
  page.on("response", (r) => {
    if (r.status() >= 400)
      issues.push({ device, status: r.status(), url: r.url() });
  });
  page.on("request", (r) => {
    if (
      r.url().startsWith("http") &&
      new URL(r.url()).origin !== new URL(reviewUrl).origin
    )
      issues.push({ device, external: r.url() });
  });
  await page.goto(reviewUrl);
  await page.evaluate(() => document.fonts.ready);
  if (process.env.HERO_AXE_PATH)
    await page.addScriptTag({ path: process.env.HERO_AXE_PATH });
  async function capture(name) {
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.evaluate(() => new Promise(requestAnimationFrame));
    if (process.env.HERO_AXE_PATH) {
      const violations = await page.evaluate(async () =>
        (
          await window.axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          })
        ).violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      );
      if (violations.length) issues.push({ device, name, violations });
    }
    await page.screenshot({
      path: `${output}/${device}-${name}.png`,
      fullPage: true,
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    if (overflow) issues.push({ device, name, overflow });
  }
  await capture("home");
  await page
    .getByRole("button", { name: "Audio settings", exact: true })
    .click();
  await capture("audio-settings");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await capture("learn");
  await page.getByRole("button", { name: "Start Math mission" }).click();
  await page.getByLabel("Choose a skill").selectOption("addition");
  await page.getByRole("button", { name: "Let’s go" }).click();
  await capture("math");
  for (let i = 0; i < 5; i++) {
    const n = (await page.getByTestId("equation").innerText())
      .match(/\d+/g)
      .map(Number);
    await page
      .getByRole("group", { name: "Answer choices" })
      .getByRole("button", { name: String(n[0] + n[1]), exact: true })
      .click();
    await page
      .getByRole("button", {
        name: i === 4 ? "Finish mission" : "Next question",
      })
      .click();
  }
  await capture("victory");
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Homework", exact: true }).click();
  await capture("homework");
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await capture("arcade");
  await page.getByRole("button", { name: "Rewards", exact: true }).click();
  await capture("rewards");
  await page.getByRole("button", { name: "Grown-ups", exact: true }).click();
  await capture("gate");
  const nums = (await page.getByTestId("adult-challenge").innerText())
    .match(/\d+/g)
    .map(Number);
  await page.getByLabel("Grown-up answer").fill(String(nums[0] * nums[1]));
  await page.getByRole("button", { name: "Unlock settings" }).click();
  await page.getByLabel("Spelling list name").fill("Friday words");
  await page
    .getByLabel("Paste spelling words")
    .fill("bright,light,night,flight,sight");
  await page.getByRole("button", { name: "Create spelling list" }).click();
  await capture("grown-ups");
  await page.locator(".adult-audio > summary").click();
  await capture("grown-up-audio");
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Spelling HQ", exact: true }).click();
  await capture("spelling");
  await page.getByRole("button", { name: "Start Word Builder" }).click();
  await capture("spelling-practice");
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Start Reading mission" }).click();
  await page.getByLabel("Choose a skill").selectOption("passage");
  await page.getByRole("button", { name: "Let’s go" }).click();
  await capture("reading");
  if (device === "mobile") {
    await page.getByRole("button", { name: "Home", exact: true }).click();
    await page.setViewportSize({ width: 320, height: 740 });
    await capture("320-home");
    await page.getByRole("button", { name: "Grown-ups", exact: true }).click();
    const n = (await page.getByTestId("adult-challenge").innerText())
      .match(/\d+/g)
      .map(Number);
    await page.getByLabel("Grown-up answer").fill(String(n[0] * n[1]));
    await page.getByRole("button", { name: "Unlock settings" }).click();
    await capture("320-grown-ups");
  }
  await page.close();
}
await browser.close();
console.log(JSON.stringify({ output, issues }, null, 2));
if (issues.length) process.exitCode = 1;
