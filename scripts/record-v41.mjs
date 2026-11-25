import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const output = process.env.HERO_REVIEW_DIR || "/tmp/hero-academy-v41-review";
await mkdir(`${output}/frames`, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
  viewport: { width: 1100, height: 850 },
  reducedMotion: "no-preference",
});
await page.goto(
  process.env.HERO_REVIEW_URL || "http://127.0.0.1:5174/hero-academy/",
);
await page.evaluate(() => document.fonts.ready);
let frame = 0;
let perf = [];
async function sequence(name, count = 8) {
  for (let i = 0; i < count; i++) {
    await page.screenshot({
      path: `${output}/frames/frame-${String(frame++).padStart(3, "0")}.png`,
    });
    if (i === 2) await page.screenshot({ path: `${output}/${name}.png` });
    await page.waitForTimeout(55);
  }
}
for (let mission = 0; mission < 2; mission++) {
  await page.getByRole("button", { name: "Start Math mission" }).click();
  await page.getByLabel("Choose a skill").selectOption("addition");
  await page.getByRole("button", { name: "Let’s go" }).click();
  for (let i = 0; i < 5; i++) {
    const number = mission * 5 + i + 1;
    const n = (await page.getByTestId("equation").innerText())
      .match(/\d+/g)
      .map(Number);
    await page
      .getByRole("group", { name: "Answer choices" })
      .getByRole("button", { name: String(n[0] + n[1]), exact: true })
      .click();
    if ([1, 3, 5, 10].includes(number)) await sequence(`impact-${number}`);
    if (number === 2) {
      perf = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const t = performance.now(),
              samples = [];
            let last = t;
            function tick(now) {
              samples.push(now - last);
              last = now;
              if (now - t < 1000) requestAnimationFrame(tick);
              else resolve(samples);
            }
            requestAnimationFrame(tick);
          }),
      );
    }
    await page
      .getByRole("button", {
        name: i === 4 ? "Finish mission" : "Next question",
      })
      .click();
  }
  await sequence(`victory-${mission + 1}`, 10);
  await page.getByRole("button", { name: "Back to base" }).click();
}
const sorted = perf.slice(1).sort((a, b) => a - b);
await writeFile(
  `${output}/animation-metrics.json`,
  JSON.stringify(
    {
      frames: frame,
      rafSamples: sorted.length,
      meanIntervalMs: sorted.reduce((a, b) => a + b, 0) / sorted.length,
      p95IntervalMs: sorted[Math.floor(sorted.length * 0.95)],
      remainingEffectLayers: await page.locator(".effect-layer").count(),
    },
    null,
    2,
  ),
);
await browser.close();
console.log(JSON.stringify({ output, frames: frame }));
