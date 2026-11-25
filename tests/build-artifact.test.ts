import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const folders: string[] = [];
afterEach(() => { for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true }); });
function fixture(html: string, script = true) {
  const root = mkdtempSync(join(tmpdir(), "hero-artifact-"));
  folders.push(root);
  mkdirSync(join(root, "assets"));
  writeFileSync(join(root, "index.html"), html);
  if (script) writeFileSync(join(root, "assets/index-example.js"), "console.log('test')");
  writeFileSync(join(root, "assets/index-example.css"), "body{color:white}");
  return spawnSync(process.execPath, [resolve("scripts/check-build.mjs"), root], { encoding: "utf8" });
}
const built = '<meta name="hero-build" content="test"><script type="module" src="/hero-academy/assets/index-example.js"></script><link rel="stylesheet" href="/hero-academy/assets/index-example.css">';
describe("production artifact guard", () => {
  it("rejects the raw Vite source responsible for the production outage", () => {
    const result = fixture('<div id="root"></div><script type="module" src="/src/main.tsx"></script>');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unbuilt source HTML must never be published");
  });
  it("accepts compiled assets under the GitHub Pages base", () => {
    expect(fixture(built).status).toBe(0);
  });
  it("rejects compiled HTML with missing modules", () => {
    expect(fixture(built, false).status).not.toBe(0);
  });
  it("rejects root-relative bundles outside the Pages base", () => {
    expect(fixture(built.replaceAll("/hero-academy/assets/", "/assets/")).status).not.toBe(0);
  });
});
