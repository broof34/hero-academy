import { expect, test, type Page } from "@playwright/test";

const key = "hero-academy:v1";
const additions = [
  ["Rooftop Rush", "rooftop"],
  ["Power Smash", "smash"],
  ["Hero Flight", "flight"],
  ["Power Merge", "merge"],
] as const;

function saved(page: Page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key);
}

async function openArcade(page: Page) {
  await page.addInitScript((key) => {
    if (self !== top || localStorage.getItem(key)) return;
    localStorage.setItem(key, JSON.stringify({
      version: 1, stars: 12, totalStars: 20, tickets: 2,
      settings: { gameMinutes: 1, effectsSound: true },
    }));
  }, key);
  await page.goto("./");
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await expect(page.locator(".arcade-grid article")).toHaveCount(6);
}

async function launch(page: Page, title: string) {
  await page.getByRole("button", { name: `Play ${title}`, exact: true }).click();
  const preview = page.getByRole("img", { name: `${title} actual gameplay` });
  await expect.poll(() => preview.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Launch game · 1 ticket" }).click();
  const iframe = page.locator(`iframe[title="${title}"]`);
  await expect(iframe).toBeVisible();
  return iframe.contentFrame();
}

for (const [width, height] of [[390, 844], [768, 1024], [1280, 900]]) {
  const touch = width < 1000;
  test.describe(`arcade at ${width}px`, () => {
    test.use({ viewport: { width, height }, hasTouch: touch, reducedMotion: touch ? "reduce" : "no-preference" });

    for (const [title, id] of additions) {
      test(`${title} plays, retries and keeps the paid deadline`, async ({ page }) => {
        const faults: string[] = [];
        page.on("pageerror", (error) => faults.push(error.message));
        page.on("console", (msg) => { if (msg.type() === "error") faults.push(msg.text()); });
        page.on("requestfailed", (req) => {
          if (/^https?:/.test(req.url())) faults.push(req.url());
        });
        const origin = new URL(test.info().project.use.baseURL!).origin;
        page.on("request", (req) => {
          if (/^https?:/.test(req.url()) && new URL(req.url()).origin !== origin)
            faults.push(`External request: ${req.url()}`);
        });
        page.on("response", (res) => { if (res.status() >= 400) faults.push(`${res.status()} ${res.url()}`); });

        if (id === "merge") {
          await page.addInitScript(() => {
            if (!location.pathname.endsWith("/games/merge/index.html")) return;
            let seed = 412;
            Math.random = () => {
              seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
              return seed / 2 ** 32;
            };
          });
        }
        await page.clock.install();
        await openArcade(page);
        const frame = await launch(page, title);
        await expect(page.getByText(/Controls stay inside your game/)).toBeVisible();
        const clock = page.getByLabel("Game time remaining");
        const paid = await saved(page);
        expect(paid).toMatchObject({ tickets: 1, stars: 12, totalStars: 20, session: { game: id } });

        await page.getByRole("button", { name: "Mute game", exact: true }).click();
        await expect(page.getByRole("button", { name: "Unmute game", exact: true })).toBeVisible();
        const body = frame.locator("body");
        if (touch) await expect(body).toHaveClass(/reduced/);
        await page.getByRole("button", { name: "Pause game", exact: true }).click();
        await expect(body).toHaveClass(/paused/);
        const beforePause = await clock.innerText();
        await page.clock.fastForward(2100);
        await expect(clock).not.toHaveText(beforePause);
        await page.getByRole("button", { name: "Resume game", exact: true }).last().click();
        await expect(body).not.toHaveClass(/paused/);

        const field = frame.locator("#field, #board");
        const points = frame.locator("#score");
        const retry = frame.getByRole("button", { name: "Try again" });
        expect(await body.evaluate((el) => el.scrollWidth <= innerWidth)).toBe(true);

        if (id === "merge") {
          if (touch) {
            await field.scrollIntoViewIfNeeded();
            const box = (await field.boundingBox())!;
            const cdp = await page.context().newCDPSession(page);
            const x = box.x + box.width * .72, y = box.y + box.height * .53;
            await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
            await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - 60, y }] });
            await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
            await cdp.detach();
          } else {
            await field.focus();
            await page.keyboard.press("ArrowLeft");
          }
          await expect(points).toHaveText("4");
          await expect(frame.getByRole("gridcell", { name: "4, Bolt" })).toHaveCount(1);
          // Drive the actual arrow handlers until the board runs out of legal moves.
          await field.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-direction]"));
            for (let i = 0; i < 1400 && document.querySelector<HTMLDivElement>("#prompt")!.hidden; i++) {
              buttons[i % buttons.length].click();
            }
          });
          await expect(retry).toBeVisible();
          if (touch) await retry.tap();
          else await retry.press("Enter");
          await expect(points).toHaveText("0");
          await expect(frame.getByRole("gridcell", { name: "2, Spark" })).toHaveCount(2);
        } else {
          const action = frame.locator("#action");
          const press = async () => {
            if (touch) await action.tap();
            else await page.keyboard.press("Space");
          };
          if (!touch) await field.focus();
          // Freeze wall-clock time while we drive the real iframe simulation in exact increments.
          await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 2000));
          if (id === "smash") {
            if (touch) await frame.getByRole("button", { name: "Move right" }).tap();
            else {
              const before = await field.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
              await page.keyboard.press("ArrowRight");
              const after = await field.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
              expect(after).not.toEqual(before);
            }
          }
          await press();
          if (id === "rooftop") {
            await page.clock.runFor(1460);
            await press();
            await page.clock.runFor(550);
          } else if (id === "flight") {
            for (let boost = 0; boost < 3; boost++) {
              await page.clock.runFor(1000);
              await press();
            }
            await page.clock.runFor(150);
          } else {
            await page.clock.runFor(760);
          }
          await expect.poll(async () => Number(await points.textContent())).toBeGreaterThan(0);
          const pause = page.getByRole("button", { name: "Pause game", exact: true });
          await pause.click();
          await expect(body).toHaveClass(/paused/);
          const frozen = await field.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
          await page.clock.runFor(320);
          expect(await field.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(frozen);
          await page.getByRole("button", { name: "Resume game", exact: true }).last().click();
          await expect(body).not.toHaveClass(/paused/);
          if (id === "smash") {
            // Leave the shield along the right wall so the descending ball falls past it.
            const fieldSize = (await field.boundingBox())!;
            const position = { x: fieldSize.width - 10, y: fieldSize.height - 20 };
            if (touch) await field.tap({ position });
            else await field.click({ position });
            await page.clock.runFor(2200);
            for (const remaining of [2, 1]) {
              await expect(frame.locator("#detail")).toContainText(`${remaining} ball`);
              await press();
              await page.clock.runFor(3200);
            }
          } else await page.clock.runFor(4400);
          await expect(retry).toBeVisible();
          if (touch) await retry.tap();
          else await retry.press("Enter");
          await expect(points).toHaveText("0");
          await expect(retry).toBeHidden();
          await page.clock.resume();
        }

        expect(await saved(page)).toMatchObject({ tickets: 1, stars: 12, session: paid.session });
        await page.reload();
        await expect(page.locator(`iframe[title="${title}"]`)).toBeVisible();
        expect(await saved(page)).toMatchObject({ tickets: 1, session: paid.session });
        if (width === 1280) {
          await page.getByRole("button", { name: "Finish playing" }).click();
        } else {
          const stamp = await page.evaluate(() => Date.now());
          const warning = Math.max(210, paid.session.endsAt - stamp - 24000);
          await page.clock.fastForward(warning);
          await expect(page.getByRole("alert").filter({ hasText: /seconds left/ })).toBeVisible();
          await page.clock.fastForward(31000);
        }
        await expect(page.locator("iframe")).toHaveCount(0);
        await expect.poll(() => saved(page)).toMatchObject({ tickets: 1, stars: 12, session: null });
        expect(faults).toEqual([]);
      });
    }
  });
}

test("new arcade effects follow the session mute and pause controls", async ({ page }) => {
  await page.addInitScript(() => {
    if (!location.pathname.endsWith("/games/merge/index.html")) return;
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      createGain() {
        const gain = super.createGain();
        const instrumented = window as Window & { gameEffects?: GainNode };
        instrumented.gameEffects ??= gain;
        return gain;
      }

      createOscillator() {
        const oscillator = super.createOscillator();
        const start = oscillator.start.bind(oscillator);
        const instrumented = window as Window & { gameNotes?: number };
        oscillator.start = (when) => {
          start(when);
          instrumented.gameNotes = (instrumented.gameNotes ?? 0) + 1;
        };
        return oscillator;
      }
    };
  });
  await openArcade(page);
  const frame = await launch(page, "Power Merge");
  await expect(page.getByText(/Controls stay inside your game/)).toBeVisible();
  await frame.getByRole("button", { name: "Move left" }).click();
  await expect(frame.locator("#score")).toHaveText("4");
  await expect.poll(() => frame.locator("body").evaluate(() =>
    (window as Window & { gameNotes?: number }).gameNotes,
  )).toBe(1);
  const gain = () => frame.locator("body").evaluate(() =>
    (window as Window & { gameEffects?: GainNode }).gameEffects?.gain.value,
  );
  await expect.poll(gain).toBeCloseTo(.45);
  await page.getByRole("button", { name: "Mute game", exact: true }).click();
  await expect.poll(gain).toBe(0);
  await page.getByRole("button", { name: "Unmute game", exact: true }).click();
  await expect.poll(gain).toBeCloseTo(.45);
  await page.getByRole("button", { name: "Pause game", exact: true }).click();
  await expect.poll(gain).toBe(0);
});
